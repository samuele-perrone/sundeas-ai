import ConnectT212Form from "@/app/components/ConnectT212Form";

export const metadata = { title: "Connect portfolio — Sundeas AI" };

export default function ConnectPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Connect your portfolio</h1>
        <p className="mt-1 text-[var(--muted)]">
          Link your Trading 212 account to track your holdings automatically.
        </p>
      </div>
      <ConnectT212Form />
    </div>
  );
}
