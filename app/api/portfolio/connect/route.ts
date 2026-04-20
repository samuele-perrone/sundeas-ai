import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateKey, getPortfolio, getCash, tickerDisplay } from "@/lib/t212";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { apiKey, apiSecret, name } = await request.json();
  if (!apiKey?.trim()) {
    return NextResponse.json({ error: "API key is required" }, { status: 400 });
  }

  const key = apiKey.trim();
  const secret = apiSecret?.trim() || undefined;

  const admin = createAdminClient();

  // Ensure profile exists (users who signed up before schema was applied won't have one)
  await admin.from("profiles").upsert(
    { id: user.id, display_name: user.user_metadata?.full_name ?? null },
    { onConflict: "id" }
  );

  // Validate against T212 — pass through the real error so we can debug
  try {
    await validateKey(key, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error"
    console.error("T212 validation failed:", msg)
    return NextResponse.json({ error: `Could not connect to Trading 212: ${msg}` }, { status: 400 });
  }

  const { data: portfolio, error: portfolioError } = await admin
    .from("portfolios")
    .upsert(
      {
        user_id: user.id,
        name: name || "My Trading 212 Portfolio",
        source: "trading212",
        t212_api_key: key,
        t212_api_secret: secret ?? null,
      },
      { onConflict: "user_id,source" }
    )
    .select("id")
    .single();

  if (portfolioError) {
    console.error("Portfolio upsert error:", portfolioError);
    return NextResponse.json({ error: "Failed to save portfolio" }, { status: 500 });
  }

  try {
    const [positions, cash] = await Promise.all([
      getPortfolio(key, secret),
      getCash(key, secret),
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

    return NextResponse.json({ ok: true, portfolioId: portfolio.id, totalValue: cash.invested + cash.free, count: positions.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("T212 sync error:", msg);
    return NextResponse.json({ ok: true, portfolioId: portfolio.id, syncError: true, syncErrorMsg: msg });
  }
}
