import { createAdminClient } from "@/lib/supabase/admin";
import { getPortfolio, getCash, tickerDisplay } from "@/lib/t212";
import { NextRequest, NextResponse } from "next/server";

// Cron job — runs every Monday 9am UTC (vercel.json)
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: portfolios } = await admin
    .from("portfolios")
    .select("id, t212_api_key")
    .eq("source", "trading212")
    .not("t212_api_key", "is", null);

  if (!portfolios?.length) return NextResponse.json({ ok: true, synced: 0 });

  let synced = 0;
  let errors = 0;

  for (const portfolio of portfolios) {
    try {
      const [positions] = await Promise.all([
        getPortfolio(portfolio.t212_api_key!),
        getCash(portfolio.t212_api_key!),
      ]);

      const holdingsToUpsert = positions.map((pos) => ({
        portfolio_id: portfolio.id,
        ticker: pos.ticker,
        name: tickerDisplay(pos.ticker),
        quantity: pos.quantity,
        avg_buy_price: pos.averagePrice,
        current_price: pos.currentPrice,
        last_synced_at: new Date().toISOString(),
      }));

      if (holdingsToUpsert.length > 0) {
        await admin
          .from("holdings")
          .upsert(holdingsToUpsert, { onConflict: "portfolio_id,ticker" });
      }
      synced++;
    } catch (err) {
      console.error(`Sync failed for portfolio ${portfolio.id}:`, err);
      errors++;
    }
  }

  return NextResponse.json({ ok: true, synced, errors });
}
