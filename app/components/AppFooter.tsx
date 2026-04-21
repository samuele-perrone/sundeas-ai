import Link from "next/link";

export default function AppFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto max-w-5xl px-6 py-5">
        <p className="text-center text-xs leading-relaxed text-[var(--muted)]">
          Sundeas AI provides educational content only. Nothing here constitutes financial advice or
          a recommendation to buy or sell. Prices may be delayed or inaccurate. AI-generated insights
          are not reviewed by a financial professional and may be incorrect. Past performance is not a
          guarantee of future results. You are solely responsible for your investment decisions.{" "}
          <Link href="/disclaimer" className="underline hover:text-[var(--foreground)]">
            Full disclaimer
          </Link>
          .
        </p>
      </div>
    </footer>
  );
}
