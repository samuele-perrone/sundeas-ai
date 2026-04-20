"use client";

import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [magicState, setMagicState] = useState<"idle" | "loading" | "sent">("idle");

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/api/auth/callback?next=${next}` },
    });
  }

  async function signInWithMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setMagicState("loading");
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/api/auth/callback?next=${next}` },
    });
    setMagicState("sent");
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-sm">
      {/* Google */}
      <button
        onClick={signInWithGoogle}
        className="flex items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] shadow-sm transition-colors hover:bg-[var(--background)]"
      >
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
          <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
        </svg>
        Continue with Google
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[var(--border)]" />
        <span className="text-xs text-[var(--muted)]">or</span>
        <div className="flex-1 h-px bg-[var(--border)]" />
      </div>

      {/* Magic link */}
      {magicState === "sent" ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-center">
          <p className="text-sm font-semibold text-[var(--foreground)]">Check your email</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            We sent a sign-in link to <strong>{email}</strong>
          </p>
        </div>
      ) : (
        <form onSubmit={signInWithMagicLink} className="flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            disabled={magicState === "loading"}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={magicState === "loading"}
            className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {magicState === "loading" ? "Sending…" : "Send magic link"}
          </button>
        </form>
      )}
    </div>
  );
}
