import "server-only";

import { wedding as fallback } from "@/lib/wedding-data";
import { createAdminClient, supabaseServerConfigured } from "@/lib/supabase/admin";
import { listGallery } from "@/lib/platform";

export type WeddingConfig = {
  couple: { bride: string; groom: string; display: string; monogram: string };
  event: {
    dateLabel: string;
    dateISO: string;
    venue: string;
    room: string;
    dressCode: string;
    rsvpDeadline: string;
    mapUrl: string;
  };
  programme: Array<{ time: string; title: string }>;
  story: string[];
  storyClosing: string;
  closing: string;
  contacts: Array<{ name: string; display: string; href: string }>;
  music: { src: string; title: string };
  photos: string[];
  galleryPhotos: string[];
  marketing?: { heading: string; body: string; services: string; phone: string; email: string };
};

function ordinal(day: number) {
  const mod100 = day % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${day}th`;
  if (day % 10 === 1) return `${day}st`;
  if (day % 10 === 2) return `${day}nd`;
  if (day % 10 === 3) return `${day}rd`;
  return `${day}th`;
}

function prettyDate(value: string | null | undefined, fallbackValue: string) {
  if (!value) return fallbackValue;
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return fallbackValue;
  const monthYear = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(date);
  return `${ordinal(date.getUTCDate())} ${monthYear}`;
}

function fallbackConfig(): WeddingConfig {
  return {
    couple: { ...fallback.couple },
    event: { ...fallback.event },
    programme: fallback.programme.map((item) => ({ ...item })),
    story: [...fallback.story],
    storyClosing: fallback.storyClosing,
    closing: fallback.closing,
    contacts: fallback.contacts.map((contact) => ({ ...contact })),
    music: { ...fallback.music },
    photos: [...fallback.photos],
    galleryPhotos: [...fallback.photos],
    marketing: {
      heading: "Digital Wedding Experience by Imesh Peiris",
      body: "Beautifully crafted wedding invitation websites designed to make your celebration memorable from the very first impression.",
      services: "Personalised guest invitations • Interactive RSVP • Elegant galleries • Seamless digital sharing",
      phone: "0767550215",
      email: "t.i.tpeeriya@gmail.com",
    },
  };
}

export async function getWeddingConfig(slug = "raveena-roshana"): Promise<WeddingConfig> {
  const base = fallbackConfig();
  if (!supabaseServerConfigured()) return base;

  try {
    const admin = createAdminClient();
    const { data: weddingRow } = await admin
      .from("weddings")
      .select("id,bride_name,groom_name,wedding_date,venue,room,dress_code,rsvp_deadline")
      .eq("slug", slug)
      .maybeSingle();
    if (!weddingRow) return base;

    const { data: settings } = await admin
      .from("wedding_settings")
      .select("setting_key,setting_value")
      .eq("wedding_id", weddingRow.id);
    const map = Object.fromEntries((settings ?? []).map((s: { setting_key: string; setting_value: unknown }) => [s.setting_key, s.setting_value]));
    const gallery = await listGallery(weddingRow.id).catch(() => []);
    const uploaded = gallery.map((image) => image.public_url);
    const galleryPhotos = [...uploaded, ...base.photos.filter((src) => !uploaded.includes(src))];

    const bride = weddingRow.bride_name || base.couple.bride;
    const groom = weddingRow.groom_name || base.couple.groom;
    const venue = weddingRow.venue || base.event.venue;

    return {
      ...base,
      couple: {
        bride,
        groom,
        display: `${bride} & ${groom}`,
        monogram: `${bride.charAt(0)} & ${groom.charAt(0)}`,
      },
      event: {
        ...base.event,
        dateLabel: prettyDate(weddingRow.wedding_date, base.event.dateLabel),
        dateISO: weddingRow.wedding_date || base.event.dateISO,
        venue,
        room: weddingRow.room || base.event.room,
        dressCode: weddingRow.dress_code || base.event.dressCode,
        rsvpDeadline: prettyDate(weddingRow.rsvp_deadline, base.event.rsvpDeadline),
        mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue)}`,
      },
      programme: Array.isArray(map.programme) ? map.programme as Array<{ time: string; title: string }> : base.programme,
      story: Array.isArray(map.story) ? map.story as string[] : base.story,
      contacts: Array.isArray(map.contacts) ? map.contacts as Array<{ name: string; display: string; href: string }> : base.contacts,
      photos: base.photos,
      galleryPhotos,
      marketing: map.marketing && typeof map.marketing === "object" ? map.marketing as WeddingConfig["marketing"] : base.marketing,
    };
  } catch {
    return base;
  }
}
