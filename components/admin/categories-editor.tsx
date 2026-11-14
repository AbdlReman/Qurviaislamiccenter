"use client";

import { useState, useTransition } from "react";
import { deleteCategory, saveCategory } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Category } from "@/lib/types";

export function CategoriesEditor({ initial }: { initial: Category[] }) {
  const [categories, setCategories] = useState(initial);
  const [draft, setDraft] = useState({ name: "", slug: "", description: "" });
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <div className="grid gap-6">
      <h1 className="text-3xl text-[#0b4324]">Categories</h1>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <ul className="grid gap-3">
        {categories.map((category) => (
          <li key={category.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-4 py-3">
            <div>
              <p className="font-medium">{category.name}</p>
              <p className="text-sm text-[#5e5a4e]">/{category.slug} · {category.count ?? 0} posts</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                startTransition(async () => {
                  await deleteCategory(category.id);
                  setCategories((current) => current.filter((item) => item.id !== category.id));
                });
              }}
            >
              Delete
            </Button>
          </li>
        ))}
      </ul>
      <form
        className="grid gap-3 rounded-xl bg-white p-4 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          startTransition(async () => {
            const result = await saveCategory(draft);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            setError("");
            setDraft({ name: "", slug: "", description: "" });
            window.location.reload();
          });
        }}
      >
        <Input placeholder="Name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required />
        <Input placeholder="Slug" value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} />
        <Textarea className="md:col-span-2" placeholder="Description" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Add category"}</Button>
      </form>
    </div>
  );
}
