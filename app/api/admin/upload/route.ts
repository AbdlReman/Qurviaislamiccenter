import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { cloudinaryConfigured, uploadImageBuffer } from "@/lib/cloudinary";
import { getDb } from "@/lib/mongodb";

const allowed = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"]);

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!cloudinaryConfigured()) {
    return NextResponse.json(
      { error: "Cloudinary is not configured. Set CLOUDINARY_URL or the cloud name, API key, and API secret." },
      { status: 503 },
    );
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  if (!allowed.has(file.type)) return NextResponse.json({ error: "Upload a PNG, JPEG, WebP, GIF, or AVIF image." }, { status: 400 });
  if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "Images must be 8MB or smaller." }, { status: 400 });

  try {
    const uploaded = await uploadImageBuffer(Buffer.from(await file.arrayBuffer()), file.name);
    const item = {
      publicId: uploaded.public_id,
      secureUrl: uploaded.secure_url,
      width: uploaded.width,
      height: uploaded.height,
      format: uploaded.format,
      alt: "",
      title: file.name.replace(/\.[^.]+$/, ""),
      mimeType: file.type,
      bytes: file.size,
      uploadedAt: new Date().toISOString(),
      isOriginal: true,
    };
    const db = await getDb();
    await db.collection("media").updateOne({ publicId: item.publicId }, { $set: item }, { upsert: true });
    return NextResponse.json({ item });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
