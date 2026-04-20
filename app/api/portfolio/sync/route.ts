import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPortfolio, getCash, tickerDisplay } from "@/lib/t212";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { portfolioId } = await request.json();

  const admin = createAdminClient();

  const { data: portfolio } = await admin
    .from("portfolios")
    .select("id, t212_api_key")
    .eq("id", portfolioId)
    .eq("user_id", user.id)
    .single();

  if (!portfolio?.t212_api_key) {
    return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
  }

  try {
    const [positions, cash] = await Promise.all([
      getPortfolio(portfolio.t212_api_key),
      getCash(portfolio.t212_api_key),
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

    return NextResponse.json({ ok: true, cash, count: positions.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Sync error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
