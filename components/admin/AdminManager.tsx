"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Wedding = { id: string; bride_name: string; groom_name: string; slug: string };
type AdminRow = {
  id: string;
  email: string;
  full_name: string;
  role: "super_admin" | "admin";
  is_active: boolean;
  assignments?: Array<{ wedding_id: string; wedding?: Wedding | null }>;
};

function generatePassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  const bytes = crypto.getRandomValues(new Uint32Array(14));
  return Array.from(bytes, (value) => alphabet[value % alphabet.length]).join("");
}

export default function AdminManager({ initialAdmins, weddings, currentUserId }: { initialAdmins: AdminRow[]; weddings: Wedding[]; currentUserId: string }) {
  const router = useRouter();
  const [admins, setAdmins] = useState(initialAdmins);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [weddingId, setWeddingId] = useState(weddings[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const clientAdmins = useMemo(() => admins.filter((admin) => admin.role === "admin"), [admins]);

  async function refresh() {
    const response = await fetch("/api/admins", { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      setAdmins(data.admins);
    }
    router.refresh();
  }

  async function createAdmin(event: FormEvent) {
    event.preventDefault();
    setLoading(true); setNotice("");
    const response = await fetch("/api/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, password, weddingId }),
    });
    const data = await response.json();
    if (!response.ok) setNotice(data.error ?? "Could not create admin.");
    else {
      setNotice("Client Admin created successfully. Share the email and temporary password securely with the client.");
      setFullName(""); setEmail(""); setPassword("");
      await refresh();
    }
    setLoading(false);
  }

  async function updateAdmin(id: string, patch: Record<string, unknown>) {
    const response = await fetch(`/api/admins/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    const data = await response.json();
    setNotice(response.ok ? "Admin account updated." : data.error ?? "Could not update admin.");
    if (response.ok) await refresh();
  }

  async function deleteAdmin(id: string, name: string) {
    if (!confirm(`Delete the client Admin account for ${name}? This cannot be undone.`)) return;
    const response = await fetch(`/api/admins/${id}`, { method: "DELETE" });
    const data = await response.json();
    setNotice(response.ok ? "Client Admin deleted." : data.error ?? "Could not delete admin.");
    if (response.ok) await refresh();
  }

  async function resetPassword(id: string) {
    const next = generatePassword();
    const response = await fetch(`/api/admins/${id}/reset-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: next }) });
    const data = await response.json();
    if (!response.ok) setNotice(data.error ?? "Could not reset password.");
    else setNotice(`Temporary password updated: ${next} — copy it now and share it securely. This value will not be shown again.`);
  }

  return (
    <div className="admin-module-stack">
      <section className="admin-panel-card">
        <div className="admin-section-heading">
          <span>Super Admin control</span>
          <h2>Create Client Admin</h2>
          <p>Create the client&apos;s login and assign it to the correct wedding. Client Admins cannot access Super Admin controls.</p>
        </div>
        <form className="admin-form-grid" onSubmit={createAdmin}>
          <label>Full name<input value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Client name" /></label>
          <label>Email address<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="client@example.com" /></label>
          <label>Temporary password<div className="inline-field"><input value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} /><button type="button" onClick={() => setPassword(generatePassword())}>Generate</button></div></label>
          <label>Wedding<select value={weddingId} onChange={(e) => setWeddingId(e.target.value)} required>{weddings.map((w) => <option value={w.id} key={w.id}>{w.bride_name} & {w.groom_name}</option>)}</select></label>
          <button className="admin-primary-button" disabled={loading}>{loading ? "Creating…" : "Create Client Admin"}</button>
        </form>
        {notice && <p className="admin-notice">{notice}</p>}
      </section>

      <section className="admin-panel-card">
        <div className="admin-section-heading"><span>Accounts</span><h2>Admin Access</h2><p>Activate, deactivate, reassign, reset passwords or remove client accounts.</p></div>
        <div className="admin-record-list">
          {admins.filter((a) => a.id === currentUserId).map((admin) => (
            <article className="admin-record" key={admin.id}><div><strong>{admin.full_name}</strong><span>{admin.email}</span></div><div className="status-badge success">SUPER ADMIN</div></article>
          ))}
          {clientAdmins.map((admin) => {
            const assigned = admin.assignments?.[0];
            return (
              <article className="admin-record admin-record-actions" key={admin.id}>
                <div><strong>{admin.full_name || admin.email}</strong><span>{admin.email}</span><small>{assigned?.wedding ? `${assigned.wedding.bride_name} & ${assigned.wedding.groom_name}` : "No wedding assigned"}</small></div>
                <div className={admin.is_active ? "status-badge success" : "status-badge danger"}>{admin.is_active ? "ACTIVE" : "DISABLED"}</div>
                <div className="record-action-row">
                  <button type="button" onClick={() => updateAdmin(admin.id, { isActive: !admin.is_active })}>{admin.is_active ? "Disable" : "Activate"}</button>
                  <button type="button" onClick={() => resetPassword(admin.id)}>Reset password</button>
                  <button type="button" className="danger" onClick={() => deleteAdmin(admin.id, admin.full_name || admin.email)}>Delete</button>
                </div>
              </article>
            );
          })}
          {clientAdmins.length === 0 && <p className="empty-state">No client Admin accounts yet.</p>}
        </div>
      </section>
    </div>
  );
}
