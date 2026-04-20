"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SyncButton({ portfolioId }: { portfolioId: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading">("idle");

  async function sync() {
    setState("loading");
    await fetch("/api/portfolio/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ portfolioId }),
    });
    router.refresh();
    setState("idle");
  }

  return (
    <button
      onClick={sync}
      disabled={state === "loading"}
      className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--background)] disabled:opacity-50"
    >
      {state === "loading" ? "Syncing…" : "↻ Sync"}
    </button>
  );
}
