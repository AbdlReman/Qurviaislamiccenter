import { cacheLife, cacheTag } from "next/cache";
import { normalizeSettings } from "@/lib/defaults";
import { getDb } from "@/lib/mongodb";
import { withId } from "@/lib/plain";
import type { ContentDoc, Menu, PostCard, Section, SiteSettings } from "@/lib/types";

const publicProjection = { rawHtml: 0, "sections.blocks": 0 } as const;

function asContent(doc: Record<string, unknown>, kind: "page" | "post"): ContentDoc {
  const withIdentity = withId(doc);
  return {
    ...(withIdentity as Omit<ContentDoc, "kind">),
    sections: (withIdentity as { sections?: Section[] }).sections ?? [],
    kind,
  };
}

export async function getSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag("settings");
  cacheLife("hours");
  const db = await getDb();
  const doc = await db.collection("settings").findOne({ key: "site" });
  if (!doc) return normalizeSettings(null);
  const plain = withId(doc) as Partial<SiteSettings>;
  return normalizeSettings(plain);
}

export async function getMenus(): Promise<Menu[]> {
  "use cache";
  cacheTag("menus");
  cacheLife("hours");
  const db = await getDb();
  const docs = await db.collection("menus").find({}).sort({ key: 1 }).toArray();
  return docs.map((doc) => {
    const plain = withId(doc) as Menu & { id: string };
    return {
      key: plain.key,
      name: plain.name,
      location: plain.location,
      items: plain.items ?? [],
    };
  });
}

export async function getContentByPath(path: string): Promise<ContentDoc | null> {
  "use cache";
  cacheTag("pages", "posts", `path:${path}`);
  cacheLife("hours");
  const db = await getDb();
  const page = await db.collection("pages").findOne({ path, status: "publish" }, { projection: publicProjection });
  if (page) return asContent(page as Record<string, unknown>, "page");
  const post = await db.collection("posts").findOne({ path, status: "publish" }, { projection: publicProjection });
  if (post) return asContent(post as Record<string, unknown>, "post");
  return null;
}

export async function getPublishedPosts(): Promise<PostCard[]> {
  "use cache";
  cacheTag("posts");
  cacheLife("hours");
  const db = await getDb();
  const docs = await db
    .collection("posts")
    .find({ status: "publish" }, { projection: { title: 1, path: 1, excerpt: 1, publishedAt: 1, featuredImage: 1 } })
    .sort({ publishedAt: -1 })
    .toArray();
  return docs.map((doc) => {
    const plain = withId(doc) as PostCard & { id: string };
    return {
      title: plain.title,
      path: plain.path,
      excerpt: plain.excerpt,
      publishedAt: plain.publishedAt,
      featuredImage: plain.featuredImage ?? null,
    };
  });
}

export async function listPublicPaths(): Promise<{ path: string; updatedAt?: string }[]> {
  "use cache";
  cacheTag("pages", "posts");
  cacheLife("hours");
  const db = await getDb();
  const [pages, posts] = await Promise.all([
    db.collection("pages").find({ status: "publish" }, { projection: { path: 1, updatedAt: 1 } }).toArray(),
    db.collection("posts").find({ status: "publish" }, { projection: { path: 1, updatedAt: 1 } }).toArray(),
  ]);
  return [...pages, ...posts].map((doc) => ({
    path: String(doc.path),
    updatedAt: doc.updatedAt ? String(doc.updatedAt) : undefined,
  }));
}
