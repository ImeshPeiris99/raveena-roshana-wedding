import { NextResponse } from "next/server";
import { getInvitationRecord, saveRSVPRecord, supabaseConfigured } from "@/lib/supabase-rest";

export async function POST(request: Request) {
  if (!supabaseConfigured()) {
    return NextResponse.json({ error: "SUPABASE_NOT_CONFIGURED" }, { status: 503 });
  }

  const body = await request.json().catch(() => null) as {
    token?: string;
    attending?: boolean;
    message?: string;
  } | null;

  const token = body?.token?.trim() ?? "";
  if (!token || typeof body?.attending !== "boolean") {
    return NextResponse.json({ error: "Invalid RSVP." }, { status: 400 });
  }

  const invitation = await getInvitationRecord(token);
  if (!invitation) {
    return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
  }

  try {
    const rsvp = await saveRSVPRecord({
      invitationId: invitation.id,
      attending: body.attending,
      message: (body.message ?? "").trim(),
    });
    return NextResponse.json({ ok: true, rsvp });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not save RSVP." }, { status: 500 });
  }
}
