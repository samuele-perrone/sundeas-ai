import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateDailyInsight, type HoldingSummary } from "@/lib/insights";
import { dailyDigestEmail } from "@/lib/emails/daily-digest";
import { tickerDisplay } from "@/lib/t212";
import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

// Temporary — sends a test digest to the logged-in user. DELETE after confirming email works.
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const admin = createAdminClient();

  const { data: portfolio } = await admin
    .from("portfolios")
    .select("id, name")
    .eq("user_id", user.id)
    .eq("source", "trading212")
    .single();

  if (!portfolio) return NextResponse.json({ error: "No portfolio found" }, { status: 404 });

  const { data: rawHoldings } = await admin
    .from("holdings")
    .select("ticker, name, quantity, avg_buy_price, current_price, target_weight")
    .eq("portfolio_id", portfolio.id);

  if (!rawHoldings?.length) return NextResponse.json({ error: "No holdings" }, { status: 404 });

  const totalValue = rawHoldings.reduce((sum, h) => sum + h.quantity * (h.current_price ?? 0), 0);
  const totalPnl = rawHoldings.reduce(
    (sum, h) => sum + h.quantity * ((h.current_price ?? 0) - (h.avg_buy_price ?? 0)), 0
  );

  const holdingSummaries: HoldingSummary[] = rawHoldings.map((h) => {
    const value = h.quantity * (h.current_price ?? 0);
    const allocationPct = totalValue > 0 ? (value / totalValue) * 100 : 0;
    const pnlPct = h.avg_buy_price
      ? (((h.current_price ?? 0) - h.avg_buy_price) / h.avg_buy_price) * 100
      : 0;
    return {
      ticker: h.ticker,
      name: h.name ?? tickerDisplay(h.ticker),
      quantity: h.quantity,
      avgBuyPrice: h.avg_buy_price ?? 0,
      currentPrice: h.current_price ?? 0,
      value,
      allocationPct,
      pnlPct,
      targetWeight: h.target_weight ?? null,
    };
  }).sort((a, b) => b.value - a.value);

  const date = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  let insight;
  try {
    insight = await generateDailyInsight(holdingSummaries, totalValue);
  } catch (err) {
    return NextResponse.json({ error: "Claude failed", detail: String(err) }, { status: 500 });
  }

  const userEmail = user.email;
  if (!userEmail) return NextResponse.json({ error: "No email on account" }, { status: 400 });

  const { data: sendData, error: sendError } = await resend.emails.send({
    from: FROM,
    to: userEmail,
    subject: `[Test] Your portfolio briefing — ${date}`,
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

  if (sendError) {
    return NextResponse.json({ error: "Resend failed", detail: sendError }, { status: 500 });
  }

  return NextResponse.json({ ok: true, sentTo: userEmail, resendId: sendData?.id, insight });
}
