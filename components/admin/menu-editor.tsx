"use client";

import { useState, useTransition } from "react";
import { saveMenus } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Menu, MenuItem } from "@/lib/types";

export function MenuEditor({ initial }: { initial: Menu[] }) {
  const [menus, setMenus] = useState(initial);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="grid gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          const result = await saveMenus(menus);
          if (!result.ok) setError(result.error);
          else {
            setError("");
            setSaved(true);
          }
        });
      }}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl text-[#0b4324]">Menus</h1>
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save menus"}</Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {saved ? <p className="text-sm text-[#0b4324]">Menus saved.</p> : null}
      {menus.map((menu, menuIndex) => (
        <section key={menu.key} className="rounded-xl bg-white p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <Input value={menu.name} onChange={(event) => updateMenu(menuIndex, { name: event.target.value })} aria-label="Menu name" />
            <Input value={menu.key} onChange={(event) => updateMenu(menuIndex, { key: event.target.value })} aria-label="Menu key" />
            <Input value={menu.location || ""} onChange={(event) => updateMenu(menuIndex, { location: event.target.value })} aria-label="Location" />
          </div>
          <ItemList
            items={menu.items}
            onChange={(items) => updateMenu(menuIndex, { items })}
          />
        </section>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() => setMenus([...menus, { key: "new-menu", name: "New menu", location: "header", items: [{ label: "Home", href: "/" }] }])}
      >
        Add menu
      </Button>
    </form>
  );

  function updateMenu(index: number, patch: Partial<Menu>) {
    setSaved(false);
    setMenus((current) => current.map((menu, menuIndex) => (menuIndex === index ? { ...menu, ...patch } : menu)));
  }
}

function ItemList({ items, onChange }: { items: MenuItem[]; onChange: (items: MenuItem[]) => void }) {
  return (
    <div className="mt-4 grid gap-3">
      {items.map((item, index) => (
        <div key={index} className="rounded-lg border p-3">
          <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
            <Input value={item.label} aria-label="Label" onChange={(event) => replace(index, { ...item, label: event.target.value })} />
            <Input value={item.href || ""} aria-label="Link" placeholder="/path or https://" onChange={(event) => replace(index, { ...item, href: event.target.value })} />
            <Button type="button" variant="ghost" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}>
              Remove
            </Button>
          </div>
          <div className="mt-3 border-l pl-3">
            <ItemList items={item.children || []} onChange={(children) => replace(index, { ...item, children })} />
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, { label: "New link", href: "/" }])}>
        Add link
      </Button>
    </div>
  );

  function replace(index: number, item: MenuItem) {
    onChange(items.map((current, currentIndex) => (currentIndex === index ? item : current)));
  }
}
