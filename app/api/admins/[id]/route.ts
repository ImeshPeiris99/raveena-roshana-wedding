import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const profile = await getAuthenticatedAdmin();
  if (!profile || profile.role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  if (id === profile.id) return NextResponse.json({ error: "Use My Account to change your own account." }, { status: 400 });

  const body = await request.json().catch(() => null) as { fullName?: string; isActive?: boolean; weddingId?: string } | null;
  const admin = createAdminClient();
  const updates: Record<string, string | boolean> = {};
  if (body?.fullName !== undefined) updates.full_name = body.fullName.trim();
  if (typeof body?.isActive === "boolean") updates.is_active = body.isActive;

  const { error } = await admin.from("profiles").update(updates).eq("id", id).eq("role", "admin");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (body?.weddingId) {
    await admin.from("wedding_admins").delete().eq("user_id", id);
    const { error: assignError } = await admin.from("wedding_admins").insert({ user_id: id, wedding_id: body.weddingId });
    if (assignError) return NextResponse.json({ error: assignError.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const profile = await getAuthenticatedAdmin();
  if (!profile || profile.role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  if (id === profile.id) return NextResponse.json({ error: "You cannot delete your own Super Admin account." }, { status: 400 });
  const admin = createAdminClient();
  const { data: target } = await admin.from("profiles").select("role").eq("id", id).maybeSingle();
  if (!target || target.role !== "admin") return NextResponse.json({ error: "Only client Admin accounts can be deleted here." }, { status: 400 });
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
