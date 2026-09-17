"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";

type GalleryImage = { id: string; public_url: string; caption: string | null; sort_order: number; is_featured: boolean };

export default function GalleryManager({ initialImages }: { initialImages: GalleryImage[] }) {
  const [images, setImages] = useState(initialImages);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function upload(event: FormEvent) {
    event.preventDefault(); if (!file) return;
    setLoading(true); setNotice("");
    const form = new FormData(); form.append("file", file); form.append("caption", caption);
    const response = await fetch("/api/gallery", { method: "POST", body: form }); const data = await response.json();
    if (!response.ok) setNotice(data.error ?? "Could not upload image.");
    else { setImages((current) => [...current, data.image]); setFile(null); setCaption(""); setNotice("Photo uploaded. It is now available in the public gallery."); }
    setLoading(false);
  }

  async function remove(id: string) {
    if (!confirm("Remove this photo from the gallery?")) return;
    const response = await fetch(`/api/gallery/${id}`, { method: "DELETE" }); const data = await response.json();
    if (!response.ok) return setNotice(data.error ?? "Could not remove photo.");
    setImages((current) => current.filter((image) => image.id !== id)); setNotice("Photo removed.");
  }

  async function toggleFeatured(image: GalleryImage) {
    const response = await fetch(`/api/gallery/${image.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isFeatured: !image.is_featured }) }); const data = await response.json();
    if (!response.ok) return setNotice(data.error ?? "Could not update image.");
    setImages((current) => current.map((item) => item.id === image.id ? data.image : item));
  }

  return <div className="admin-module-stack">
    <section className="admin-panel-card"><div className="admin-section-heading"><span>Wedding media</span><h2>Upload Gallery Photos</h2><p>JPG, PNG or WebP up to 10 MB. Images are stored in your free Supabase Storage bucket.</p></div>
      <form className="gallery-upload-form" onSubmit={upload}><label>Photo<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files?.[0] ?? null)} required /></label><label>Caption (optional)<input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="A beautiful moment together" /></label><button className="admin-primary-button" disabled={loading}>{loading ? "Uploading…" : "Upload Photo"}</button></form>{notice && <p className="admin-notice">{notice}</p>}</section>
    <section className="admin-panel-card"><div className="admin-section-heading"><span>Gallery</span><h2>Uploaded Photos</h2><p>Uploaded images appear before the original built-in gallery photos.</p></div><div className="admin-gallery-grid">{images.map((image) => <article key={image.id} className="admin-gallery-card"><div className="admin-gallery-image"><Image src={image.public_url} alt={image.caption || "Wedding gallery image"} fill unoptimized className="cover-image" /></div><div><strong>{image.caption || "Untitled photo"}</strong><div className="record-action-row"><button onClick={() => toggleFeatured(image)}>{image.is_featured ? "Featured" : "Mark featured"}</button><button className="danger" onClick={() => remove(image.id)}>Delete</button></div></div></article>)}{images.length === 0 && <p className="empty-state">No uploaded photos yet. The public gallery still uses the five original photos bundled with the project.</p>}</div></section>
  </div>;
}
