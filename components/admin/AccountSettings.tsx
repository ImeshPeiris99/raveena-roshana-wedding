"use client";

import { FormEvent, useState } from "react";

type Props = { fullName: string; email: string; role: string };

export default function AccountSettings({ fullName: initialName, email, role }: Props) {
  const [fullName, setFullName] = useState(initialName);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function save(event: FormEvent) {
    event.preventDefault(); setNotice("");
    if (password && password !== confirmPassword) return setNotice("New passwords do not match.");
    setLoading(true);
    const response = await fetch("/api/admin/account", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fullName, password: password || undefined }) });
    const data = await response.json();
    setNotice(response.ok ? "Account updated successfully." : data.error ?? "Could not update account.");
    if (response.ok) { setPassword(""); setConfirmPassword(""); }
    setLoading(false);
  }

  return <section className="admin-panel-card"><div className="admin-section-heading"><span>Security</span><h2>My Account</h2><p>Update your display name or change your password.</p></div><form className="admin-form-grid" onSubmit={save}><label>Email address<input value={email} readOnly /></label><label>Role<input value={role === "super_admin" ? "Super Admin" : "Client Admin"} readOnly /></label><label>Full name<input value={fullName} onChange={(e) => setFullName(e.target.value)} required /></label><label>New password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} placeholder="Leave blank to keep current password" /></label><label>Confirm new password<input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={8} /></label><button className="admin-primary-button" disabled={loading}>{loading ? "Saving…" : "Save Account"}</button></form>{notice && <p className="admin-notice">{notice}</p>}</section>;
}
