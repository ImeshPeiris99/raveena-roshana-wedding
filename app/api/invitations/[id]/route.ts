import { NextResponse } from "next/server";
import { canManageWedding, getAuthenticatedAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

const allowedTypes = new Set(["single", "couple", "family", "custom"]);

async function getRecord(id: string) {
  const admin = createAdminClient();
  const { data } = await admin.from("invitations").select("id,wedding_id,token").eq("id", id).maybeSingle();
  return data;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const profile = await getAuthenticatedAdmin();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const record = await getRecord(id);
  if (!record || !(await canManageWedding(profile, record.wedding_id))) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json().catch(() => null) as { displayName?: string; invitationType?: string; whatsappNumber?: string } | null;
  const updates: Record<string, string | null> = {};
  if (body?.displayName !== undefined) {
    const name = body.displayName.trim();
    if (!name) return NextResponse.json({ error: "Display name is required." }, { status: 400 });
    updates.display_name = name;
  }
  if (body?.invitationType !== undefined) {
    if (!allowedTypes.has(body.invitationType)) return NextResponse.json({ error: "Invalid invitation type." }, { status: 400 });
    updates.invitation_type = body.invitationType;
  }
  if (body?.whatsappNumber !== undefined) updates.whatsapp_number = body.whatsappNumber.trim() || null;

  const admin = createAdminClient();
  const { data, error } = await admin.from("invitations").update(updates).eq("id", id).select("id,wedding_id,token,display_name,invitation_type,whatsapp_number,created_at,updated_at").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ invitation: data });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const profile = await getAuthenticatedAdmin();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const record = await getRecord(id);
  if (!record || !(await canManageWedding(profile, record.wedding_id))) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const admin = createAdminClient();
  const { error } = await admin.from("invitations").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
