"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DisconnectButton({ portfolioId }: { portfolioId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function disconnect() {
    setLoading(true);
    await fetch("/api/portfolio/disconnect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ portfolioId }),
    });
    router.push("/portfolio");
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--muted)]">Are you sure?</span>
        <button
          onClick={disconnect}
          disabled={loading}
          className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Disconnecting…" : "Yes, disconnect"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs text-[var(--muted)] transition-colors hover:text-red-500"
    >
      Disconnect
    </button>
  );
}
