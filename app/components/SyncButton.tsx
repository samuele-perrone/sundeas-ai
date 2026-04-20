"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SyncButton({ portfolioId }: { portfolioId: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function sync() {
    setState("loading");
    setErrorMsg("");
    const res = await fetch("/api/portfolio/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ portfolioId }),
    });
    if (res.ok) {
      router.refresh();
      setState("idle");
    } else {
      const data = await res.json();
      setErrorMsg(data.error ?? "Sync failed");
      setState("error");
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={sync}
        disabled={state === "loading"}
        className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--background)] disabled:opacity-50"
      >
        {state === "loading" ? "Syncing…" : "↻ Sync"}
      </button>
      {state === "error" && (
        <p className="max-w-xs text-right text-xs text-red-600">{errorMsg}</p>
      )}
    </div>
  );
}
