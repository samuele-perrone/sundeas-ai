import { Suspense } from "react";
import LoginForm from "@/app/components/LoginForm";

export const metadata = { title: "Sign in — Sundeas AI" };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-6">
      <div className="mb-8 text-center">
        <a href="/" className="text-2xl font-bold text-[var(--foreground)]">
          Sundeas<span className="text-[var(--accent)]">.</span>AI
        </a>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Sign in to track your portfolio and learn how to invest
        </p>
      </div>

      <Suspense>
        <LoginForm />
      </Suspense>

      <p className="mt-8 max-w-xs text-center text-xs text-[var(--muted)]">
        By signing in you agree that Sundeas AI provides educational content
        only — not financial advice.
      </p>
    </div>
  );
}
