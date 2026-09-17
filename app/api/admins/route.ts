import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { listAdmins } from "@/lib/platform";

export async function GET() {
  const profile = await getAuthenticatedAdmin();
  if (!profile || profile.role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json({ admins: await listAdmins() });
}

export async function POST(request: Request) {
  const profile = await getAuthenticatedAdmin();
  if (!profile || profile.role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json().catch(() => null) as { fullName?: string; email?: string; password?: string; weddingId?: string } | null;
  const fullName = body?.fullName?.trim() ?? "";
  const email = body?.email?.trim().toLowerCase() ?? "";
  const password = body?.password ?? "";
  const weddingId = body?.weddingId ?? "";
  if (!fullName || !email || !password || password.length < 8 || !weddingId) {
    return NextResponse.json({ error: "Name, email, wedding and a password of at least 8 characters are required." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (createError || !created.user) return NextResponse.json({ error: createError?.message ?? "Could not create user." }, { status: 400 });

  try {
    const { error: profileError } = await admin.from("profiles").upsert({
      id: created.user.id,
      email,
      full_name: fullName,
      role: "admin",
      is_active: true,
    });
    if (profileError) throw profileError;

    const { error: assignmentError } = await admin.from("wedding_admins").upsert({ wedding_id: weddingId, user_id: created.user.id });
    if (assignmentError) throw assignmentError;

    return NextResponse.json({ ok: true, id: created.user.id });
  } catch (error) {
    await admin.auth.admin.deleteUser(created.user.id).catch(() => undefined);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not finish admin creation." }, { status: 500 });
  }
}
