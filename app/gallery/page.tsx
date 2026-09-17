import type { Metadata } from "next";
import GalleryClient from "@/components/gallery/GalleryClient";
import { getWeddingConfig } from "@/lib/wedding-config";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Gallery | Raveena & Roshana",
  description: "Wedding gallery of Raveena and Roshana.",
};

export default async function GalleryPage() {
  const weddingData = await getWeddingConfig();
  return <GalleryClient coupleName={weddingData.couple.display} photos={[...weddingData.galleryPhotos]} />;
}
