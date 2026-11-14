import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleView, HtmlFallback, PricingSection, SectionView } from "@/components/sections/page-view";
import { getContentByPath, getSettings, listPublicPaths } from "@/lib/content";
import { pathFromSlug } from "@/lib/paths";

type Props = { params: Promise<{ slug?: string[] }> };

export const instant = false;

export async function generateStaticParams() {
  try {
    const entries = await listPublicPaths();
    return entries.map((entry) => ({
      slug: entry.path === "/" ? [] : entry.path.split("/").filter(Boolean),
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const path = pathFromSlug(slug);
  const doc = await getContentByPath(path);
  if (!doc) return { title: "Page not found" };
  const title = doc.seo?.title || doc.title;
  const description = doc.seo?.description || doc.excerpt || "";
  const image = doc.seo?.ogImage || doc.featuredImage?.url || undefined;
  const canonical = doc.seo?.canonicalPath || path;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Qurvia Islamic Center",
      type: doc.kind === "post" ? "article" : "website",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const path = pathFromSlug(slug);
  const doc = await getContentByPath(path);
  if (!doc) notFound();
  if (doc.kind === "post" || !doc.sections?.length) {
    if (doc.slug === "pricing" && !doc.sections?.length) {
      const settings = await getSettings();
      return (
        <>
          <section className="bg-[#0b4324] py-16 text-center text-white">
            <div className="mx-auto max-w-3xl px-4">
              <p className="text-sm tracking-[0.16em] text-[#e3d879] uppercase">Qurvia Islamic Center</p>
              <h1 className="mt-3 font-[family-name:var(--font-patua)] text-4xl md:text-5xl">Pricing</h1>
              <p className="mt-4 text-lg text-white/85">One-to-one Quran classes, priced by course and weekly sessions.</p>
            </div>
          </section>
          <PricingSection plans={settings.pricingPlans} hint={doc.pricingHint} />
        </>
      );
    }
    if (doc.kind === "post") return <ArticleView doc={doc} />;
    return <HtmlFallback html={doc.contentHtml} title={doc.title} />;
  }
  return (
    <>
      {doc.sections.map((section, index) => (
        <SectionView key={section.id || `${section.type}-${index}`} section={section} pagePath={doc.path} />
      ))}
    </>
  );
}
