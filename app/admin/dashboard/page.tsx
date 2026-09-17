import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { getAccessibleWedding, getAuthenticatedAdmin } from "@/lib/admin-auth";
import { getDashboardStats } from "@/lib/platform";

export default async function AdminDashboardPage() {
  const profile = await getAuthenticatedAdmin();
  if (!profile) redirect("/admin/login");
  const wedding = await getAccessibleWedding(profile);
  const stats = wedding ? await getDashboardStats(wedding.id) : null;

  return (
    <AdminShell profile={profile} wedding={wedding}>
      <div className="admin-page-heading">
        <div><p className="eyebrow">{profile.role === "super_admin" ? "Super Admin" : "Client Admin"}</p><h1>Welcome, {profile.full_name || profile.email}</h1><p>{wedding ? `Managing ${wedding.bride_name} & ${wedding.groom_name}` : "No wedding is assigned to this account."}</p></div>
      </div>

      {stats && <>
        <section className="admin-stat-grid">
          <article><span>Total invitations</span><strong>{stats.invitations}</strong></article>
          <article><span>Attending</span><strong>{stats.attending}</strong></article>
          <article><span>Not attending</span><strong>{stats.declined}</strong></article>
          <article><span>Awaiting reply</span><strong>{stats.pending}</strong></article>
        </section>
        <section className="admin-panel-card">
          <div className="admin-section-heading"><span>Latest activity</span><h2>Recent RSVPs</h2><p>The newest guest responses appear here automatically.</p></div>
          <div className="admin-record-list">
            {stats.recent.map((row) => <article className="admin-record" key={row.id}><div><strong>{row.invitation?.display_name ?? "Guest"}</strong><span>{row.message || "No message"}</span></div><div className={row.attending ? "status-badge success" : "status-badge danger"}>{row.attending ? "ATTENDING" : "DECLINED"}</div></article>)}
            {stats.recent.length === 0 && <p className="empty-state">No RSVP responses yet.</p>}
          </div>
        </section>
      </>}
    </AdminShell>
  );
}
