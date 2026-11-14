export function formatDate(iso?: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function parseCredit(credit?: string): { text: string; href: string | null } {
  if (!credit) return { text: "", href: null };
  const match = credit.match(/^(.*?)\s*\((https?:\/\/[^)]+)\)\s*$/);
  if (!match) return { text: credit, href: null };
  return { text: match[1].trim(), href: match[2] };
}

export function whatsAppHref(value?: string | null, url?: string | null): string {
  const digits = (value || "").replace(/\D/g, "");
  if (digits) return `https://wa.me/${digits}`;
  if (url) return url;
  return "https://wa.me/923709177700";
}

export function telHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  return `tel:${digits}`;
}
