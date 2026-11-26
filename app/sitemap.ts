import type { MetadataRoute } from "next";
import { listPublicPaths } from "@/lib/content";
import { siteUrl } from "@/lib/paths";

function safeDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  try {
    const entries = await listPublicPaths();
    return entries.map((entry) => {
      const lastModified = safeDate(entry.updatedAt);
      return {
        url: entry.path === "/" ? base : `${base}${entry.path}`,
        ...(lastModified ? { lastModified } : {}),
        changeFrequency: entry.path.startsWith("/blog/") ? "monthly" : "weekly",
        priority: entry.path === "/" ? 1 : entry.path.startsWith("/blog/") ? 0.6 : 0.8,
      };
    });
  } catch {
    return [{ url: base }];
  }
}
