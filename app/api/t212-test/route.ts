import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const BASE = "https://live.trading212.com/api/v0";
const PATH = "/equity/portfolio";

async function tryAuth(label: string, authHeader: string) {
  const res = await fetch(`${BASE}${PATH}`, {
    headers: { Authorization: authHeader },
    next: { revalidate: 0 },
  });
  const body = await res.text();
  return { label, status: res.status, body: body.slice(0, 200) };
}

// Temporary debug endpoint — DELETE after fixing auth
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { key, secret } = await request.json();

  const b64 = (s: string) => Buffer.from(s).toString("base64");

  const results = await Promise.all([
    tryAuth("key only",            key),
    tryAuth("Bearer key",          `Bearer ${key}`),
    tryAuth("Basic key:secret",    `Basic ${b64(`${key}:${secret}`)}`),
    tryAuth("Basic secret:key",    `Basic ${b64(`${secret}:${key}`)}`),
    tryAuth("Basic key:key",       `Basic ${b64(`${key}:${key}`)}`),
    tryAuth("secret only",         secret),
    tryAuth("Bearer secret",       `Bearer ${secret}`),
  ]);

  return NextResponse.json(results);
}
