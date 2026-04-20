import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import SyncButton from "@/app/components/SyncButton";
import DisconnectButton from "@/app/components/DisconnectButton";

export const metadata = { title: "Portfolio — Sundeas AI" };

export default async function PortfolioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("id, name, source")
    .eq("user_id", user!.id)
    .eq("source", "trading212")
    .single();

  if (!portfolio) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <div className="text-4xl">📊</div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">No portfolio connected</h1>
        <p className="max-w-sm text-[var(--muted)]">
          Connect your Trading 212 account to start tracking your holdings.
        </p>
        <Link
          href="/portfolio/connect"
          className="rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Connect Trading 212 →
        </Link>
      </div>
    );
  }

  const { data: holdings } = await supabase
    .from("holdings")
    .select("id, ticker, name, quantity, avg_buy_price, current_price, target_weight, last_synced_at")
    .eq("portfolio_id", portfolio.id)
    .order("current_price", { ascending: false });

  const totalValue = (holdings ?? []).reduce(
    (sum, h) => sum + h.quantity * (h.current_price ?? 0),
    0
  );

  const lastSync = holdings?.[0]?.last_synced_at
    ? new Date(holdings[0].last_synced_at).toLocaleString("en-GB", {
        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
      })
    : null;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">{portfolio.name}</h1>
          {lastSync && (
            <p className="mt-1 text-xs text-[var(--muted)]">Last synced {lastSync}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <DisconnectButton portfolioId={portfolio.id} />
          <SyncButton portfolioId={portfolio.id} />
        </div>
      </div>

      {/* Summary cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs font-medium text-[var(--muted)]">Total value</p>
          <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">
            £{totalValue.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs font-medium text-[var(--muted)]">Holdings</p>
          <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">
            {holdings?.length ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs font-medium text-[var(--muted)]">Total P&amp;L</p>
          <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">
            {(() => {
              const pnl = (holdings ?? []).reduce((sum, h) => {
                const cost = h.quantity * (h.avg_buy_price ?? 0);
                const value = h.quantity * (h.current_price ?? 0);
                return sum + (value - cost);
              }, 0);
              const sign = pnl >= 0 ? "+" : "";
              return (
                <span className={pnl >= 0 ? "text-emerald-600" : "text-red-600"}>
                  {sign}£{Math.abs(pnl).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              );
            })()}
          </p>
        </div>
      </div>

      {/* Holdings table */}
      {holdings && holdings.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--muted)]">Ticker</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-[var(--muted)]">Quantity</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-[var(--muted)]">Current price</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-[var(--muted)]">Value</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-[var(--muted)]">Allocation</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-[var(--muted)]">P&amp;L</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h, i) => {
                const value = h.quantity * (h.current_price ?? 0);
                const alloc = totalValue > 0 ? (value / totalValue) * 100 : 0;
                const pnl = h.quantity * ((h.current_price ?? 0) - (h.avg_buy_price ?? 0));
                const pnlPct = h.avg_buy_price
                  ? (((h.current_price ?? 0) - h.avg_buy_price) / h.avg_buy_price) * 100
                  : 0;
                const drift = h.target_weight ? alloc - h.target_weight : null;

                return (
                  <tr
                    key={h.id}
                    className={`border-b border-[var(--border)] last:border-0 ${i % 2 === 1 ? "bg-[var(--background)]/40" : ""}`}
                  >
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-[var(--foreground)]">{h.name ?? h.ticker}</span>
                      <span className="ml-2 text-xs text-[var(--muted)]">{h.ticker}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-[var(--foreground)]">
                      {h.quantity.toLocaleString("en-GB", { maximumFractionDigits: 4 })}
                    </td>
                    <td className="px-5 py-3.5 text-right text-[var(--foreground)]">
                      £{(h.current_price ?? 0).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-[var(--foreground)]">
                      £{value.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-[var(--foreground)]">{alloc.toFixed(1)}%</span>
                      {drift !== null && (
                        <span className={`ml-2 text-xs ${Math.abs(drift) > 5 ? "text-red-500" : "text-[var(--muted)]"}`}>
                          ({drift > 0 ? "+" : ""}{drift.toFixed(1)}%)
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={pnl >= 0 ? "text-emerald-600" : "text-red-600"}>
                        {pnl >= 0 ? "+" : ""}£{Math.abs(pnl).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className={`ml-1 text-xs ${pnlPct >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        ({pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%)
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-[var(--muted)]">No holdings found. Try syncing your portfolio.</p>
      )}

      <p className="mt-6 text-xs text-[var(--muted)]">
        Prices are updated when you sync. This is not financial advice.
      </p>
    </div>
  );
}
