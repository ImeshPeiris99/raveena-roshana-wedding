import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import InvitationManager from "@/components/admin/InvitationManager";
import { getAccessibleWedding, getAuthenticatedAdmin } from "@/lib/admin-auth";
import { listInvitations } from "@/lib/platform";

export default async function AdminInvitationsPage() {
  const profile = await getAuthenticatedAdmin(); if (!profile) redirect("/admin/login");
  const wedding = await getAccessibleWedding(profile); if (!wedding) redirect("/admin/dashboard");
  const invitations = await listInvitations(wedding.id);
  return <AdminShell profile={profile} wedding={wedding}>
    <div className="admin-page-heading"><div><p className="eyebrow">Guest invitations</p><h1>Invitation Management</h1><p>Create, edit and share personalised invitation links for {wedding.bride_name} & {wedding.groom_name}.</p></div></div>
    <InvitationManager initialInvitations={invitations} />
  </AdminShell>;
}
