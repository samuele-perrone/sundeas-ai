import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { portfolioId } = await request.json();

  const admin = createAdminClient();

  // Verify ownership before deleting
  const { data: portfolio } = await admin
    .from("portfolios")
    .select("id")
    .eq("id", portfolioId)
    .eq("user_id", user.id)
    .single();

  if (!portfolio) {
    return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
  }

  // Holdings cascade-delete via FK
  await admin.from("portfolios").delete().eq("id", portfolioId);

  return NextResponse.json({ ok: true });
}
