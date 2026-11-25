import { Suspense } from "react";
import { deleteLead, setLeadStatus } from "@/app/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listLeads } from "@/lib/admin-data";
import { formatDate } from "@/lib/format";
import type { Lead } from "@/lib/types";

const KNOWN = new Set(["name", "phone", "email", "course", "message", "heardFrom"]);

function extraDetails(lead: Lead): [string, string][] {
  if (!lead.details) return [];
  return Object.entries(lead.details).filter(([key]) => {
    const normalized = key.replace(/^form_fields\[|\]$/g, "").toLowerCase();
    if (KNOWN.has(key) || KNOWN.has(normalized)) return false;
    if (/name|email|phone|tel|message|course|hear|ec3694d|1e2d594|cc5c6b5/i.test(key)) return false;
    return true;
  });
}

async function Leads() {
  const leads = await listLeads();
  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-3xl text-[#0b4324]">Form submissions</h1>
        <p className="mt-1 text-sm text-[#5e5a4e]">
          Contact page and free-trial popup requests land here automatically.
        </p>
      </div>
      {leads.length === 0 ? (
        <p className="rounded-xl bg-white p-6 text-sm text-[#5e5a4e]">
          No submissions yet. When someone fills the trial or contact form, their details appear here.
        </p>
      ) : (
        <div className="grid gap-3">
          {leads.map((lead) => {
            const extras = extraDetails(lead);
            return (
              <article key={lead.id} className="rounded-xl bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-medium text-[#0b4324]">{lead.name}</h2>
                      <Badge variant={lead.status === "new" ? "default" : "secondary"}>{lead.status}</Badge>
                      <span className="text-xs text-[#5e5a4e]">{lead.source}</span>
                    </div>
                    <p className="mt-1 text-sm text-[#5e5a4e]">
                      {formatDate(lead.createdAt)}
                      {lead.pagePath ? ` · ${lead.pagePath}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <form action={setLeadStatus.bind(null, lead.id, lead.status === "new" ? "read" : "new")}>
                      <Button type="submit" size="sm" variant="outline">
                        Mark {lead.status === "new" ? "read" : "new"}
                      </Button>
                    </form>
                    <form action={deleteLead.bind(null, lead.id)}>
                      <Button type="submit" size="sm" variant="ghost">
                        Delete
                      </Button>
                    </form>
                  </div>
                </div>

                <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <dt className="text-xs tracking-wide text-[#5e5a4e] uppercase">Email</dt>
                    <dd className="mt-0.5 break-all text-sm">
                      <a href={`mailto:${lead.email}`} className="text-[#0b4324] underline-offset-2 hover:underline">
                        {lead.email}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs tracking-wide text-[#5e5a4e] uppercase">Phone / WhatsApp</dt>
                    <dd className="mt-0.5 text-sm">
                      <a href={`tel:${lead.phone.replace(/\s+/g, "")}`} className="text-[#0b4324] underline-offset-2 hover:underline">
                        {lead.phone}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs tracking-wide text-[#5e5a4e] uppercase">Course</dt>
                    <dd className="mt-0.5 text-sm">{lead.course || "—"}</dd>
                  </div>
                  {lead.heardFrom ? (
                    <div>
                      <dt className="text-xs tracking-wide text-[#5e5a4e] uppercase">Heard from</dt>
                      <dd className="mt-0.5 text-sm">{lead.heardFrom}</dd>
                    </div>
                  ) : null}
                  {lead.message ? (
                    <div className="sm:col-span-2 lg:col-span-3">
                      <dt className="text-xs tracking-wide text-[#5e5a4e] uppercase">Message</dt>
                      <dd className="mt-0.5 whitespace-pre-wrap text-sm leading-6">{lead.message}</dd>
                    </div>
                  ) : null}
                  {extras.map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-xs tracking-wide text-[#5e5a4e] uppercase">{key}</dt>
                      <dd className="mt-0.5 text-sm">{value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function LeadsPage() {
  return (
    <Suspense fallback={<p>Loading leads…</p>}>
      <Leads />
    </Suspense>
  );
}
