import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getAccessibleWedding, getAuthenticatedAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { listGallery } from "@/lib/platform";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function GET() {
  const profile = await getAuthenticatedAdmin();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const wedding = await getAccessibleWedding(profile);
  if (!wedding) return NextResponse.json({ error: "No wedding assigned." }, { status: 403 });
  return NextResponse.json({ images: await listGallery(wedding.id) });
}

export async function POST(request: Request) {
  const profile = await getAuthenticatedAdmin();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const wedding = await getAccessibleWedding(profile);
  if (!wedding) return NextResponse.json({ error: "No wedding assigned." }, { status: 403 });

  const form = await request.formData();
  const file = form.get("file");
  const caption = String(form.get("caption") ?? "").trim();
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  if (!allowedTypes.has(file.type)) return NextResponse.json({ error: "Only JPG, PNG and WebP images are supported." }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Image must be smaller than 10 MB." }, { status: 400 });

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${wedding.slug}/${Date.now()}-${crypto.randomBytes(5).toString("hex")}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const admin = createAdminClient();
  const { error: uploadError } = await admin.storage.from("wedding-media").upload(path, buffer, { contentType: file.type, upsert: false });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: publicData } = admin.storage.from("wedding-media").getPublicUrl(path);
  const existing = await listGallery(wedding.id);
  const { data, error } = await admin.from("gallery_images").insert({
    wedding_id: wedding.id,
    storage_path: path,
    public_url: publicData.publicUrl,
    caption: caption || null,
    sort_order: existing.length,
  }).select("*").single();
  if (error) {
    await admin.storage.from("wedding-media").remove([path]);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ image: data });
}
