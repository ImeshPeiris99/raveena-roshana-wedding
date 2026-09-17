import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(request: Request) {
  const profile = await getAuthenticatedAdmin();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as { fullName?: string; password?: string } | null;
  const admin = createAdminClient();

  if (body?.fullName !== undefined) {
    const fullName = body.fullName.trim();
    if (!fullName) return NextResponse.json({ error: "Full name is required." }, { status: 400 });
    const { error } = await admin.from("profiles").update({ full_name: fullName }).eq("id", profile.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await admin.auth.admin.updateUserById(profile.id, { user_metadata: { full_name: fullName } });
  }

  if (body?.password) {
    if (body.password.length < 8) return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
    const { error } = await admin.auth.admin.updateUserById(profile.id, { password: body.password });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
