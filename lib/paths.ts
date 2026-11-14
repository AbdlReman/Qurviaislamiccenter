export function pathFromSlug(slug?: string[]): string {
  if (!slug || slug.length === 0) return "/";
  const parts = slug.map((part) => decodeURIComponent(part).trim()).filter(Boolean);
  if (parts.length === 0) return "/";
  return `/${parts.join("/")}`;
}

export function normalizePath(input: string): string {
  let path = input.trim();
  if (!path.startsWith("/")) path = `/${path}`;
  path = path.replace(/\/{2,}/g, "/");
  if (path.length > 1) path = path.replace(/\/+$/, "");
  return path || "/";
}

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) return configured;
  return "https://ilmworldacademy.com";
}
