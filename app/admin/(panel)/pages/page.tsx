import Link from "next/link";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { listContent } from "@/lib/admin-data";
import { formatDate } from "@/lib/format";
import type { ContentDoc } from "@/lib/types";

export function ContentList({ kind, rows }: { kind: "page" | "post"; rows: ContentDoc[] }) {
  const base = kind === "page" ? "/admin/pages" : "/admin/posts";
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl text-[#0b4324]">{kind === "page" ? "Pages" : "Posts"}</h1>
        <Link href={`${base}/new`} className="rounded-lg bg-[#0b4324] px-3 py-2 text-sm text-white">
          New {kind}
        </Link>
      </div>
      <div className="overflow-x-auto rounded-xl bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b text-[#5e5a4e]">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Path</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b last:border-0">
                <td className="px-4 py-3">
                  <Link href={`${base}/${row.id}`} className="font-medium text-[#0b4324] hover:underline">
                    {row.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-[#5e5a4e]">{row.path}</td>
                <td className="px-4 py-3">
                  <Badge variant={row.status === "publish" ? "default" : "secondary"}>{row.status}</Badge>
                </td>
                <td className="px-4 py-3 text-[#5e5a4e]">{formatDate(row.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

async function Pages() {
  const rows = await listContent("page");
  return <ContentList kind="page" rows={rows} />;
}

export default function PagesIndex() {
  return (
    <Suspense fallback={<p>Loading pages…</p>}>
      <Pages />
    </Suspense>
  );
}
