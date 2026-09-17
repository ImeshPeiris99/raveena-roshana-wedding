import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getAccessibleWedding, getAuthenticatedAdmin } from "@/lib/admin-auth";
import { createInvitationRecord, supabaseConfigured } from "@/lib/supabase-rest";
import { listInvitations } from "@/lib/platform";

const allowedTypes = new Set(["single", "couple", "family", "custom"]);

export async function GET() {
  const profile = await getAuthenticatedAdmin();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const wedding = await getAccessibleWedding(profile);
  if (!wedding) return NextResponse.json({ error: "No wedding assigned." }, { status: 403 });
  const invitations = await listInvitations(wedding.id);
  return NextResponse.json({ invitations });
}

export async function POST(request: Request) {
  const profile = await getAuthenticatedAdmin();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!supabaseConfigured()) return NextResponse.json({ error: "SUPABASE_NOT_CONFIGURED" }, { status: 503 });

  const wedding = await getAccessibleWedding(profile);
  if (!wedding) return NextResponse.json({ error: "No wedding is assigned to this admin." }, { status: 403 });

  const body = (await request.json().catch(() => null)) as { displayName?: string; invitationType?: string; whatsappNumber?: string } | null;
  const displayName = body?.displayName?.trim() ?? "";
  const invitationType = body?.invitationType ?? "single";
  const whatsappNumber = body?.whatsappNumber?.trim() ?? "";
  if (!displayName || !allowedTypes.has(invitationType)) return NextResponse.json({ error: "Invalid invitation details." }, { status: 400 });

  const token = crypto.randomBytes(12).toString("base64url");
  try {
    const record = await createInvitationRecord({ weddingId: wedding.id, token, displayName, invitationType: invitationType as "single" | "couple" | "family" | "custom", whatsappNumber });
    const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || new URL(request.url).origin;
    return NextResponse.json({ invitation: record, link: `${origin}/invite/${record.token}`, persisted: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not create invitation." }, { status: 500 });
  }
}
