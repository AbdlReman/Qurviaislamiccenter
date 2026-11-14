import type { MetadataRoute } from "next";
import { listPublicPaths } from "@/lib/content";
import { siteUrl } from "@/lib/paths";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  try {
    const entries = await listPublicPaths();
    return entries.map((entry) => ({
      url: entry.path === "/" ? base : `${base}${entry.path}`,
      lastModified: entry.updatedAt ? new Date(entry.updatedAt) : undefined,
      changeFrequency: entry.path.startsWith("/blog/") ? "monthly" : "weekly",
      priority: entry.path === "/" ? 1 : entry.path.startsWith("/blog/") ? 0.6 : 0.8,
    }));
  } catch {
    return [{ url: base }];
  }
}
