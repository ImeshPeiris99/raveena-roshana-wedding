import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import RSVPManager from "@/components/admin/RSVPManager";
import { getAccessibleWedding, getAuthenticatedAdmin } from "@/lib/admin-auth";
import { listRSVPs } from "@/lib/platform";

export default async function AdminRSVPPage() {
  const profile = await getAuthenticatedAdmin(); if (!profile) redirect("/admin/login");
  const wedding = await getAccessibleWedding(profile); if (!wedding) redirect("/admin/dashboard");
  const rsvps = await listRSVPs(wedding.id);
  return <AdminShell profile={profile} wedding={wedding}>
    <div className="admin-page-heading"><div><p className="eyebrow">Guest responses</p><h1>RSVP Management</h1><p>Review attendance, messages and response status for {wedding.bride_name} & {wedding.groom_name}.</p></div></div>
    <RSVPManager initialRSVPs={rsvps} />
  </AdminShell>;
}
