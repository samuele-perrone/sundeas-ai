"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ConnectT212Form() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setErrorMsg("");

    const res = await fetch("/api/portfolio/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey }),
    });

    const data = await res.json();

    if (!res.ok) {
      setErrorMsg(data.error ?? "Something went wrong");
      setState("error");
      return;
    }

    router.push("/portfolio");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-8 max-w-lg">
      {/* Instructions */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="mb-1 font-semibold text-[var(--foreground)]">
          How to generate your Trading 212 API key
        </h2>
        <p className="mb-5 text-sm text-[var(--muted)]">Takes about 2 minutes in the app.</p>
        <ol className="flex flex-col gap-4 text-sm text-[var(--muted)]">
          <li className="flex gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/10 text-xs font-bold text-[var(--accent)]">1</span>
            Open the Trading 212 app and tap your <strong className="text-[var(--foreground)]">profile icon</strong> (bottom right)
          </li>
          <li className="flex gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/10 text-xs font-bold text-[var(--accent)]">2</span>
            Go to <strong className="text-[var(--foreground)]">Settings → API (Beta)</strong>
          </li>
          <li className="flex gap-3 flex-col">
            <div className="flex gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/10 text-xs font-bold text-[var(--accent)]">3</span>
              <span>Enable these permissions:</span>
            </div>
            <div className="ml-8 flex flex-col gap-2">
              {[
                { label: "Account data", required: true, reason: "Your portfolio holdings and cash balance" },
                { label: "Metadata", required: true, reason: "Instrument names and details" },
                { label: "History – Dividends", required: false, reason: "Optional — dividend history" },
              ].map(({ label, required, reason }) => (
                <div key={label} className="flex items-start gap-2.5">
                  <span className={`mt-0.5 text-xs font-bold ${required ? "text-[var(--accent)]" : "text-[var(--muted)]"}`}>✓</span>
                  <div>
                    <span className="font-medium text-[var(--foreground)]">{label}</span>
                    {required && <span className="ml-1.5 text-xs text-[var(--accent)]">required</span>}
                    <p className="text-xs text-[var(--muted)]">{reason}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 text-xs font-bold text-red-400">✕</span>
                <div>
                  <span className="font-medium text-[var(--foreground)]">Orders – Execute</span>
                  <p className="text-xs text-[var(--muted)]">Leave this OFF — Sundeas AI never places trades</p>
                </div>
              </div>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/10 text-xs font-bold text-[var(--accent)]">4</span>
            Tap <strong className="text-[var(--foreground)]">Generate key</strong>, copy it, and paste it below
          </li>
        </ol>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--foreground)]">
            API key
          </label>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Paste your Trading 212 API key"
            required
            disabled={state === "loading"}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 font-mono text-sm text-[var(--foreground)] outline-none placeholder:font-sans placeholder:text-[var(--muted)] focus:border-[var(--accent)] disabled:opacity-50"
          />
        </div>

        {state === "error" && (
          <p className="text-sm text-red-600">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={state === "loading"}
          className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {state === "loading" ? "Connecting…" : "Connect portfolio"}
        </button>

        <p className="text-xs text-[var(--muted)]">
          Read-only access only. Sundeas AI can never place trades or move money on your behalf.
        </p>
      </form>
    </div>
  );
}
