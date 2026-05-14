import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata = { title: "Dashboard — Sundeas AI" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: portfolio }, { data: progress }] = await Promise.all([
    supabase
      .from("portfolios")
      .select("id, name")
      .eq("user_id", user!.id)
      .single(),
    supabase
      .from("user_module_progress")
      .select("module_id")
      .eq("user_id", user!.id),
  ]);

  const { data: latestInsight } = portfolio
    ? await supabase
        .from("insights")
        .select("generated_at")
        .eq("portfolio_id", portfolio.id)
        .order("generated_at", { ascending: false })
        .limit(1)
        .single()
    : { data: null };

  const name = user!.user_metadata?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Hey {name} 👋
        </h1>
        <p className="mt-1 text-[var(--muted)]">Here&apos;s your Sundeas AI overview.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Portfolio card */}
        <Link
          href={portfolio ? "/portfolio" : "/portfolio/connect"}
          className="group flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 transition-shadow hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-2xl">📊</span>
            <span className="text-xs font-medium text-[var(--accent)]">
              {portfolio ? "Connected" : "Not connected"}
            </span>
          </div>
          <div>
            <h2 className="font-semibold text-[var(--foreground)]">Portfolio</h2>
            <p className="mt-0.5 text-sm text-[var(--muted)]">
              {portfolio
                ? `${portfolio.name} — tap to view your holdings`
                : "Connect your Trading 212 account to get started"}
            </p>
            {latestInsight?.generated_at && (
              <p className="mt-1 text-xs text-[var(--muted)]">
                Last briefing:{" "}
                {new Date(latestInsight.generated_at).toLocaleString("en-GB", {
                  day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                })}
              </p>
            )}
          </div>
          <span className="text-sm font-medium text-[var(--accent)] group-hover:underline">
            {portfolio ? "View portfolio →" : "Connect now →"}
          </span>
        </Link>

        {/* Learn card */}
        <Link
          href="/learn"
          className="group flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 transition-shadow hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-2xl">📚</span>
            <span className="text-xs font-medium text-[var(--muted)]">
              {progress?.length ?? 0} completed
            </span>
          </div>
          <div>
            <h2 className="font-semibold text-[var(--foreground)]">Learn</h2>
            <p className="mt-0.5 text-sm text-[var(--muted)]">
              Plain-English guides on ETFs, ISAs, diversification, and more.
            </p>
          </div>
          <span className="text-sm font-medium text-[var(--accent)] group-hover:underline">
            Start learning →
          </span>
        </Link>

        {/* AI insights card */}
        <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 opacity-60">
          <div className="flex items-center justify-between">
            <span className="text-2xl">✨</span>
            <span className="text-xs font-medium text-[var(--muted)]">Coming soon</span>
          </div>
          <div>
            <h2 className="font-semibold text-[var(--foreground)]">AI Insights</h2>
            <p className="mt-0.5 text-sm text-[var(--muted)]">
              Plain-English observations about your portfolio based on market context.
            </p>
          </div>
          <span className="text-sm text-[var(--muted)]">Available once connected</span>
        </div>
      </div>

      {!portfolio && (
        <div className="mt-8 rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-6">
          <h3 className="font-semibold text-[var(--foreground)]">Get started in 2 minutes</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Connect your Trading 212 account with a read-only API key and Sundeas AI
            will show you your holdings, allocation, and P&amp;L in one place.
          </p>
          <Link
            href="/portfolio/connect"
            className="mt-4 inline-block rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Connect Trading 212 →
          </Link>
        </div>
      )}
    </div>
  );
}
