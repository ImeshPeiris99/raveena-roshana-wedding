import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { AdminProfile, WeddingRecord } from "@/lib/admin-auth";

export type InvitationRow = {
  id: string;
  wedding_id: string;
  token: string;
  display_name: string;
  invitation_type: "single" | "couple" | "family" | "custom";
  whatsapp_number: string | null;
  created_at: string;
  updated_at: string;
};

export type RSVPRow = {
  id: string;
  invitation_id: string;
  attending: boolean;
  message: string | null;
  submitted_at: string;
  updated_at: string;
  invitation?: { display_name: string; whatsapp_number: string | null; token: string } | null;
};


type ProfileRow = {
  id: string;
  email: string;
  full_name: string;
  role: "super_admin" | "admin";
  is_active: boolean;
  created_at: string;
};

type AssignmentRow = {
  user_id: string;
  wedding_id: string;
  wedding?: { id: string; slug: string; bride_name: string; groom_name: string } | null;
};

type SettingRow = { setting_key: string; setting_value: unknown };

export type GalleryRow = {
  id: string;
  wedding_id: string;
  storage_path: string;
  public_url: string;
  caption: string | null;
  sort_order: number;
  is_featured: boolean;
  created_at: string;
};

export async function listInvitations(weddingId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("invitations")
    .select("id,wedding_id,token,display_name,invitation_type,whatsapp_number,created_at,updated_at")
    .eq("wedding_id", weddingId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as InvitationRow[];
}

export async function listRSVPs(weddingId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("rsvps")
    .select("id,invitation_id,attending,message,submitted_at,updated_at,invitation:invitations!inner(display_name,whatsapp_number,token,wedding_id)")
    .eq("invitation.wedding_id", weddingId)
    .order("submitted_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as RSVPRow[];
}

export async function getDashboardStats(weddingId: string) {
  const [invites, rsvps] = await Promise.all([listInvitations(weddingId), listRSVPs(weddingId)]);
  const attending = rsvps.filter((r) => r.attending).length;
  const declined = rsvps.filter((r) => !r.attending).length;
  return {
    invitations: invites.length,
    responses: rsvps.length,
    attending,
    declined,
    pending: Math.max(0, invites.length - rsvps.length),
    recent: rsvps.slice(0, 5),
  };
}

export async function listAdmins() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("id,email,full_name,role,is_active,created_at")
    .order("created_at", { ascending: true });
  if (error) throw error;

  const { data: assignments, error: assignmentError } = await admin
    .from("wedding_admins")
    .select("user_id,wedding_id,wedding:weddings(id,slug,bride_name,groom_name)");
  if (assignmentError) throw assignmentError;

  type AssignmentQueryRow = {
    user_id: string;
    wedding_id: string;
    wedding:
      | { id: string; slug: string; bride_name: string; groom_name: string }
      | Array<{ id: string; slug: string; bride_name: string; groom_name: string }>
      | null;
  };

  // Supabase may type an embedded relationship as an array. Cast the raw query
  // result to the exact shape we expect, then normalize it to one wedding object.
  const assignmentRows = (assignments ?? []) as unknown as AssignmentQueryRow[];

  const normalizedAssignments: AssignmentRow[] = assignmentRows.map(
    (assignment: AssignmentQueryRow): AssignmentRow => ({
      user_id: assignment.user_id,
      wedding_id: assignment.wedding_id,
      wedding: Array.isArray(assignment.wedding)
        ? (assignment.wedding[0] ?? null)
        : (assignment.wedding ?? null),
    }),
  );

  return (data ?? []).map((profile: ProfileRow) => ({
    ...profile,
    assignments: normalizedAssignments.filter(
      (assignment: AssignmentRow) => assignment.user_id === profile.id,
    ),
  }));
}

export async function listWeddings() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("weddings")
    .select("id,slug,bride_name,groom_name,wedding_date,venue,room,dress_code,rsvp_deadline")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Array<WeddingRecord & { dress_code?: string | null; rsvp_deadline?: string | null }>;
}

export async function listGallery(weddingId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("gallery_images")
    .select("id,wedding_id,storage_path,public_url,caption,sort_order,is_featured,created_at")
    .eq("wedding_id", weddingId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as GalleryRow[];
}

export async function getWeddingSettings(weddingId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("wedding_settings")
    .select("setting_key,setting_value")
    .eq("wedding_id", weddingId);
  if (error) throw error;
  return Object.fromEntries((data ?? []).map((row: SettingRow) => [row.setting_key, row.setting_value]));
}

export async function requireWeddingForProfile(profile: AdminProfile, getAccessibleWedding: (p: AdminProfile) => Promise<WeddingRecord | null>) {
  const wedding = await getAccessibleWedding(profile);
  if (!wedding) throw new Error("NO_WEDDING_ASSIGNED");
  return wedding;
}
