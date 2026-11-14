import { ObjectId, type Document } from "mongodb";
import { connection } from "next/server";
import { getDb } from "@/lib/mongodb";
import { withId } from "@/lib/plain";
import type { Category, ContentDoc, Lead, MediaItem, Menu, Section, SiteSettings } from "@/lib/types";

async function adminDb() {
  await connection();
  return getDb();
}

function objectId(id: string): ObjectId | null {
  if (!ObjectId.isValid(id)) return null;
  return new ObjectId(id);
}

export async function listContent(kind: "page" | "post"): Promise<ContentDoc[]> {
  const db = await adminDb();
  const docs = await db
    .collection(kind === "page" ? "pages" : "posts")
    .find({}, { projection: { title: 1, slug: 1, path: 1, status: 1, updatedAt: 1, publishedAt: 1 } })
    .sort({ menuOrder: 1, title: 1 })
    .toArray();
  return docs.map((doc) => ({ ...(withId(doc) as Omit<ContentDoc, "kind">), kind, sections: [] }));
}

export async function getContentById(kind: "page" | "post", id: string): Promise<ContentDoc | null> {
  const oid = objectId(id);
  if (!oid) return null;
  const db = await adminDb();
  const doc = await db.collection(kind === "page" ? "pages" : "posts").findOne({ _id: oid }, { projection: { rawHtml: 0 } });
  if (!doc) return null;
  const plain = withId(doc) as Omit<ContentDoc, "kind">;
  return { ...plain, sections: (plain.sections as Section[] | undefined) ?? [], kind };
}

export async function listCategories(): Promise<Category[]> {
  const db = await adminDb();
  const docs = await db.collection("categories").find({}).sort({ name: 1 }).toArray();
  return docs.map((doc) => withId(doc) as Category);
}

export async function listMenus(): Promise<Menu[]> {
  const db = await adminDb();
  const docs = await db.collection("menus").find({}).sort({ key: 1 }).toArray();
  return docs.map((doc) => {
    const plain = withId(doc) as Menu & { id: string };
    return { key: plain.key, name: plain.name, location: plain.location, items: plain.items ?? [] };
  });
}

export async function getRawSettings(): Promise<SiteSettings | null> {
  const db = await adminDb();
  const doc = await db.collection("settings").findOne({ key: "site" });
  if (!doc) return null;
  const plain = withId(doc) as SiteSettings & { id?: string };
  delete plain.id;
  return plain;
}

export async function listLeads(): Promise<Lead[]> {
  const db = await adminDb();
  const docs = await db.collection("leads").find({}).sort({ createdAt: -1 }).limit(300).toArray();
  return docs.map((doc) => withId(doc) as Lead);
}

export async function listMedia(query = ""): Promise<MediaItem[]> {
  const db = await adminDb();
  const filter: Document = {};
  if (query.trim()) {
    const safe = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { title: { $regex: safe, $options: "i" } },
      { publicId: { $regex: safe, $options: "i" } },
      { alt: { $regex: safe, $options: "i" } },
    ];
  }
  const docs = await db.collection("media").find(filter).sort({ uploadedAt: -1, title: 1 }).limit(240).toArray();
  return docs.map((doc) => withId(doc) as MediaItem);
}

export async function counts(): Promise<{ pages: number; posts: number; leads: number; media: number; newLeads: number }> {
  const db = await adminDb();
  const [pages, posts, leads, media, newLeads] = await Promise.all([
    db.collection("pages").countDocuments(),
    db.collection("posts").countDocuments(),
    db.collection("leads").countDocuments(),
    db.collection("media").countDocuments(),
    db.collection("leads").countDocuments({ status: "new" }),
  ]);
  return { pages, posts, leads, media, newLeads };
}
