import { cleanHtml } from "@/lib/sanitize";

export function Prose({ html, className = "" }: { html?: string | null; className?: string }) {
  const safe = cleanHtml(html);
  if (!safe.trim()) return null;
  return <div className={`prose-ilm ${className}`} dangerouslySetInnerHTML={{ __html: safe }} />;
}
