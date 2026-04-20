import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("waitlist")
    .insert({ email: email.toLowerCase().trim() });

  // Unique violation means already signed up — treat as success
  if (error && error.code !== "23505") {
    console.error("Waitlist insert error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
