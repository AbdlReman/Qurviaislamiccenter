import { Suspense } from "react";
import { deleteLead, setLeadStatus } from "@/app/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listLeads } from "@/lib/admin-data";
import { formatDate } from "@/lib/format";

async function Leads() {
  const leads = await listLeads();
  return (
    <div className="grid gap-4">
      <h1 className="text-3xl text-[#0b4324]">Trial requests</h1>
      {leads.length === 0 ? (
        <p className="rounded-xl bg-white p-6 text-sm text-[#5e5a4e]">No leads yet. Submissions from the contact page and the free-trial popup land here.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b text-[#5e5a4e]">
              <tr>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Person</th>
                <th className="px-4 py-3 font-medium">Course</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b align-top last:border-0">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatDate(lead.createdAt)}
                    <div className="mt-1">
                      <Badge variant={lead.status === "new" ? "default" : "secondary"}>{lead.status}</Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{lead.name}</p>
                    <p>{lead.email}</p>
                    <p>{lead.phone}</p>
                    {lead.message ? <p className="mt-1 text-[#5e5a4e]">{lead.message}</p> : null}
                    {lead.heardFrom ? <p className="text-[#5e5a4e]">Heard via {lead.heardFrom}</p> : null}
                  </td>
                  <td className="px-4 py-3">{lead.course || "—"}</td>
                  <td className="px-4 py-3">
                    {lead.source}
                    {lead.pagePath ? <div className="text-[#5e5a4e]">{lead.pagePath}</div> : null}
                  </td>
                  <td className="px-4 py-3">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
