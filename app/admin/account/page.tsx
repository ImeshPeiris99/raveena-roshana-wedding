import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import AccountSettings from "@/components/admin/AccountSettings";
import { getAccessibleWedding, getAuthenticatedAdmin } from "@/lib/admin-auth";

export default async function AdminAccountPage() {
  const profile = await getAuthenticatedAdmin(); if (!profile) redirect("/admin/login");
  const wedding = await getAccessibleWedding(profile);
  return <AdminShell profile={profile} wedding={wedding}><div className="admin-page-heading"><div><p className="eyebrow">Profile & security</p><h1>My Account</h1><p>Manage your personal admin profile securely.</p></div></div><AccountSettings fullName={profile.full_name} email={profile.email} role={profile.role} /></AdminShell>;
}
