import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ContentEditor } from "@/components/admin/content-editor";
import { getContentById, listCategories } from "@/lib/admin-data";
import type { ContentDoc } from "@/lib/types";

function blank(kind: "page" | "post"): ContentDoc {
  return {
    id: "",
    title: "",
    slug: "",
    path: kind === "post" ? "/blog/" : "/",
    status: "draft",
    excerpt: "",
    contentHtml: "",
    sections: [],
    seo: {},
    featuredImage: null,
    kind,
    categories: [],
    author: "Qurvia Islamic Center",
  };
}

export function EditorPage({
  kind,
  params,
}: {
  kind: "page" | "post";
  params?: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<p>Loading editor…</p>}>
      <EditorBody kind={kind} params={params} />
    </Suspense>
  );
}

async function EditorBody({
  kind,
  params,
}: {
  kind: "page" | "post";
  params?: Promise<{ id: string }>;
}) {
  const id = params ? (await params).id : undefined;
  const categories = kind === "post" ? (await listCategories()).map((category) => category.slug) : [];
  if (!id) return <ContentEditor initial={blank(kind)} categories={categories} />;
  const doc = await getContentById(kind, id);
  if (!doc) notFound();
  return <ContentEditor initial={doc} categories={categories} />;
}
