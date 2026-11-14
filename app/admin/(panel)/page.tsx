import Link from "next/link";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { counts, listLeads } from "@/lib/admin-data";
import { formatDate } from "@/lib/format";

async function Overview() {
  const [stats, leads] = await Promise.all([counts(), listLeads()]);
  const cards = [
    { label: "Pages", value: stats.pages, href: "/admin/pages" },
    { label: "Posts", value: stats.posts, href: "/admin/posts" },
    { label: "Media", value: stats.media, href: "/admin/media" },
    { label: "New leads", value: stats.newLeads, href: "/admin/leads" },
  ];
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl text-[#0b4324]">Overview</h1>
        <p className="mt-2 max-w-2xl text-[#5e5a4e]">
          Pages, posts, menus, and trial requests for Qurvia Islamic Center. Changes publish back to the public site as soon as you save.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-sm text-[#5e5a4e]">{card.label}</p>
            <p className="mt-2 font-[family-name:var(--font-patua)] text-4xl text-[#0b4324]">{card.value}</p>
          </Link>
        ))}
      </div>
      <section className="rounded-xl bg-white p-4">
        <h2 className="text-xl text-[#0b4324]">Latest trial requests</h2>
        {leads.length === 0 ? (
          <p className="mt-3 text-sm text-[#5e5a4e]">No one has requested a trial yet.</p>
        ) : (
          <ul className="mt-3 divide-y">
            {leads.slice(0, 6).map((lead) => (
              <li key={lead.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <span>
                  <strong>{lead.name}</strong> · {lead.course || "Course not chosen"} · {lead.email}
                </span>
                <span className="flex items-center gap-2 text-[#5e5a4e]">
                  {formatDate(lead.createdAt)}
                  <Badge variant={lead.status === "new" ? "default" : "secondary"}>{lead.status}</Badge>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function AdminHome() {
  return (
    <Suspense fallback={<p>Loading overview…</p>}>
      <Overview />
    </Suspense>
  );
}
