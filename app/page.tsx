import WaitlistForm from "@/app/components/WaitlistForm";

const steps = [
  {
    step: "01",
    title: "Learn the basics",
    body: "Short plain-English guides explain what ETFs, ISAs, and diversification actually mean — no jargon, no assumptions.",
  },
  {
    step: "02",
    title: "Connect your portfolio",
    body: "Link your Trading 212 account or enter holdings manually. Sundeas AI never touches your money — read-only, always.",
  },
  {
    step: "03",
    title: "Get AI insights",
    body: "See how your portfolio is positioned and what investors in similar situations typically consider — information, not advice.",
  },
];

const topics = [
  "What is an ETF and why do people use them?",
  "What is a Stocks & Shares ISA?",
  "How does diversification reduce risk?",
  "What does your time horizon mean for your choices?",
  "How to read a fund factsheet",
  "Why cash savings accounts often lose value over time",
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-full">
      {/* Nav */}
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold tracking-tight text-[var(--foreground)]">
            Sundeas<span className="text-[var(--accent)]">.</span>AI
          </span>
          <a
            href="#waitlist"
            className="rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          >
            Join the waitlist
          </a>
        </div>
      </header>

      <main className="flex flex-col flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--surface)] to-[var(--background)]" />
          <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-7 px-6 py-28 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-1.5 text-xs font-medium text-[var(--muted)] shadow-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)]" />
              Early access — coming soon
            </div>

            <h1 className="max-w-2xl text-5xl font-bold leading-[1.1] tracking-tight text-[var(--foreground)] sm:text-6xl">
              Your savings deserve{" "}
              <span className="text-[var(--accent)]">better than a bank account</span>
            </h1>

            <p className="max-w-lg text-lg leading-relaxed text-[var(--muted)]">
              Sundeas AI teaches you how to invest, tracks your portfolio, and
              gives you plain-English AI insights — so you can put your money to
              work without needing to be an expert.
            </p>

            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <a
                href="#waitlist"
                className="rounded-full bg-[var(--accent)] px-8 py-3.5 text-base font-semibold text-white shadow-md transition-opacity hover:opacity-90"
              >
                Get early access →
              </a>
              <a
                href="#how-it-works"
                className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-8 py-3.5 text-base font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--muted)]"
              >
                See how it works
              </a>
            </div>

            <p className="text-xs text-[var(--muted)]">
              Free to use &nbsp;·&nbsp; No financial advice &nbsp;·&nbsp; You stay in control
            </p>
          </div>
        </section>

        {/* Social proof strip */}
        <section className="border-y border-[var(--border)] bg-[var(--surface)]">
          <div className="mx-auto max-w-5xl px-6 py-5">
            <p className="text-center text-sm text-[var(--muted)]">
              Built for the{" "}
              <span className="font-semibold text-[var(--foreground)]">
                millions of people in the UK
              </span>{" "}
              who have savings but have never invested — because no one explained
              it in plain English.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="bg-[var(--background)]">
          <div className="mx-auto max-w-5xl px-6 py-24">
            <div className="mb-14 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">
                How it works
              </h2>
              <p className="mt-3 text-[var(--muted)]">
                Three steps from confused to confident.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {steps.map(({ step, title, body }) => (
                <div
                  key={step}
                  className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7 shadow-sm"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)]/10 text-sm font-bold text-[var(--accent)]">
                    {step}
                  </span>
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--muted)]">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What you'll learn */}
        <section className="border-t border-[var(--border)] bg-[var(--surface)]">
          <div className="mx-auto max-w-5xl px-6 py-24">
            <div className="mb-14 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">
                What you&apos;ll learn
              </h2>
              <p className="mt-3 max-w-md mx-auto text-[var(--muted)]">
                Everything a beginner needs to understand before putting money
                into the market.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {topics.map((topic) => (
                <div
                  key={topic}
                  className="flex items-start gap-3 rounded-xl border border-[var(--border)] px-5 py-4 transition-colors hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/5"
                >
                  <span className="mt-0.5 shrink-0 text-[var(--accent)]">✓</span>
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    {topic}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section className="border-t border-[var(--border)] bg-[var(--background)]">
          <div className="mx-auto max-w-5xl px-6 py-14">
            <div className="grid gap-8 text-center sm:grid-cols-3">
              {[
                {
                  stat: "Read-only",
                  label: "We never touch your money or place trades on your behalf",
                },
                {
                  stat: "Education only",
                  label: "AI insights are information, not personalised financial advice",
                },
                {
                  stat: "Free forever",
                  label: "Core features will always be free — no hidden fees",
                },
              ].map(({ stat, label }) => (
                <div key={stat} className="flex flex-col gap-2">
                  <span className="text-xl font-bold text-[var(--accent)]">{stat}</span>
                  <span className="text-sm text-[var(--muted)]">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Waitlist */}
        <section
          id="waitlist"
          className="border-t border-[var(--border)] bg-[var(--accent)]"
        >
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-24 text-center">
            <h2 className="text-3xl font-bold text-white">
              Be the first to know when we launch
            </h2>
            <p className="max-w-md text-base leading-relaxed text-white/80">
              Join the waitlist and we&apos;ll let you know when early access opens.
              No spam — just one email when it&apos;s ready.
            </p>
            <WaitlistForm />
            <p className="text-xs text-white/50">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="border-t border-[var(--border)] bg-[var(--surface)]">
          <div className="mx-auto max-w-5xl px-6 py-8">
            <p className="text-center text-xs leading-relaxed text-[var(--muted)]">
              Sundeas AI provides educational content and general information
              only. Nothing on this platform constitutes personalised financial
              advice. Past performance is not a guarantee of future results. You
              are responsible for your own investment decisions. Please do your
              own research or consult a qualified financial adviser before
              investing.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6 text-xs text-[var(--muted)]">
          <span>© 2025 Sundeas AI</span>
          <span>Not financial advice</span>
        </div>
      </footer>
    </div>
  );
}
