import { NextResponse } from "next/server";
import { getAccessibleWedding, getAuthenticatedAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getWeddingSettings } from "@/lib/platform";

export async function GET() {
  const profile = await getAuthenticatedAdmin();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const wedding = await getAccessibleWedding(profile);
  if (!wedding) return NextResponse.json({ error: "No wedding assigned." }, { status: 403 });
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("weddings")
    .select("id,slug,bride_name,groom_name,wedding_date,venue,room,dress_code,rsvp_deadline")
    .eq("id", wedding.id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ wedding: data, settings: await getWeddingSettings(wedding.id) });
}

export async function PATCH(request: Request) {
  const profile = await getAuthenticatedAdmin();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const wedding = await getAccessibleWedding(profile);
  if (!wedding) return NextResponse.json({ error: "No wedding assigned." }, { status: 403 });
  const body = await request.json().catch(() => null) as {
    brideName?: string; groomName?: string; weddingDate?: string; venue?: string; room?: string;
    dressCode?: string; rsvpDeadline?: string; programme?: unknown; story?: unknown; contacts?: unknown; marketing?: unknown;
  } | null;
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const admin = createAdminClient();
  const { error: weddingError } = await admin.from("weddings").update({
    bride_name: body.brideName?.trim() || wedding.bride_name,
    groom_name: body.groomName?.trim() || wedding.groom_name,
    wedding_date: body.weddingDate || null,
    venue: body.venue?.trim() || null,
    room: body.room?.trim() || null,
    dress_code: body.dressCode?.trim() || null,
    rsvp_deadline: body.rsvpDeadline || null,
  }).eq("id", wedding.id);
  if (weddingError) return NextResponse.json({ error: weddingError.message }, { status: 500 });

  const settings = [
    ["programme", body.programme], ["story", body.story], ["contacts", body.contacts], ["marketing", body.marketing],
  ].filter(([, value]) => value !== undefined);
  for (const [key, value] of settings) {
    const { error } = await admin.from("wedding_settings").upsert({ wedding_id: wedding.id, setting_key: key, setting_value: value }, { onConflict: "wedding_id,setting_key" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
