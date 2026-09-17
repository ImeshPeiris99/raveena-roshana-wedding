import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import WeddingSettingsForm from "@/components/admin/WeddingSettingsForm";
import { getAccessibleWedding, getAuthenticatedAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getWeddingSettings } from "@/lib/platform";

export default async function WeddingSettingsPage() {
  const profile = await getAuthenticatedAdmin(); if (!profile) redirect("/admin/login");
  const wedding = await getAccessibleWedding(profile); if (!wedding) redirect("/admin/dashboard");
  const admin = createAdminClient();
  const [{ data }, settings] = await Promise.all([
    admin.from("weddings").select("bride_name,groom_name,wedding_date,venue,room,dress_code,rsvp_deadline").eq("id", wedding.id).single(),
    getWeddingSettings(wedding.id),
  ]);
  if (!data) redirect("/admin/dashboard");
  return <AdminShell profile={profile} wedding={wedding}><div className="admin-page-heading"><div><p className="eyebrow">Content management</p><h1>Wedding Settings</h1><p>Update the event details and invitation content without editing code.</p></div></div><WeddingSettingsForm wedding={data} settings={settings} /></AdminShell>;
}
