"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/menus", label: "Menus" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/leads", label: "Form leads" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-[#f6f3ea] text-[#1c1c1c] md:grid md:grid-cols-[230px_1fr]">
      <aside className="bg-[#0b4324] text-white md:min-h-screen">
        <div className="px-4 py-5">
          <p className="font-[family-name:var(--font-display)] text-xl">Qurvia</p>
          <p className="text-xs tracking-[0.14em] text-[#e3d879] uppercase">Studio</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-col md:overflow-visible">
          {links.map((link) => {
            const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 text-sm whitespace-nowrap ${active ? "bg-white/15 text-[#e3d879]" : "text-white/90 hover:bg-white/10"}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <form action={logout} className="hidden px-3 py-4 md:block">
          <p className="mb-2 truncate text-xs text-white/70">{email}</p>
          <Button type="submit" variant="secondary" className="w-full">
            Sign out
          </Button>
        </form>
      </aside>
      <div>
        <div className="flex items-center justify-between border-b bg-white px-4 py-3 md:px-8">
          <p className="text-sm text-[#5e5a4e]">{email}</p>
          <form action={logout} className="md:hidden">
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </div>
        <div className="px-4 py-6 md:px-8 md:py-8">{children}</div>
      </div>
    </div>
  );
}
