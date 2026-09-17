import Link from "next/link";
import { notFound } from "next/navigation";
import RSVPForm from "@/components/invitation/RSVPForm";
import { getInvitationRecord, supabaseConfigured } from "@/lib/supabase-rest";
import { getWeddingConfig } from "@/lib/wedding-config";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string }> };

export default async function RSVPPage({ params }: Props) {
  const { token } = await params;
  const databaseInvite = await getInvitationRecord(token).catch(() => null);
  if (!databaseInvite) notFound();

  const weddingData = await getWeddingConfig();
  const persisted = supabaseConfigured();

  return (
    <main className="rsvp-page">
      <div className="rsvp-card">
        <p className="eyebrow">RSVP</p>
        <h1>{databaseInvite.display_name}</h1>
        <p className="rsvp-subtitle">Kindly let {weddingData.couple.display} know whether you will be able to celebrate with them on {weddingData.event.dateLabel}.</p>
        <RSVPForm token={token} displayName={databaseInvite.display_name} databaseReady={persisted} />
        <div className="rsvp-links"><Link href={`/invite/${token}`}>← Back to personal invitation</Link><Link href="/">Open main invitation</Link></div>
      </div>
    </main>
  );
}
