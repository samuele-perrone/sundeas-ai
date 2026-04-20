"use client";

import { useState } from "react";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");

    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setState(res.ok ? "done" : "error");
  }

  if (state === "done") {
    return (
      <div className="flex flex-col items-center gap-2 text-white">
        <span className="text-2xl">✓</span>
        <p className="font-semibold">You&apos;re on the list.</p>
        <p className="text-sm text-white/70">We&apos;ll email you when early access opens.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-sm flex-col gap-3 sm:flex-row"
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        disabled={state === "loading"}
        className="flex-1 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/60 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={state === "loading"}
        className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-[var(--accent)] transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {state === "loading" ? "Saving…" : "Notify me"}
      </button>
      {state === "error" && (
        <p className="w-full text-center text-xs text-white/70">
          Something went wrong — please try again.
        </p>
      )}
    </form>
  );
}
