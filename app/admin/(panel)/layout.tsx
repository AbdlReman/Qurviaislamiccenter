import { Suspense } from "react";
import { AdminShell } from "@/components/admin/shell";
import { requireAdmin } from "@/lib/auth";

async function Gate({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  return <AdminShell email={session.email}>{children}</AdminShell>;
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<main className="grid min-h-screen place-items-center bg-[#f6f3ea]">Loading the studio…</main>}>
      <Gate>{children}</Gate>
    </Suspense>
  );
}
