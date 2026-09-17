import type { Metadata } from "next";
import { notFound } from "next/navigation";
import WeddingInvitation from "@/components/invitation/WeddingInvitation";
import { getInvitationRecord } from "@/lib/supabase-rest";
import { getWeddingConfig } from "@/lib/wedding-config";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const invite = await getInvitationRecord(token).catch(() => null);
  return {
    title: invite ? `${invite.display_name} | Raveena & Roshana` : "Invitation not found",
    description: invite ? `Personal wedding invitation for ${invite.display_name}.` : "Wedding invitation link not found.",
  };
}

export default async function InviteTokenPage({ params }: Props) {
  const { token } = await params;
  const invite = await getInvitationRecord(token).catch(() => null);
  if (!invite) notFound();
  const weddingData = await getWeddingConfig();
  return <WeddingInvitation guestLabel={invite.display_name} rsvpHref={`/rsvp/${token}`} weddingData={weddingData} />;
}
