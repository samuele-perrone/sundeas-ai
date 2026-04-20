"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const supabase = createClient();
  const router = useRouter();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <button
      onClick={signOut}
      className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
    >
      Sign out
    </button>
  );
}
