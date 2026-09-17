"use client";

import { FormEvent, useState } from "react";

type ProgrammeItem = { time: string; title: string };
type Contact = { name: string; display: string; href: string };
type Marketing = { heading: string; body: string; services: string; phone: string; email: string };

type Props = {
  wedding: {
    bride_name: string; groom_name: string; wedding_date: string | null; venue: string | null; room: string | null;
    dress_code?: string | null; rsvp_deadline?: string | null;
  };
  settings: Record<string, unknown>;
};

const defaultProgramme: ProgrammeItem[] = [
  { time: "6:45 PM", title: "Welcome & Ceremony Start" },
  { time: "7:02 PM", title: "Poruwa Nakatha" },
  { time: "7:30 PM", title: "Reception & Partying" },
];

const defaultMarketing: Marketing = {
  heading: "Digital Wedding Experience by Imesh Peiris",
  body: "Beautifully crafted wedding invitation websites designed to make your celebration memorable from the very first impression.",
  services: "Personalised guest invitations • Interactive RSVP • Elegant galleries • Seamless digital sharing",
  phone: "0767550215",
  email: "t.i.tpeeriya@gmail.com",
};

export default function WeddingSettingsForm({ wedding, settings }: Props) {
  const [brideName, setBrideName] = useState(wedding.bride_name);
  const [groomName, setGroomName] = useState(wedding.groom_name);
  const [weddingDate, setWeddingDate] = useState(wedding.wedding_date ?? "2026-10-21");
  const [venue, setVenue] = useState(wedding.venue ?? "");
  const [room, setRoom] = useState(wedding.room ?? "");
  const [dressCode, setDressCode] = useState(wedding.dress_code ?? "Dress To Impress");
  const [rsvpDeadline, setRsvpDeadline] = useState(wedding.rsvp_deadline ?? "2026-10-01");
  const [programme, setProgramme] = useState<ProgrammeItem[]>((settings.programme as ProgrammeItem[] | undefined) ?? defaultProgramme);
  const [story, setStory] = useState<string[]>((settings.story as string[] | undefined) ?? []);
  const [contacts, setContacts] = useState<Contact[]>((settings.contacts as Contact[] | undefined) ?? []);
  const [marketing, setMarketing] = useState<Marketing>((settings.marketing as Marketing | undefined) ?? defaultMarketing);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setNotice("");
    const response = await fetch("/api/wedding-settings", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brideName, groomName, weddingDate, venue, room, dressCode, rsvpDeadline, programme, story, contacts, marketing }),
    });
    const data = await response.json();
    setNotice(response.ok ? "Wedding settings saved. Public invitation pages will use these values." : data.error ?? "Could not save settings.");
    setSaving(false);
  }

  return <form className="admin-module-stack" onSubmit={save}>
    <section className="admin-panel-card">
      <div className="admin-section-heading"><span>Event identity</span><h2>Wedding Details</h2><p>These details appear throughout the invitation, RSVP and sharing experience.</p></div>
      <div className="admin-form-grid two-col">
        <label>Bride name<input value={brideName} onChange={(e) => setBrideName(e.target.value)} /></label>
        <label>Groom name<input value={groomName} onChange={(e) => setGroomName(e.target.value)} /></label>
        <label>Wedding date<input type="date" value={weddingDate} onChange={(e) => setWeddingDate(e.target.value)} /></label>
        <label>RSVP deadline<input type="date" value={rsvpDeadline} onChange={(e) => setRsvpDeadline(e.target.value)} /></label>
        <label>Venue<input value={venue} onChange={(e) => setVenue(e.target.value)} /></label>
        <label>Room / Ballroom<input value={room} onChange={(e) => setRoom(e.target.value)} /></label>
        <label>Dress code<input value={dressCode} onChange={(e) => setDressCode(e.target.value)} /></label>
      </div>
    </section>

    <section className="admin-panel-card">
      <div className="admin-section-heading"><span>Timeline</span><h2>Programme</h2><p>Add, edit or remove programme items.</p></div>
      <div className="repeatable-list">{programme.map((item, index) => <div className="repeatable-row" key={`${index}-${item.time}`}><input value={item.time} onChange={(e) => setProgramme((current) => current.map((row, i) => i === index ? { ...row, time: e.target.value } : row))} placeholder="6:45 PM" /><input value={item.title} onChange={(e) => setProgramme((current) => current.map((row, i) => i === index ? { ...row, title: e.target.value } : row))} placeholder="Programme item" /><button type="button" onClick={() => setProgramme((current) => current.filter((_, i) => i !== index))}>Remove</button></div>)}</div>
      <button type="button" className="secondary-button" onClick={() => setProgramme((current) => [...current, { time: "", title: "" }])}>+ Add programme item</button>
    </section>

    <section className="admin-panel-card">
      <div className="admin-section-heading"><span>Story</span><h2>Our Love Story</h2><p>Each paragraph appears separately with the invitation&apos;s smooth scroll animations.</p></div>
      <div className="repeatable-list">{story.map((paragraph, index) => <div className="repeatable-row textarea-row" key={index}><textarea value={paragraph} rows={4} onChange={(e) => setStory((current) => current.map((row, i) => i === index ? e.target.value : row))} /><button type="button" onClick={() => setStory((current) => current.filter((_, i) => i !== index))}>Remove</button></div>)}</div>
      <button type="button" className="secondary-button" onClick={() => setStory((current) => [...current, ""])}>+ Add story paragraph</button>
    </section>

    <section className="admin-panel-card">
      <div className="admin-section-heading"><span>Contact details</span><h2>Couple Contacts</h2><p>These appear near the RSVP section.</p></div>
      <div className="repeatable-list">{contacts.map((contact, index) => <div className="repeatable-row contact-row-admin" key={index}><input value={contact.name} onChange={(e) => setContacts((current) => current.map((row, i) => i === index ? { ...row, name: e.target.value } : row))} placeholder="Name" /><input value={contact.display} onChange={(e) => setContacts((current) => current.map((row, i) => i === index ? { ...row, display: e.target.value, href: `tel:+94${e.target.value.replace(/\D/g, "").replace(/^0/, "")}` } : row))} placeholder="070-0000000" /><button type="button" onClick={() => setContacts((current) => current.filter((_, i) => i !== index))}>Remove</button></div>)}</div>
      <button type="button" className="secondary-button" onClick={() => setContacts((current) => [...current, { name: "", display: "", href: "" }])}>+ Add contact</button>
    </section>

    <section className="admin-panel-card">
      <div className="admin-section-heading"><span>Developer marketing</span><h2>Professional Service Credit</h2><p>Kept discreetly at the end of the invitation so the wedding remains the main focus.</p></div>
      <div className="admin-form-grid">
        <label>Heading<input value={marketing.heading} onChange={(e) => setMarketing({ ...marketing, heading: e.target.value })} /></label>
        <label>Marketing description<textarea rows={3} value={marketing.body} onChange={(e) => setMarketing({ ...marketing, body: e.target.value })} /></label>
        <label>Services line<input value={marketing.services} onChange={(e) => setMarketing({ ...marketing, services: e.target.value })} /></label>
        <label>Bookings phone<input value={marketing.phone} onChange={(e) => setMarketing({ ...marketing, phone: e.target.value })} /></label>
        <label>Email<input type="email" value={marketing.email} onChange={(e) => setMarketing({ ...marketing, email: e.target.value })} /></label>
      </div>
    </section>

    <div className="sticky-save-bar"><button className="admin-primary-button" disabled={saving}>{saving ? "Saving…" : "Save Wedding Settings"}</button>{notice && <span>{notice}</span>}</div>
  </form>;
}
