import "server-only";

import { createAdminClient, supabaseServerConfigured } from "@/lib/supabase/admin";

export type InvitationRecord = {
  id: string;
  wedding_id: string;
  token: string;
  display_name: string;
  invitation_type: "single" | "couple" | "family" | "custom";
  whatsapp_number: string | null;
  created_at: string;
  updated_at?: string;
};

export type RSVPRecord = {
  id: string;
  invitation_id: string;
  attending: boolean;
  message: string | null;
  submitted_at: string;
  updated_at?: string;
};

export function supabaseConfigured() {
  return supabaseServerConfigured();
}

export async function createInvitationRecord(input: {
  weddingId: string;
  token: string;
  displayName: string;
  invitationType: InvitationRecord["invitation_type"];
  whatsappNumber: string;
}) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("invitations")
    .insert({
      wedding_id: input.weddingId,
      token: input.token,
      display_name: input.displayName,
      invitation_type: input.invitationType,
      whatsapp_number: input.whatsappNumber || null,
    })
    .select("id,wedding_id,token,display_name,invitation_type,whatsapp_number,created_at,updated_at")
    .single();
  if (error) throw error;
  return data as InvitationRecord;
}

export async function getInvitationRecord(token: string) {
  if (!supabaseConfigured()) return null;
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("invitations")
    .select("id,wedding_id,token,display_name,invitation_type,whatsapp_number,created_at,updated_at")
    .eq("token", token)
    .maybeSingle();
  if (error) throw error;
  return (data as InvitationRecord | null) ?? null;
}

export async function saveRSVPRecord(input: {
  invitationId: string;
  attending: boolean;
  message: string;
}) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("rsvps")
    .upsert(
      {
        invitation_id: input.invitationId,
        attending: input.attending,
        message: input.message || null,
        submitted_at: new Date().toISOString(),
      },
      { onConflict: "invitation_id" },
    )
    .select("id,invitation_id,attending,message,submitted_at,updated_at")
    .single();
  if (error) throw error;
  return data as RSVPRecord;
}
