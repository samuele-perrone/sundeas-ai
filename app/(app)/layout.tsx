import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SignOutButton from "@/app/components/SignOutButton";
import AppFooter from "@/app/components/AppFooter";
import Link from "next/link";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/learn", label: "Learn" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-4">
          <Link href="/dashboard" className="text-base font-bold tracking-tight text-[var(--foreground)] shrink-0">
            Sundeas<span className="text-[var(--accent)]">.</span>AI
          </Link>

          <nav className="flex flex-1 items-center gap-1">
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--background)] hover:text-[var(--foreground)]"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 shrink-0">
            <span className="hidden text-xs text-[var(--muted)] sm:block">
              {user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        {children}
      </main>

      <AppFooter />
    </div>
  );
}
