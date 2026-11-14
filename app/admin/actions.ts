"use server";

import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";
import { clearSessionCookie, credentialsMatch, getSession, setSessionCookie } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { normalizePath, slugify } from "@/lib/paths";
import { revalidateContent } from "@/lib/revalidate-content";
import type { Category, ContentInput, Menu, MenuItem, PricingPlan, SiteSettings } from "@/lib/types";

function duplicate(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "code" in error && (error as { code?: number }).code === 11000);
}

async function assertAdmin(): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
}

export async function login(formData: FormData): Promise<{ ok: false; error: string } | void> {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD || !process.env.AUTH_SECRET) {
    return { ok: false, error: "Set ADMIN_EMAIL, ADMIN_PASSWORD, and AUTH_SECRET before signing in." };
  }
  const matches = await credentialsMatch(email, password);
  if (!matches) return { ok: false, error: "Those credentials were not recognised." };
  await setSessionCookie(email.trim().toLowerCase());
  const next = String(formData.get("next") || "/admin");
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logout(): Promise<void> {
  await clearSessionCookie();
  redirect("/admin/login");
}

export async function saveContent(input: ContentInput): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  await assertAdmin();
  const title = input.title.trim();
  const slug = slugify(input.slug || title);
  const path = normalizePath(input.path || `/${slug}`);
  if (!title || !slug) return { ok: false, error: "Title and slug are required." };
  if (path.startsWith("/admin") || path.startsWith("/api")) return { ok: false, error: "That path is reserved." };
  const status = input.status === "draft" ? "draft" : "publish";
  const collection = input.kind === "post" ? "posts" : "pages";
  const now = new Date().toISOString();
  const fields = {
    title,
    slug,
    path,
    status,
    excerpt: input.excerpt.trim(),
    contentHtml: input.contentHtml,
    sections: input.sections ?? [],
    seo: {
      title: input.seo.title?.trim() || title,
      description: input.seo.description?.trim() || input.excerpt.trim(),
      ogImage: input.seo.ogImage || null,
      canonicalPath: input.seo.canonicalPath?.trim() || path,
    },
    featuredImage: input.featuredImage,
    updatedAt: now,
    ...(input.kind === "post"
      ? { author: input.author?.trim() || "Qurvia Islamic Center", categories: input.categories ?? [], tags: [] }
      : {}),
  };

  try {
    const db = await getDb();
    const col = db.collection(collection);
    if (input.id) {
      if (!ObjectId.isValid(input.id)) return { ok: false, error: "Unknown document." };
      const _id = new ObjectId(input.id);
      const clash = await col.findOne({
        $or: [{ path }, { slug }],
        _id: { $ne: _id },
      });
      if (clash) return { ok: false, error: "Another entry already uses that path or slug." };
      await col.updateOne({ _id }, { $set: fields });
      revalidateContent([path, input.previousPath || "", input.kind === "post" ? "/blog" : ""]);
      if (input.kind === "post") await refreshCategoryCounts();
      return { ok: true, id: input.id };
    }
    const inserted = await col.insertOne({ ...fields, publishedAt: now, menuOrder: 0, template: null });
    revalidateContent([path, input.kind === "post" ? "/blog" : ""]);
    if (input.kind === "post") await refreshCategoryCounts();
    return { ok: true, id: inserted.insertedId.toString() };
  } catch (error) {
    if (duplicate(error)) return { ok: false, error: "Another entry already uses that path or slug." };
    throw error;
  }
}

export async function deleteContent(
  kind: "page" | "post",
  id: string,
  path: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await assertAdmin();
  if (!ObjectId.isValid(id)) return { ok: false, error: "Unknown document." };
  const db = await getDb();
  await db.collection(kind === "post" ? "posts" : "pages").deleteOne({ _id: new ObjectId(id) });
  revalidateContent([path, kind === "post" ? "/blog" : ""]);
  if (kind === "post") await refreshCategoryCounts();
  return { ok: true };
}

