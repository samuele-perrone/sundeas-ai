import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateKey, getPortfolio, getCash, tickerDisplay } from "@/lib/t212";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { apiKey, name } = await request.json();
  if (!apiKey?.trim()) {
    return NextResponse.json({ error: "API key is required" }, { status: 400 });
  }

  // Validate the key against T212
  try {
    await validateKey(apiKey.trim());
  } catch {
    return NextResponse.json({ error: "Invalid API key — check it is a read-only key from Trading 212" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Upsert portfolio (one T212 portfolio per user for now)
  const { data: portfolio, error: portfolioError } = await admin
    .from("portfolios")
    .upsert(
      {
        user_id: user.id,
        name: name || "My Trading 212 Portfolio",
        source: "trading212",
        t212_api_key: apiKey.trim(),
      },
      { onConflict: "user_id,source" }
    )
    .select("id")
    .single();

  if (portfolioError) {
    console.error("Portfolio upsert error:", portfolioError);
    return NextResponse.json({ error: "Failed to save portfolio" }, { status: 500 });
  }

  // Sync initial holdings
  try {
    const [positions, cash] = await Promise.all([
      getPortfolio(apiKey.trim()),
      getCash(apiKey.trim()),
    ]);

    const totalValue = cash.invested + cash.free;

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

    return NextResponse.json({ ok: true, portfolioId: portfolio.id, totalValue, count: positions.length });
  } catch (err) {
    console.error("T212 sync error:", err);
    // Portfolio is saved — sync can be retried, not a fatal error
    return NextResponse.json({ ok: true, portfolioId: portfolio.id, syncError: true });
  }
}
