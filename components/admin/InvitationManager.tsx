"use client";

import { FormEvent, useMemo, useState } from "react";

type InviteType = "single" | "couple" | "family" | "custom";
type Invitation = {
  id: string;
  token: string;
  display_name: string;
  invitation_type: InviteType;
  whatsapp_number: string | null;
  created_at: string;
};

type GeneratedInvite = { displayName: string; type: InviteType; whatsapp: string; link: string; persisted: boolean };

function normalizeWhatsAppNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("0")) return `94${digits.slice(1)}`;
  if (digits.startsWith("94")) return digits;
  return digits;
}

function premiumMessage(name: string, link: string) {
  return `Dear ${name},\n\nWith hearts full of joy, Raveena & Roshana warmly invite you to share in one of the most meaningful moments of their lives as they begin their forever together. ✨💍\n\n📅 21st October 2026\n📍 Courtyard by Marriott Colombo — Grand Sapphire Ballroom\n\nYour personalised wedding invitation:\n${link}\n\nInside, you will find the celebration programme, venue details, gallery and RSVP. Your presence would make this beautiful evening even more memorable.\n\nWith love,\nRaveena & Roshana 🤍`;
}

export default function InvitationManager({ initialInvitations }: { initialInvitations: Invitation[] }) {
  const [rows, setRows] = useState(initialInvitations);
  const [displayName, setDisplayName] = useState("");
  const [type, setType] = useState<InviteType>("single");
  const [whatsapp, setWhatsapp] = useState("");
  const [generated, setGenerated] = useState<GeneratedInvite | null>(null);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Invitation | null>(null);

  const filtered = useMemo(() => rows.filter((row) => `${row.display_name} ${row.whatsapp_number ?? ""}`.toLowerCase().includes(query.toLowerCase())), [rows, query]);
  const shareUrl = useMemo(() => generated ? `https://wa.me/${normalizeWhatsAppNumber(generated.whatsapp)}?text=${encodeURIComponent(message)}` : "", [generated, message]);

  function linkFor(token: string) {
    return `${window.location.origin}/invite/${token}`;
  }

  async function createInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = displayName.trim();
    if (!name) return;
    setLoading(true); setNotice("");
    const response = await fetch("/api/invitations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ displayName: name, invitationType: type, whatsappNumber: whatsapp.trim() }) });
    const data = await response.json();
    if (!response.ok) { setNotice(data.error ?? "Could not create invitation."); setLoading(false); return; }
    const record = data.invitation as Invitation;
    setRows((current) => [record, ...current]);
    const invite = { displayName: name, type, whatsapp: whatsapp.trim(), link: data.link, persisted: true };
    setGenerated(invite); setMessage(premiumMessage(name, data.link));
    setDisplayName(""); setWhatsapp(""); setType("single");
    setNotice("Invitation saved and ready to share."); setLoading(false);
  }

  async function saveEdit(event: FormEvent) {
    event.preventDefault(); if (!editing) return;
    const response = await fetch(`/api/invitations/${editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ displayName: editing.display_name, invitationType: editing.invitation_type, whatsappNumber: editing.whatsapp_number ?? "" }) });
    const data = await response.json();
    if (!response.ok) return setNotice(data.error ?? "Could not update invitation.");
    setRows((current) => current.map((row) => row.id === editing.id ? data.invitation : row));
    setEditing(null); setNotice("Invitation updated.");
  }

  async function remove(row: Invitation) {
    if (!confirm(`Delete the invitation for ${row.display_name}? Any RSVP linked to it will also be deleted.`)) return;
    const response = await fetch(`/api/invitations/${row.id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) return setNotice(data.error ?? "Could not delete invitation.");
    setRows((current) => current.filter((item) => item.id !== row.id));
    setNotice("Invitation deleted.");
  }

  function prepareShare(row: Invitation) {
    const link = linkFor(row.token);
    const invite = { displayName: row.display_name, type: row.invitation_type, whatsapp: row.whatsapp_number ?? "", link, persisted: true };
    setGenerated(invite); setMessage(premiumMessage(row.display_name, link)); window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function copyLink(link: string) {
    await navigator.clipboard.writeText(link); setCopied(true); window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="admin-module-stack">
      <section className="admin-panel-card">
        <div className="admin-section-heading"><span>Personal invitations</span><h2>Create invitation</h2><p>Create a unique guest link, save their WhatsApp number and prepare a premium editable sharing message.</p></div>
        <form className="invite-create-form" onSubmit={createInvite}>
          <div className="invite-form-grid">
            <label>Invitee display name<input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="e.g. Nimal Perera & Family" required /></label>
            <label>Invitation type<select value={type} onChange={(e) => setType(e.target.value as InviteType)}><option value="single">Single</option><option value="couple">Couple</option><option value="family">Family</option><option value="custom">Custom</option></select></label>
            <label className="invite-whatsapp-field">WhatsApp number<input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="e.g. 0771234567" inputMode="tel" required /></label>
          </div>
          <button className="admin-primary-button" type="submit" disabled={loading}>{loading ? "Creating…" : "Create invitation & WhatsApp message"}</button>
          {notice && <p className="admin-notice">{notice}</p>}
        </form>
      </section>

      {generated && <section className="generated-invite-panel admin-panel-card">
        <div className="generated-link-card"><span>Personal invitation</span><strong>{generated.displayName}</strong><code>{generated.link}</code><div className="generated-actions"><button type="button" onClick={() => copyLink(generated.link)}>{copied ? "Copied" : "Copy link"}</button><a href={generated.link} target="_blank" rel="noreferrer">Preview invitation</a></div></div>
        <label className="whatsapp-message-editor"><span>WhatsApp message — fully editable before sharing</span><textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={12} /></label>
        <button className="whatsapp-share-button" type="button" disabled={!generated.whatsapp.trim()} onClick={() => window.open(shareUrl, "_blank", "noopener,noreferrer")}>Open WhatsApp for {generated.whatsapp || "this guest"}</button>
        <p className="whatsapp-note">WhatsApp opens with the selected number and message prepared. The sender still confirms by tapping Send.</p>
      </section>}

      <section className="admin-panel-card">
        <div className="admin-section-heading"><span>Guest directory</span><h2>Invitation Links</h2><p>Edit guests, reopen links, prepare WhatsApp messages or remove invitations.</p></div>
        <div className="admin-toolbar"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or WhatsApp…" /><span>{filtered.length} invitations</span></div>
        <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Invitee</th><th>Type</th><th>WhatsApp</th><th>Created</th><th>Actions</th></tr></thead><tbody>
          {filtered.map((row) => <tr key={row.id}><td><strong>{row.display_name}</strong><small>{row.token}</small></td><td>{row.invitation_type}</td><td>{row.whatsapp_number || "—"}</td><td>{new Date(row.created_at).toLocaleDateString()}</td><td><div className="record-action-row"><a href={`/invite/${row.token}`} target="_blank" rel="noreferrer">Open</a><button onClick={() => prepareShare(row)}>WhatsApp</button><button onClick={() => setEditing({ ...row })}>Edit</button><button className="danger" onClick={() => remove(row)}>Delete</button></div></td></tr>)}
          {filtered.length === 0 && <tr><td colSpan={5}><p className="empty-state">No invitations found.</p></td></tr>}
        </tbody></table></div>
      </section>

      {editing && <div className="admin-modal-backdrop" onMouseDown={() => setEditing(null)}><form className="admin-modal" onSubmit={saveEdit} onMouseDown={(e) => e.stopPropagation()}><div className="admin-section-heading"><span>Edit</span><h2>Invitation Details</h2></div><label>Display name<input value={editing.display_name} onChange={(e) => setEditing({ ...editing, display_name: e.target.value })} /></label><label>Type<select value={editing.invitation_type} onChange={(e) => setEditing({ ...editing, invitation_type: e.target.value as InviteType })}><option value="single">Single</option><option value="couple">Couple</option><option value="family">Family</option><option value="custom">Custom</option></select></label><label>WhatsApp<input value={editing.whatsapp_number ?? ""} onChange={(e) => setEditing({ ...editing, whatsapp_number: e.target.value })} /></label><div className="record-action-row"><button className="admin-primary-button">Save changes</button><button type="button" onClick={() => setEditing(null)}>Cancel</button></div></form></div>}
    </div>
  );
}
