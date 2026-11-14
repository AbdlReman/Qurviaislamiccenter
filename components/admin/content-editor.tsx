"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteContent, saveContent } from "@/app/admin/actions";
import { FieldEditor } from "@/components/admin/field-editor";
import { MediaPicker } from "@/components/admin/media-picker";
import { TinyEditor } from "@/components/admin/tiny-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/paths";
import type { ContentDoc, Section } from "@/lib/types";

const TEMPLATES: { type: string; label: string; section: Section }[] = [
  { type: "hero", label: "Hero", section: { type: "hero", heading: "", subheading: "", buttons: [{ text: "Get free trial", href: "/contact-us" }] } },
  { type: "pageHeader", label: "Page header", section: { type: "pageHeader", heading: "", breadcrumb: "" } },
  { type: "content", label: "Content", section: { type: "content", heading: "", bodyHtml: "<p></p>", layout: "stack" } },
  { type: "cards", label: "Cards", section: { type: "cards", heading: "", items: [{ title: "", description: "", href: "", buttonText: "Learn more" }] } },
  { type: "features", label: "Features", section: { type: "features", heading: "", items: [{ title: "", descriptionHtml: "<p></p>" }] } },
  { type: "faq", label: "FAQ", section: { type: "faq", heading: "FAQs", items: [{ question: "", answerHtml: "<p></p>" }] } },
  { type: "cta", label: "Call to action", section: { type: "cta", text: "", buttons: [{ text: "Get your free trial", href: "/contact-us" }] } },
  { type: "quote", label: "Quote", section: { type: "quote", text: "" } },
  { type: "stats", label: "Stats", section: { type: "stats", heading: "", items: [{ value: "1", suffix: "+", label: "" }] } },
  { type: "team", label: "Team", section: { type: "team", heading: "", items: [{ name: "", bio: "" }] } },
  { type: "testimonials", label: "Testimonials", section: { type: "testimonials", heading: "", items: [{ content: "", name: "", title: "" }] } },
  { type: "contactForm", label: "Contact form", section: { type: "contactForm", heading: "Contact", formHeading: "Free trial", contactItems: [], form: { formName: "Contact", submitText: "Send", fields: [] } } },
  { type: "subjects", label: "Subjects", section: { type: "subjects", heading: "Subjects", ctaText: "Book Free Trial", ctaHref: "/contact-us", items: [] } },
  { type: "latestPosts", label: "Latest posts", section: { type: "latestPosts", heading: "Islamic Educational Posts", source: "posts" } },
  { type: "postsArchive", label: "Blog archive", section: { type: "postsArchive", heading: "Blog", source: "posts" } },
  { type: "image", label: "Image", section: { type: "image", layout: "stack", images: [] } },
];

