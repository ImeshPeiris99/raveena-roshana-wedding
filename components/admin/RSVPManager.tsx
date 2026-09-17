"use client";

import { useMemo, useState } from "react";

type RSVP = {
  id: string;
  attending: boolean;
  message: string | null;
  submitted_at: string;
  invitation?: { display_name: string; whatsapp_number: string | null; token: string } | null;
};

export default function RSVPManager({ initialRSVPs }: { initialRSVPs: RSVP[] }) {
  const [rows, setRows] = useState(initialRSVPs);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "yes" | "no">("all");
  const [notice, setNotice] = useState("");

  const filtered = useMemo(() => rows.filter((row) => {
    const matches = (row.invitation?.display_name ?? "").toLowerCase().includes(query.toLowerCase());
    const status = filter === "all" || (filter === "yes" ? row.attending : !row.attending);
    return matches && status;
  }), [rows, query, filter]);

  async function changeStatus(id: string, attending: boolean) {
    const response = await fetch(`/api/admin-rsvps/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ attending }) });
    const data = await response.json();
    if (!response.ok) return setNotice(data.error ?? "Could not update RSVP.");
    setRows((current) => current.map((row) => row.id === id ? { ...row, attending } : row));
    setNotice("RSVP updated.");
  }

  async function remove(id: string) {
    if (!confirm("Remove this RSVP response? The guest can submit again later.")) return;
    const response = await fetch(`/api/admin-rsvps/${id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) return setNotice(data.error ?? "Could not delete RSVP.");
    setRows((current) => current.filter((row) => row.id !== id));
    setNotice("RSVP removed.");
  }

  return (
    <section className="admin-panel-card">
      <div className="admin-toolbar">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search guest name…" />
        <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
          <option value="all">All responses</option><option value="yes">Attending</option><option value="no">Not attending</option>
        </select>
      </div>
      {notice && <p className="admin-notice">{notice}</p>}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Guest</th><th>Status</th><th>Message</th><th>Submitted</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id}>
                <td><strong>{row.invitation?.display_name ?? "Guest"}</strong><small>{row.invitation?.whatsapp_number ?? "No WhatsApp"}</small></td>
                <td><span className={row.attending ? "status-badge success" : "status-badge danger"}>{row.attending ? "ATTENDING" : "NOT ATTENDING"}</span></td>
                <td className="message-cell">{row.message || "—"}</td>
                <td>{new Date(row.submitted_at).toLocaleString()}</td>
                <td><div className="record-action-row"><button onClick={() => changeStatus(row.id, !row.attending)}>{row.attending ? "Mark declined" : "Mark attending"}</button><button className="danger" onClick={() => remove(row.id)}>Remove</button></div></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={5}><p className="empty-state">No RSVP responses match this view.</p></td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
