import { NextResponse } from "next/server";
import { canManageWedding, getAuthenticatedAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

async function getContext(id: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("rsvps")
    .select("id,invitation_id,invitation:invitations(wedding_id)")
    .eq("id", id)
    .maybeSingle();
  const weddingId = (data?.invitation as { wedding_id?: string } | null)?.wedding_id;
  return { admin, data, weddingId };
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const profile = await getAuthenticatedAdmin();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { admin, data, weddingId } = await getContext(id);
  if (!data || !weddingId || !(await canManageWedding(profile, weddingId))) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await request.json().catch(() => null) as { attending?: boolean; message?: string } | null;
  const updates: Record<string, unknown> = {};
  if (typeof body?.attending === "boolean") updates.attending = body.attending;
  if (body?.message !== undefined) updates.message = body.message.trim() || null;
  const { data: updated, error } = await admin.from("rsvps").update(updates).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rsvp: updated });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const profile = await getAuthenticatedAdmin();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { admin, data, weddingId } = await getContext(id);
  if (!data || !weddingId || !(await canManageWedding(profile, weddingId))) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { error } = await admin.from("rsvps").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
