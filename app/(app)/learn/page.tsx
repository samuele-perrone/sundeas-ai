import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Learn — Sundeas AI" };

const MODULES = [
  {
    slug: "what-is-an-etf",
    title: "What is an ETF?",
    summary: "Learn what Exchange Traded Funds are, how they work, and why millions of investors use them.",
    tags: ["beginner", "etf"],
    readTime: "5 min",
  },
  {
    slug: "what-is-an-isa",
    title: "What is a Stocks & Shares ISA?",
    summary: "Understand the UK's most tax-efficient investment account and how to make the most of your annual allowance.",
    tags: ["beginner", "isa", "uk"],
    readTime: "4 min",
  },
  {
    slug: "diversification",
    title: "How diversification reduces risk",
    summary: "Why spreading your investments across many assets is one of the most powerful things you can do.",
    tags: ["beginner", "risk"],
    readTime: "5 min",
  },
  {
    slug: "time-horizon",
    title: "Why your time horizon matters",
    summary: "How long you plan to invest changes everything — from what you buy to how you react to market drops.",
    tags: ["beginner", "strategy"],
    readTime: "4 min",
  },
  {
    slug: "fund-factsheet",
    title: "How to read a fund factsheet",
    summary: "Demystifying the numbers and terms you'll see when researching any ETF or fund.",
    tags: ["intermediate", "etf"],
    readTime: "6 min",
  },
  {
    slug: "cash-vs-investing",
    title: "Why cash savings often lose value",
    summary: "The real cost of keeping money in a savings account when inflation is higher than your interest rate.",
    tags: ["beginner", "fundamentals"],
    readTime: "3 min",
  },
];

const TAG_COLOURS: Record<string, string> = {
  beginner: "bg-emerald-50 text-emerald-700",
  intermediate: "bg-amber-50 text-amber-700",
  etf: "bg-blue-50 text-blue-700",
  isa: "bg-purple-50 text-purple-700",
  uk: "bg-red-50 text-red-700",
  risk: "bg-orange-50 text-orange-700",
  strategy: "bg-sky-50 text-sky-700",
  fundamentals: "bg-gray-100 text-gray-600",
};

export default async function LearnPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: progress } = await supabase
    .from("user_module_progress")
    .select("module_id")
    .eq("user_id", user!.id);

  // For now modules are hardcoded — they'll move to the DB when content is written
  const completedSlugs = new Set((progress ?? []).map((p) => p.module_id));

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Learn</h1>
        <p className="mt-1 text-[var(--muted)]">
          Everything you need to invest with confidence — no jargon, no assumptions.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((mod) => (
          <div
            key={mod.slug}
            className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6"
          >
            <div className="flex flex-wrap gap-1.5">
              {mod.tags.map((tag) => (
                <span
                  key={tag}
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${TAG_COLOURS[tag] ?? "bg-gray-100 text-gray-600"}`}
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex-1">
              <h2 className="font-semibold text-[var(--foreground)]">{mod.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">{mod.summary}</p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--muted)]">{mod.readTime} read</span>
              <span className="rounded-lg bg-[var(--background)] px-3 py-1.5 text-xs font-medium text-[var(--muted)]">
                Coming soon
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-10 text-center text-sm text-[var(--muted)]">
        More modules coming soon. Topics are based on the most common questions from beginner investors.
      </p>
    </div>
  );
}