async function refreshCategoryCounts(): Promise<void> {
  const db = await getDb();
  const categories = await db.collection("categories").find({}).toArray();
  await Promise.all(
    categories.map(async (category) => {
      const count = await db.collection("posts").countDocuments({ categories: category.slug, status: "publish" });
      await db.collection("categories").updateOne({ _id: category._id }, { $set: { count } });
    }),
  );
}

export async function saveCategory(input: {
  id?: string;
  name: string;
  slug: string;
  description: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  await assertAdmin();
  const name = input.name.trim();
  const slug = slugify(input.slug || name);
  if (!name || !slug) return { ok: false, error: "Name and slug are required." };
  const fields: Omit<Category, "id"> = {
    name,
    slug,
    description: input.description.trim(),
    path: `/category/${slug}`,
    parentWpId: null,
  };
  const db = await getDb();
  try {
    if (input.id && ObjectId.isValid(input.id)) {
      await db.collection("categories").updateOne({ _id: new ObjectId(input.id) }, { $set: fields });
    } else {
      await db.collection("categories").insertOne({ ...fields, count: 0 });
    }
  } catch (error) {
    if (duplicate(error)) return { ok: false, error: "That slug is already used." };
    throw error;
  }
  await refreshCategoryCounts();
  revalidateContent(["/blog"]);
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<void> {
  await assertAdmin();
  if (!ObjectId.isValid(id)) return;
  const db = await getDb();
  await db.collection("categories").deleteOne({ _id: new ObjectId(id) });
  revalidateContent(["/blog"]);
}

export async function saveMenus(menus: Menu[]): Promise<{ ok: true } | { ok: false; error: string }> {
  await assertAdmin();
  const db = await getDb();
  for (const menu of menus) {
    if (!menu.key.trim() || !menu.name.trim()) return { ok: false, error: "Each menu needs a key and a name." };
    const items = cleanItems(menu.items || []);
    await db.collection("menus").updateOne(
      { key: menu.key.trim() },
      { $set: { key: menu.key.trim(), name: menu.name.trim(), location: menu.location || "header", items } },
      { upsert: true },
    );
  }
  revalidateContent(["/"]);
  return { ok: true };
}

function cleanItems(items: MenuItem[]): MenuItem[] {
  return items
    .map((item) => ({
      label: item.label.trim(),
      href: item.href?.trim() ? item.href.trim() : null,
      children: item.children?.length ? cleanItems(item.children) : undefined,
    }))
    .filter((item) => item.label);
}

export async function saveSettings(input: SiteSettings): Promise<{ ok: true } | { ok: false; error: string }> {
  await assertAdmin();
  if (!input.siteName?.trim()) return { ok: false, error: "Site name is required." };
  const plans: PricingPlan[] = (input.pricingPlans || []).map((plan) => ({
    name: plan.name.trim(),
    price: Number(plan.price) || 0,
    cadence: plan.cadence || "month",
    blurb: plan.blurb || "",
    features: (plan.features || []).map((feature) => feature.trim()).filter(Boolean),
    highlighted: Boolean(plan.highlighted),
    cta: plan.cta || "Book a free trial",
    href: plan.href || "/contact-us",
  }));
  const { id: _ignored, ...rest } = input as SiteSettings & { id?: string };
  void _ignored;
  const db = await getDb();
  await db.collection("settings").updateOne(
    { key: "site" },
    { $set: { ...rest, key: "site", pricingPlans: plans } },
    { upsert: true },
  );
  revalidateContent(["/", "/pricing", "/contact-us"]);
  return { ok: true };
}

export async function setLeadStatus(id: string, status: "new" | "read"): Promise<void> {
  await assertAdmin();
  if (!ObjectId.isValid(id)) return;
  const db = await getDb();
  await db.collection("leads").updateOne({ _id: new ObjectId(id) }, { $set: { status } });
}

export async function deleteLead(id: string): Promise<void> {
  await assertAdmin();
  if (!ObjectId.isValid(id)) return;
  const db = await getDb();
  await db.collection("leads").deleteOne({ _id: new ObjectId(id) });
}
