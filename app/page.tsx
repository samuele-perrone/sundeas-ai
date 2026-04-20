export default function Home() {
  return (
    <div className="flex flex-col min-h-full font-[var(--font-geist-sans)]">
      {/* Nav */}
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
            Sundeas <span className="text-[var(--accent)]">AI</span>
          </span>
          <a
            href="#waitlist"
            className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Join the waitlist
          </a>
        </div>
      </header>

      <main className="flex flex-col flex-1">
        {/* Hero */}
        <section className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-medium text-[var(--muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            Coming soon
          </div>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-[var(--foreground)] sm:text-5xl">
            Invest with confidence,{" "}
            <span className="text-[var(--accent)]">not guesswork</span>
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-[var(--muted)]">
            Sundeas AI teaches you how investing works, tracks your portfolio
            across platforms, and gives you plain-English AI insights — so you
            can make smarter decisions with your savings.
          </p>
          <a
            href="#waitlist"
            className="mt-2 rounded-full bg-[var(--accent)] px-8 py-3 text-base font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          >
            Get early access →
          </a>
          <p className="text-xs text-[var(--muted)]">
            Free to use · No financial advice · You stay in control
          </p>
        </section>

        {/* How it works */}
        <section className="border-t border-[var(--border)] bg-[var(--surface)]">
          <div className="mx-auto max-w-5xl px-6 py-20">
            <h2 className="mb-12 text-center text-2xl font-bold text-[var(--foreground)]">
              How it works
            </h2>
            <div className="grid gap-8 sm:grid-cols-3">
              {[
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
              ].map(({ step, title, body }) => (
                <div key={step} className="flex flex-col gap-3">
                  <span className="text-3xl font-bold text-[var(--border)]">
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
        <section className="border-t border-[var(--border)]">
          <div className="mx-auto max-w-5xl px-6 py-20">
            <h2 className="mb-4 text-center text-2xl font-bold text-[var(--foreground)]">
              What you&apos;ll learn
            </h2>
            <p className="mx-auto mb-12 max-w-lg text-center text-sm text-[var(--muted)]">
              Built for people who have savings but have never invested — or who
              opened a Trading 212 account and aren&apos;t sure what to put in it.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "What is an ETF and why do people use them?",
                "What is a Stocks & Shares ISA?",
                "How does diversification reduce risk?",
                "What does your time horizon mean for your choices?",
                "How to read a fund factsheet",
                "Why cash savings accounts often lose value over time",
              ].map((topic) => (
                <div
                  key={topic}
                  className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
                >
                  <span className="mt-0.5 text-[var(--accent)]">✓</span>
                  <span className="text-sm text-[var(--foreground)]">
                    {topic}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="border-t border-[var(--border)] bg-[var(--surface)]">
          <div className="mx-auto max-w-5xl px-6 py-10">
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

        {/* Waitlist */}
        <section
          id="waitlist"
          className="border-t border-[var(--border)] bg-[var(--accent)]"
        >
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-20 text-center">
            <h2 className="text-2xl font-bold text-white">
              Be the first to know when we launch
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-white/80">
              We&apos;re building Sundeas AI for people who want to make their
              savings work harder. Join the waitlist and we&apos;ll let you know
              when early access opens.
            </p>
            <form
              action="https://api.resend.com"
              className="flex w-full max-w-sm flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                required
                className="flex-1 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/50 outline-none focus:border-white/60"
              />
              <button
                type="submit"
                className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-[var(--accent)] transition-opacity hover:opacity-90"
              >
                Notify me
              </button>
            </form>
            <p className="text-xs text-white/50">No spam. Unsubscribe anytime.</p>
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
