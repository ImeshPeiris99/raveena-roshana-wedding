import WeddingInvitation from "@/components/invitation/WeddingInvitation";
import { getWeddingConfig } from "@/lib/wedding-config";

export const dynamic = "force-dynamic";
export default async function Home() {
  const weddingData = await getWeddingConfig();
  return <WeddingInvitation weddingData={weddingData} />;
}
