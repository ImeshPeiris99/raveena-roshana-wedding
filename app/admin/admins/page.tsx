import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import AdminManager from "@/components/admin/AdminManager";
import { getAccessibleWedding, getAuthenticatedAdmin } from "@/lib/admin-auth";
import { listAdmins, listWeddings } from "@/lib/platform";

export default async function AdminManagementPage() {
  const profile = await getAuthenticatedAdmin();
  if (!profile) redirect("/admin/login");
  if (profile.role !== "super_admin") redirect("/admin/dashboard");
  const [wedding, admins, weddings] = await Promise.all([getAccessibleWedding(profile), listAdmins(), listWeddings()]);

  return (
    <AdminShell profile={profile} wedding={wedding}>
      <div className="admin-page-heading"><div><p className="eyebrow">Super Admin only</p><h1>Admin Management</h1><p>Create and control client access without exposing system-level permissions.</p></div></div>
      <AdminManager initialAdmins={admins as never[]} weddings={weddings.map((w) => ({ id: w.id, bride_name: w.bride_name, groom_name: w.groom_name, slug: w.slug }))} currentUserId={profile.id} />
    </AdminShell>
  );
}
