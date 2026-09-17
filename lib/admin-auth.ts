import "server-only";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient, supabaseServerConfigured } from "@/lib/supabase/admin";

export type AdminRole = "super_admin" | "admin";

export type AdminProfile = {
  id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  is_active: boolean;
};

export type WeddingRecord = {
  id: string;
  slug: string;
  bride_name: string;
  groom_name: string;
  wedding_date: string | null;
  venue: string | null;
  room: string | null;
};

export function adminAuthConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
      process.env.SUPABASE_SECRET_KEY,
  );
}

export async function getAuthenticatedAdmin(): Promise<AdminProfile | null> {
  if (!adminAuthConfigured() || !supabaseServerConfigured()) return null;

  const supabase = await createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const admin = createAdminClient();
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id,email,full_name,role,is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile || !profile.is_active) return null;
  if (profile.role !== "super_admin" && profile.role !== "admin") return null;

  return profile as AdminProfile;
}

export async function isAdminAuthenticated() {
  return Boolean(await getAuthenticatedAdmin());
}

export async function getAccessibleWedding(profile: AdminProfile): Promise<WeddingRecord | null> {
  const admin = createAdminClient();

  if (profile.role === "super_admin") {
    const { data } = await admin
      .from("weddings")
      .select("id,slug,bride_name,groom_name,wedding_date,venue,room")
      .eq("slug", "raveena-roshana")
      .maybeSingle();
    return (data as WeddingRecord | null) ?? null;
  }

  const { data: assignment } = await admin
    .from("wedding_admins")
    .select("wedding_id")
    .eq("user_id", profile.id)
    .limit(1)
    .maybeSingle();

  if (!assignment?.wedding_id) return null;

  const { data } = await admin
    .from("weddings")
    .select("id,slug,bride_name,groom_name,wedding_date,venue,room")
    .eq("id", assignment.wedding_id)
    .maybeSingle();

  return (data as WeddingRecord | null) ?? null;
}

export async function canManageWedding(profile: AdminProfile, weddingId: string) {
  if (profile.role === "super_admin") return true;

  const admin = createAdminClient();
  const { data } = await admin
    .from("wedding_admins")
    .select("wedding_id")
    .eq("user_id", profile.id)
    .eq("wedding_id", weddingId)
    .maybeSingle();

  return Boolean(data);
}

export async function getAdminContext() {
  const profile = await getAuthenticatedAdmin();
  if (!profile) return null;
  const wedding = await getAccessibleWedding(profile);
  return { profile, wedding };
}
