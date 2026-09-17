import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import GalleryManager from "@/components/admin/GalleryManager";
import { getAccessibleWedding, getAuthenticatedAdmin } from "@/lib/admin-auth";
import { listGallery } from "@/lib/platform";

export default async function AdminGalleryPage() {
  const profile = await getAuthenticatedAdmin(); if (!profile) redirect("/admin/login");
  const wedding = await getAccessibleWedding(profile); if (!wedding) redirect("/admin/dashboard");
  return <AdminShell profile={profile} wedding={wedding}><div className="admin-page-heading"><div><p className="eyebrow">Media library</p><h1>Gallery Management</h1><p>Upload and manage photographs shown to wedding guests.</p></div></div><GalleryManager initialImages={await listGallery(wedding.id)} /></AdminShell>;
}
