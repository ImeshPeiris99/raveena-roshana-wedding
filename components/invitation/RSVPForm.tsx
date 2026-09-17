"use client";

import { FormEvent, useState } from "react";

type RSVPFormProps = {
  token: string;
  displayName: string;
  databaseReady: boolean;
};

export default function RSVPForm({ token, displayName, databaseReady }: RSVPFormProps) {
  const [attending, setAttending] = useState("yes");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!databaseReady) {
      setStatus("Preview mode: connect Supabase to save RSVP responses permanently.");
      return;
    }

    setLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          attending: attending === "yes",
          message,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not save RSVP.");

      setStatus(attending === "yes" ? "Thank you — your attendance has been confirmed." : "Thank you — your response has been received.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not save RSVP.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="rsvp-form" onSubmit={submit}>
      <label>
        Invitation name
        <input type="text" value={displayName} readOnly />
      </label>

      <label>
        Will you attend?
        <select value={attending} onChange={(event) => setAttending(event.target.value)}>
          <option value="yes">Happily attending</option>
          <option value="no">Regretfully unable to attend</option>
        </select>
      </label>

      <label>
        Message to the couple
        <textarea
          rows={5}
          placeholder="Write a warm message..."
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
      </label>

      <button type="submit" disabled={loading}>{loading ? "Sending…" : "Submit RSVP"}</button>
      {status && <p className="rsvp-status">{status}</p>}
    </form>
  );
}
