import { createAdminClient } from "@/lib/supabase/admin";
import { getPortfolio, getCash, tickerDisplay } from "@/lib/t212";
import { generateDailyInsight, type HoldingSummary } from "@/lib/insights";
import { dailyDigestEmail } from "@/lib/emails/daily-digest";
import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

// Cron job — runs daily at 9am UTC (vercel.json)

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Load all T212 portfolios
  const { data: portfolios } = await admin
    .from("portfolios")
    .select("id, name, user_id, t212_api_key")
    .eq("source", "trading212")
    .not("t212_api_key", "is", null);

  if (!portfolios?.length) return NextResponse.json({ ok: true, synced: 0 });

  let synced = 0;
  let errors = 0;

  const date = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  for (const portfolio of portfolios) {
    try {
      const [positions, cash] = await Promise.all([
        getPortfolio(portfolio.t212_api_key!),
        getCash(portfolio.t212_api_key!),
      ]);

      // Upsert holdings
      const now = new Date().toISOString();
      const holdingsToUpsert = positions.map((pos) => ({
        portfolio_id: portfolio.id,
        ticker: pos.ticker,
        name: tickerDisplay(pos.ticker),
        quantity: pos.quantity,
        avg_buy_price: pos.averagePrice,
        current_price: pos.currentPrice,
        last_synced_at: now,
      }));

      if (holdingsToUpsert.length > 0) {
        await admin
          .from("holdings")
          .upsert(holdingsToUpsert, { onConflict: "portfolio_id,ticker" });
      }

      // Fetch target weights for drift calculation
      const { data: savedHoldings } = await admin
        .from("holdings")
        .select("ticker, target_weight")
        .eq("portfolio_id", portfolio.id);

      const targetMap = Object.fromEntries(
        (savedHoldings ?? []).map((h) => [h.ticker, h.target_weight])
      );

      // Build summary for AI
      const totalValue = positions.reduce(
        (sum, p) => sum + p.quantity * p.currentPrice, 0
      );
      const totalPnl = positions.reduce(
        (sum, p) => sum + p.quantity * (p.currentPrice - p.averagePrice), 0
      );

      const holdingSummaries: HoldingSummary[] = positions.map((pos) => {
        const value = pos.quantity * pos.currentPrice;
        const allocationPct = totalValue > 0 ? (value / totalValue) * 100 : 0;
        const pnlPct = pos.averagePrice > 0
          ? ((pos.currentPrice - pos.averagePrice) / pos.averagePrice) * 100
          : 0;
        return {
          ticker: pos.ticker,
          name: tickerDisplay(pos.ticker),
          quantity: pos.quantity,
          avgBuyPrice: pos.averagePrice,
          currentPrice: pos.currentPrice,
          value,
          allocationPct,
          pnlPct,
          targetWeight: targetMap[pos.ticker] ?? null,
        };
      }).sort((a, b) => b.value - a.value);

      // Generate AI insight
      const insight = await generateDailyInsight(holdingSummaries, totalValue);

      // Resolve user email via admin auth API
      const { data: { user: authUser } } = await admin.auth.admin.getUserById(portfolio.user_id);
      const userEmail = authUser?.email;
      if (userEmail) {
        await resend.emails.send({
          from: FROM,
          to: userEmail,
          subject: `Your portfolio briefing — ${date}`,
          html: dailyDigestEmail({
            portfolioName: portfolio.name,
            totalValue,
            totalPnl,
            holdings: holdingSummaries,
            insight,
            appUrl: APP_URL,
            date,
          }),
        });
      }

      synced++;
    } catch (err) {
      console.error(`Sync failed for portfolio ${portfolio.id}:`, err);
      errors++;
    }
  }

  return NextResponse.json({ ok: true, synced, errors });
}