export function ContentEditor({ initial, categories = [] }: { initial: ContentDoc; categories?: string[] }) {
  const router = useRouter();
  const [doc, setDoc] = useState(initial);
  const [open, setOpen] = useState(0);
  const [mode, setMode] = useState<"form" | "json">("form");
  const [jsonText, setJsonText] = useState("");
  const [plainHtml, setPlainHtml] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function patch(partial: Partial<ContentDoc>) {
    setDoc((current) => ({ ...current, ...partial }));
    setSaved(false);
  }

  function updateSection(index: number, section: Section) {
    patch({ sections: (doc.sections ?? []).map((item, itemIndex) => (itemIndex === index ? section : item)) });
  }

  return (
    <form
      className="grid gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        setError("");
        startTransition(async () => {
          const result = await saveContent({
            kind: doc.kind,
            id: doc.id || undefined,
            previousPath: initial.path,
            title: doc.title,
            slug: doc.slug || slugify(doc.title),
            path: doc.path,
            status: doc.status,
            excerpt: doc.excerpt || "",
            contentHtml: doc.contentHtml || "",
            sections: doc.sections ?? [],
            seo: doc.seo ?? {},
            featuredImage: doc.featuredImage ?? null,
            author: doc.author,
            categories: doc.categories,
          });
          if (!result.ok) {
            setError(result.error);
            return;
          }
          setSaved(true);
          const base = doc.kind === "page" ? "/admin/pages" : "/admin/posts";
          if (!doc.id) router.replace(`${base}/${result.id}`);
          else router.refresh();
        });
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl text-[#0b4324]">{doc.id ? `Edit ${doc.kind}` : `New ${doc.kind}`}</h1>
          {doc.path ? (
            <a href={doc.path} className="text-sm text-[#aa771c] hover:underline" target="_blank" rel="noreferrer">
              View {doc.path}
            </a>
          ) : null}
        </div>
        <div className="flex gap-2">
          {doc.id ? (
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (!window.confirm("Delete this permanently?")) return;
                startTransition(async () => {
                  const result = await deleteContent(doc.kind, doc.id, doc.path);
                  if (!result.ok) setError(result.error);
                  else router.push(doc.kind === "page" ? "/admin/pages" : "/admin/posts");
                });
              }}
            >
              Delete
            </Button>
          ) : null}
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
      {error ? <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
      {saved ? <p className="rounded-md bg-[#e7f3ea] px-3 py-2 text-sm text-[#0b4324]">Saved. The public page will refresh on the next visit.</p> : null}

      <div className="grid gap-4 rounded-xl bg-white p-4 md:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={doc.title} onChange={(event) => patch({ title: event.target.value })} required />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={doc.slug}
            onChange={(event) => patch({ slug: event.target.value })}
            onBlur={() => {
              if (!doc.slug) patch({ slug: slugify(doc.title) });
            }}
            required
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="path">Path</Label>
          <Input id="path" value={doc.path} onChange={(event) => patch({ path: event.target.value })} required />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={doc.status}
            onChange={(event) => patch({ status: event.target.value })}
            className="h-8 rounded-lg border border-input bg-white px-2 text-sm"
          >
            <option value="publish">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <div className="grid gap-1.5 md:col-span-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea id="excerpt" value={doc.excerpt || ""} rows={3} onChange={(event) => patch({ excerpt: event.target.value })} />
        </div>
        {doc.kind === "post" ? (
          <>
            <div className="grid gap-1.5">
              <Label htmlFor="author">Author</Label>
              <Input id="author" value={doc.author || ""} onChange={(event) => patch({ author: event.target.value })} />
            </div>
            <fieldset className="grid gap-2">
              <legend className="text-sm font-medium">Categories</legend>
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                  <label key={category} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={(doc.categories || []).includes(category)}
                      onChange={(event) => {
                        const current = new Set(doc.categories || []);
                        if (event.target.checked) current.add(category);
                        else current.delete(category);
                        patch({ categories: [...current] });
                      }}
                    />
                    {category}
                  </label>
                ))}
              </div>
            </fieldset>
          </>
        ) : null}
        <div className="md:col-span-2">
          <Label>Featured image</Label>
          <div className="mt-2">
            <MediaPicker value={doc.featuredImage} onChange={(image) => patch({ featuredImage: image })} />
          </div>
        </div>
      </div>

      <div className="grid gap-3 rounded-xl bg-white p-4">
        <h2 className="text-xl text-[#0b4324]">Search</h2>
        <div className="grid gap-1.5">
          <Label htmlFor="seo-title">SEO title</Label>
          <Input id="seo-title" value={doc.seo?.title || ""} onChange={(event) => patch({ seo: { ...doc.seo, title: event.target.value } })} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="seo-description">SEO description</Label>
          <Textarea id="seo-description" value={doc.seo?.description || ""} rows={3} onChange={(event) => patch({ seo: { ...doc.seo, description: event.target.value } })} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="canonical">Canonical path</Label>
            <Input id="canonical" value={doc.seo?.canonicalPath || ""} onChange={(event) => patch({ seo: { ...doc.seo, canonicalPath: event.target.value } })} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="og">OG image URL</Label>
            <Input id="og" value={doc.seo?.ogImage || ""} onChange={(event) => patch({ seo: { ...doc.seo, ogImage: event.target.value } })} />
          </div>
        </div>
      </div>

      <div className="grid gap-3 rounded-xl bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl text-[#0b4324]">Body HTML</h2>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={plainHtml} onChange={(event) => setPlainHtml(event.target.checked)} />
            Plain HTML instead of TinyMCE
          </label>
        </div>
        {plainHtml ? (
          <Textarea value={doc.contentHtml || ""} rows={12} className="font-mono text-xs" onChange={(event) => patch({ contentHtml: event.target.value })} />
        ) : (
          <TinyEditor value={doc.contentHtml || ""} onChange={(contentHtml) => patch({ contentHtml })} height={420} />
        )}
      </div>

      <div className="grid gap-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-xl text-[#0b4324]">Sections</h2>
          <div className="flex gap-2">
            <select id="new-section" className="h-8 rounded-lg border bg-white px-2 text-sm" defaultValue="content">
              {TEMPLATES.map((template) => (
                <option key={template.type} value={template.type}>
                  {template.label}
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const select = document.getElementById("new-section") as HTMLSelectElement | null;
                const template = TEMPLATES.find((item) => item.type === select?.value) ?? TEMPLATES[2];
                const sections = [...(doc.sections ?? []), structuredClone(template.section)];
                patch({ sections });
                setOpen(sections.length - 1);
              }}
            >
              Add section
            </Button>
          </div>
        </div>
        {(doc.sections ?? []).map((section, index) => (
          <article key={section.id || index} className="rounded-xl bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button type="button" className="text-left" onClick={() => { setMode("form"); setOpen(open === index ? -1 : index); }}>
                <span className="text-xs tracking-wide text-[#a47f34] uppercase">{section.type}</span>
                <span className="mt-1 block font-medium">{section.heading || section.text || "Untitled section"}</span>
              </button>
              <div className="flex gap-1">
                <Button type="button" size="sm" variant="ghost" disabled={index === 0} onClick={() => move(index, -1)}>
                  Up
                </Button>
                <Button type="button" size="sm" variant="ghost" disabled={index === (doc.sections?.length || 1) - 1} onClick={() => move(index, 1)}>
                  Down
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    patch({ sections: (doc.sections ?? []).filter((_, itemIndex) => itemIndex !== index) });
                    setOpen(-1);
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
            {open === index ? (
              <div className="mt-4 grid gap-3">
                <div className="flex gap-2 text-sm">
                  <button type="button" className={mode === "form" ? "font-semibold text-[#0b4324]" : ""} onClick={() => setMode("form")}>
                    Form
                  </button>
                  <button
                    type="button"
                    className={mode === "json" ? "font-semibold text-[#0b4324]" : ""}
                    onClick={() => {
                      const { blocks, ...rest } = section;
                      void blocks;
                      setJsonText(JSON.stringify(rest, null, 2));
                      setMode("json");
                    }}
                  >
                    JSON
                  </button>
                </div>
                {mode === "json" ? (
                  <Textarea
                    value={jsonText}
                    rows={16}
                    className="font-mono text-xs"
                    onChange={(event) => {
                      const next = event.target.value;
                      setJsonText(next);
                      try {
                        const parsed = JSON.parse(next) as Section;
                        updateSection(index, { ...parsed, blocks: section.blocks });
                        setError("");
                      } catch {
                        setError("Section JSON is not valid yet. Fix it before saving.");
                      }
                    }}
                  />
                ) : (
                  <FieldEditor
                    label=""
                    value={section}
                    plainHtml={plainHtml}
                    onChange={(next) => updateSection(index, next as Section)}
                  />
                )}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </form>
  );

  function move(index: number, direction: -1 | 1) {
    const sections = [...(doc.sections ?? [])];
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const [item] = sections.splice(index, 1);
    sections.splice(target, 0, item);
    patch({ sections });
    setOpen(target);
  }
}
