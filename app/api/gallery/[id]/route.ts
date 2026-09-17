import { NextResponse } from "next/server";
import { canManageWedding, getAuthenticatedAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const profile = await getAuthenticatedAdmin(); if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params; const admin = createAdminClient();
  const { data: row } = await admin.from("gallery_images").select("id,wedding_id").eq("id", id).maybeSingle();
  if (!row || !(await canManageWedding(profile, row.wedding_id))) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await request.json().catch(() => null) as { caption?: string; sortOrder?: number; isFeatured?: boolean } | null;
  const updates: Record<string, unknown> = {};
  if (body?.caption !== undefined) updates.caption = body.caption.trim() || null;
  if (typeof body?.sortOrder === "number") updates.sort_order = body.sortOrder;
  if (typeof body?.isFeatured === "boolean") updates.is_featured = body.isFeatured;
  const { data, error } = await admin.from("gallery_images").update(updates).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ image: data });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const profile = await getAuthenticatedAdmin(); if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params; const admin = createAdminClient();
  const { data: row } = await admin.from("gallery_images").select("id,wedding_id,storage_path").eq("id", id).maybeSingle();
  if (!row || !(await canManageWedding(profile, row.wedding_id))) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { error } = await admin.from("gallery_images").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await admin.storage.from("wedding-media").remove([row.storage_path]).catch(() => undefined);
  return NextResponse.json({ ok: true });
}
