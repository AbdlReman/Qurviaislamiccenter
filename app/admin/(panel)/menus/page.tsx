import { Suspense } from "react";
import { MenuEditor } from "@/components/admin/menu-editor";
import { listMenus } from "@/lib/admin-data";

async function Menus() {
  const menus = await listMenus();
  return <MenuEditor initial={menus} />;
}

export default function MenusPage() {
  return (
    <Suspense fallback={<p>Loading menus…</p>}>
      <Menus />
    </Suspense>
  );
}
