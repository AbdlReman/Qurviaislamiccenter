import { CloudImage } from "@/components/site/cloud-image";
import { LeadForm } from "@/components/site/lead-form";
import { Prose } from "@/components/site/prose";
import { btnGold, btnGreen, SmartLink } from "@/components/site/smart-link";
import { RotatingWords } from "@/components/sections/rotating";
import { SubjectsExplorer } from "@/components/sections/subjects";
import { getPublishedPosts } from "@/lib/content";
import { DEFAULT_PRICING_PLANS } from "@/lib/defaults";
import { formatDate } from "@/lib/format";
import { cleanHtml } from "@/lib/sanitize";
import type { CloudImage as CloudImageData, ContentDoc, LinkButton, PostCard, PricingPlan, Section, Testimonial } from "@/lib/types";

function asImage(value: unknown): CloudImageData | null {
  if (!value || typeof value !== "object" || !("url" in value)) return null;
  const url = (value as CloudImageData).url;
  return typeof url === "string" && url ? (value as CloudImageData) : null;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function Heading({ children }: { children: string }) {
  return (
    <div className="mb-8 text-center">
      <h2 className="font-[family-name:var(--font-patua)] text-3xl text-[#0b4324] md:text-4xl">{children}</h2>
      <span className="mx-auto mt-3 block h-1 w-16 rounded bg-gradient-to-r from-[#dfd274] to-[#a47f34]" />
    </div>
  );
}

function ActionButtons({ buttons, className = "" }: { buttons?: LinkButton[]; className?: string }) {
  if (!buttons?.length) return null;
  return (
    <div className={`mt-6 flex flex-wrap gap-3 ${className}`}>
      {buttons.map((button, index) => (
        <SmartLink key={`${button.text}-${index}`} href={button.href} className={index % 2 === 0 ? btnGreen : btnGold}>
          {button.text}
        </SmartLink>
      ))}
    </div>
  );
}

function safeBackground(image?: CloudImageData | null): string | undefined {
  const url = image?.url;
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "https:" && parsed.hostname.endsWith("cloudinary.com")) return url;
  } catch {
    return undefined;
  }
  return undefined;
}

function Hero({ section }: { section: Section }) {
  const background = safeBackground(section.backgroundImage || section.image);
  const rotating = section.rotatingText?.filter(Boolean) ?? [];
  return (
    <section className="relative flex min-h-[68vh] items-center justify-center overflow-hidden bg-[#0b4324] text-center text-white">
      {background ? (
        <div className="absolute inset-0">
          <CloudImage image={{ url: background, width: section.backgroundImage?.width, height: section.backgroundImage?.height }} alt="" fill className="object-cover" priority sizes="100vw" />
          <div className="absolute inset-0 bg-black/65" />
        </div>
      ) : null}
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-20">
        {section.eyebrow ? <p className="mb-4 font-[family-name:var(--font-patua)] text-lg text-[#e3d879]">{section.eyebrow}</p> : null}
        <h1 className="font-[family-name:var(--font-patua)] text-4xl leading-tight md:text-6xl">
          <span className="sr-only">{section.heading}</span>
          <span aria-hidden>
            {section.headingPrefix && rotating.length ? (
              <>
                {section.headingPrefix} <RotatingWords words={rotating} />
              </>
            ) : (
              section.heading
            )}
          </span>
        </h1>
        {section.subheading ? <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/90">{section.subheading}</p> : null}
        <ActionButtons buttons={section.buttons} className="justify-center" />
      </div>
    </section>
  );
}

function PageHeader({ section }: { section: Section }) {
  const background = safeBackground(section.backgroundImage);
  const crumbs = (section.breadcrumb || "")
    .split(">")
    .map((part) => part.trim())
    .filter(Boolean);
  return (
    <section className="relative flex min-h-[280px] items-end bg-[#0b4324] text-white">
      {background ? (
        <div className="absolute inset-0">
          <CloudImage image={{ url: background }} alt="" fill className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-black/55" />
        </div>
      ) : null}
      <div className="relative z-10 mx-auto w-full max-w-[1140px] px-4 py-12">
        {crumbs.length ? (
          <p className="mb-3 text-sm text-[#f3f08b]">
            {crumbs.map((crumb, index) => (
              <span key={`${crumb}-${index}`}>
                {index === 0 ? <SmartLink href="/" className="hover:underline">{crumb}</SmartLink> : crumb}
                {index < crumbs.length - 1 ? " › " : ""}
              </span>
            ))}
          </p>
        ) : null}
        <h1 className="font-[family-name:var(--font-patua)] text-4xl md:text-5xl">{section.heading}</h1>
      </div>
    </section>
  );
}

function Cards({ section }: { section: Section }) {
  const anchor = section.heading?.toLowerCase().includes("quran courses") ? "qurancourses" : section.id;
  return (
    <section id={anchor} className="bg-[#f5f1e3] py-14">
      <div className="mx-auto max-w-[1140px] px-4">
        {section.heading ? <Heading>{section.heading}</Heading> : null}
        <div className="grid gap-6 md:grid-cols-3">
          {(section.items ?? []).map((item, index) => {
            const image = asImage(item.image);
            const title = asString(item.title);
            return (
              <article key={`${title}-${index}`} className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
                {image ? (
                  <div className="relative aspect-[600/364] bg-[#efe8d4]">
                    <CloudImage image={image} alt={title} fill className="object-cover" sizes="(min-width: 768px) 33vw, 100vw" />
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-[family-name:var(--font-patua)] text-2xl text-[#0b4324]">{title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-6 text-[#3c3c3c]">{asString(item.description)}</p>
                  {asString(item.buttonText) ? (
                    <SmartLink href={asString(item.href) || "#"} className={`${btnGold} mt-5 w-full text-sm`}>
                      {asString(item.buttonText)}
                    </SmartLink>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ContentBlock({ section }: { section: Section }) {
  const images = (section.images ?? []).map(asImage).filter((image): image is CloudImageData => Boolean(image));
  const hasCopy = Boolean(section.heading || section.bodyHtml || section.buttons?.length || images.length);
  if (!hasCopy) return null;
  const split = section.layout === "split" && images.length > 0;
  return (
    <section className="bg-white py-14">
      <div className={`mx-auto grid max-w-[1140px] items-center gap-10 px-4 ${split ? "lg:grid-cols-2" : ""}`}>
        <div className={split ? "" : "mx-auto max-w-3xl"}>
          {section.heading ? (
            <h2 className="font-[family-name:var(--font-patua)] text-3xl leading-tight text-[#0b4324] md:text-4xl">{section.heading}</h2>
          ) : null}
          <Prose html={section.bodyHtml} className="mt-4" />
          <ActionButtons buttons={section.buttons} />
        </div>
        {images.length ? (
          <div className={split ? "" : "mx-auto mt-8 max-w-4xl"}>
            {images.map((image) => (
              <CloudImage key={image.url} image={image} alt={image.alt || section.heading || ""} className="mx-auto h-auto w-full max-w-lg rounded-2xl object-contain" sizes="(min-width: 1024px) 40vw, 100vw" />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Features({ section }: { section: Section }) {
  return (
    <section className="bg-[#f7f4ea] py-14">
      <div className="mx-auto max-w-[1140px] px-4">
        {section.heading ? <Heading>{section.heading}</Heading> : null}
        {section.introText ? <p className="mx-auto -mt-4 mb-8 max-w-3xl text-center leading-7 text-[#3c3c3c]">{section.introText}</p> : null}
        <div className="grid gap-4 md:grid-cols-2">
          {(section.items ?? []).map((item, index) => (
            <article key={`${asString(item.title)}-${index}`} className="rounded-2xl border border-[#eadfbe] bg-white p-6 shadow-sm">
              <h3 className="font-[family-name:var(--font-patua)] text-xl text-[#0b4324]">{asString(item.title)}</h3>
              <Prose html={asString(item.descriptionHtml) || asString(item.description)} className="mt-2 text-[15px]" />
            </article>
          ))}
        </div>
        {section.testimonials?.length ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {section.testimonials.map((item, index) => (
              <QuoteCard key={`${item.name}-${index}`} item={item} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function QuoteCard({ item }: { item: Testimonial }) {
  return (
    <figure className="rounded-2xl bg-white p-6 shadow-sm">
      <span className="font-[family-name:var(--font-patua)] text-4xl leading-none text-[#dab750]" aria-hidden>
        “
      </span>
      <blockquote className="text-sm leading-7 text-[#3c3c3c]">{item.content}</blockquote>
      <figcaption className="mt-4 font-semibold text-[#0b4324]">
        {item.name}
        {item.title ? <span className="block text-sm font-normal text-[#6d675b]">{item.title}</span> : null}
      </figcaption>
    </figure>
  );
}

function Quote({ section }: { section: Section }) {
  return (
    <section className="relative overflow-hidden bg-[#a78337] py-16 text-center text-[#0b4324]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#ded073] to-[#a78337]" />
      <div className="relative mx-auto max-w-3xl px-4">
        <p className="font-[family-name:var(--font-patua)] text-2xl leading-snug md:text-3xl">{section.text}</p>
      </div>
    </section>
  );
}

function Cta({ section }: { section: Section }) {
  return (
    <section className="relative overflow-hidden py-16 text-center text-[#0b4324]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#ded073]/95 to-[#a78337]/95" />
      <div className="relative mx-auto max-w-3xl px-4">
        <p className="font-[family-name:var(--font-patua)] text-2xl leading-snug md:text-3xl">{section.text}</p>
        <ActionButtons buttons={section.buttons} className="justify-center" />
      </div>
    </section>
  );
}

function Stats({ section }: { section: Section }) {
  return (
    <section className="bg-[#f5f1e3] py-14">
      <div className="mx-auto max-w-[1140px] px-4">
        {section.heading ? <Heading>{section.heading}</Heading> : null}
        {section.introText ? <p className="mx-auto -mt-4 mb-8 max-w-3xl text-center leading-7">{section.introText}</p> : null}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(section.items ?? []).map((item, index) => (
            <article key={index} className="rounded-2xl bg-gradient-to-br from-[#0b4324] to-[#639139] p-6 text-center text-white">
              <p className="font-[family-name:var(--font-patua)] text-4xl text-[#e3d879]">
                {asString(item.prefix)}
                {asString(item.value)}
                {asString(item.suffix)}
              </p>
              <p className="mt-2 text-sm tracking-wide uppercase">{asString(item.label)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Team({ section }: { section: Section }) {
  return (
    <section className="bg-white py-14">
      <div className="mx-auto max-w-[1140px] px-4">
        {section.heading ? <Heading>{section.heading}</Heading> : null}
        <div className="grid gap-8 md:grid-cols-3">
          {(section.items ?? []).map((item, index) => {
            const image = asImage(item.image);
            const name = asString(item.name);
            return (
              <article key={`${name}-${index}`} className="text-center">
                <div className="relative mx-auto aspect-[5/6.5] max-w-[280px] overflow-hidden rounded-2xl bg-[#f5f1e3]">
                  {image ? <CloudImage image={image} alt={name} fill className="object-cover" sizes="280px" /> : null}
                </div>
                <h3 className="mt-4 font-[family-name:var(--font-patua)] text-2xl text-[#0b4324]">{name}</h3>
                <p className="mt-2 text-sm leading-6 text-[#4d4a42]">{asString(item.bio)}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Testimonials({ section }: { section: Section }) {
  return (
    <section className="bg-[#f5f1e3] py-14">
      <div className="mx-auto max-w-[1140px] px-4">
        {section.heading ? <Heading>{section.heading}</Heading> : null}
        <div className="grid gap-4 md:grid-cols-2">
          {(section.testimonials?.length ? section.testimonials : ((section.items as Testimonial[] | undefined) ?? [])).map(
            (item, index) => (
              <QuoteCard key={`${item.name}-${index}`} item={item} />
            ),
          )}
        </div>
      </div>
    </section>
  );
}

function Faq({ section }: { section: Section }) {
  return (
    <section className="bg-[#f5f1e3] py-14">
      <div className="mx-auto max-w-3xl px-4">
        {section.heading ? <Heading>{section.heading}</Heading> : null}
        <div className="space-y-3">
          {(section.items ?? []).map((item, index) => (
            <details key={`${asString(item.question)}-${index}`} className="group rounded-xl bg-white shadow-sm">
              <summary className="cursor-pointer list-none px-5 py-4 font-[family-name:var(--font-patua)] text-lg text-[#0b4324]">
                {asString(item.question)}
              </summary>
              <div className="bg-[#f8f8f8] px-5 pb-4">
                <Prose html={asString(item.answerHtml)} />
              </div>
            </details>
          ))}
        </div>
        <ActionButtons buttons={section.buttons} className="justify-center" />
      </div>
    </section>
  );
}

function PostGrid({ heading, posts }: { heading?: string; posts: PostCard[] }) {
  return (
    <section className="bg-white py-14">
      <div className="mx-auto max-w-[1140px] px-4">
        {heading ? <Heading>{heading}</Heading> : null}
        {posts.length === 0 ? (
          <p className="text-center text-[#5c574c]">New articles will appear here once they are published.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {posts.map((post) => (
              <article key={post.path} className="overflow-hidden rounded-2xl border border-[#eadfbe] bg-white shadow-sm">
                {post.featuredImage?.url ? (
                  <div className="relative aspect-[16/10]">
                    <CloudImage image={post.featuredImage} alt="" fill className="object-cover" sizes="(min-width: 768px) 33vw, 100vw" />
                  </div>
                ) : null}
                <div className="p-5">
                  {post.publishedAt ? <p className="text-xs tracking-wide text-[#a47f34] uppercase">{formatDate(post.publishedAt)}</p> : null}
                  <h3 className="mt-2 font-[family-name:var(--font-patua)] text-xl leading-snug text-[#0b4324]">
                    <SmartLink href={post.path} className="hover:text-[#a47f34]">
                      {post.title}
                    </SmartLink>
                  </h3>
                  {post.excerpt ? <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#3c3c3c]">{post.excerpt}</p> : null}
                  <SmartLink href={post.path} className="mt-4 inline-block text-sm font-semibold text-[#aa771c] hover:text-[#0b4324]">
                    Read article
                  </SmartLink>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

async function LatestPosts({ section }: { section: Section }) {
  const posts = await getPublishedPosts();
  const linked = (section.items ?? [])
    .map((item) => posts.find((post) => post.path === asString(item.href)))
    .filter((post): post is PostCard => Boolean(post));
  return <PostGrid heading={section.heading} posts={linked.length ? linked : posts.slice(0, 3)} />;
}

async function PostsArchive({ section }: { section: Section }) {
  const posts = await getPublishedPosts();
  return <PostGrid heading={section.heading || "Islamic Educational Posts"} posts={posts} />;
}

function ImageBand({ section }: { section: Section }) {
  const images = (section.images ?? []).map(asImage).filter((image): image is CloudImageData => Boolean(image));
  if (!images.length) return null;
  return (
    <section className="bg-white py-8">
      <div className="mx-auto max-w-[1140px] px-4">
        {images.map((image) => (
          <CloudImage key={image.url} image={image} alt={image.alt || ""} className="h-auto w-full rounded-2xl" sizes="100vw" />
        ))}
      </div>
    </section>
  );
}

function ContactFormSection({ section, pagePath }: { section: Section; pagePath: string }) {
  return (
    <section id="form" className="bg-[#f5f1e3] py-14">
      <div className="mx-auto grid max-w-[1140px] gap-8 px-4 lg:grid-cols-2">
        <div>
          <h2 className="font-[family-name:var(--font-patua)] text-3xl text-[#0b4324]">{section.heading || "Contact"}</h2>
          <ul className="mt-6 space-y-4">
            {(section.contactItems ?? []).map((item) => (
              <li key={item.text} className="rounded-xl bg-white px-4 py-3 text-[#0b4324] shadow-sm">
                {item.href ? (
                  <a href={item.href} className="hover:text-[#a47f34]">
                    {item.text}
                  </a>
                ) : (
                  item.text
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <h3 className="font-[family-name:var(--font-patua)] text-2xl text-[#0b4324]">{section.formHeading || section.form?.formName}</h3>
          <div className="mt-5">
            <LeadForm
              fields={section.form?.fields || []}
              submitText={section.form?.submitText}
              source="contact"
              pagePath={pagePath}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function PricingSection({
  plans,
  hint,
}: {
  plans?: PricingPlan[];
  hint?: ContentDoc["pricingHint"];
}) {
  const list = plans?.length ? plans : DEFAULT_PRICING_PLANS;
  const from = hint?.fromUSDPerMonth ?? 29;
  const to = hint?.toUSDPerMonth ?? 99;
  return (
    <section className="bg-[#f5f1e3] py-16">
      <div className="mx-auto max-w-[1140px] px-4">
        <Heading>Class plans</Heading>
        <p className="mx-auto -mt-4 mb-8 max-w-2xl text-center leading-7 text-[#3c3c3c]">
          Online Quran classes at Qurvia Islamic Center run from ${from} a month up to ${to} a month, depending on the course and how many sessions you take each week. These three plans are a starting guide you can edit from the admin settings. Tafseer and Arabic are confirmed separately, and eligible courses include a free 3-day trial.
        </p>
        <div className="grid gap-5 lg:grid-cols-3">
          {list.map((plan) => (
            <article
              key={plan.name}
              className={`flex flex-col rounded-2xl p-6 shadow-sm ${plan.highlighted ? "bg-[#0b4324] text-white" : "bg-white text-[#1c1c1c]"}`}
            >
              <h3 className="font-[family-name:var(--font-patua)] text-2xl">{plan.name}</h3>
              <p className={`mt-3 text-sm leading-6 ${plan.highlighted ? "text-white/80" : "text-[#5c574c]"}`}>{plan.blurb}</p>
              <p className="mt-5 font-[family-name:var(--font-patua)] text-5xl text-[#e3d879]">
                ${plan.price}
                <span className="ml-1 text-base text-current">/ {plan.cadence}</span>
              </p>
              <ul className="mt-5 flex-1 space-y-2 text-sm leading-6">
                {plan.features.map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>
              <SmartLink href={plan.href || "/contact-us"} className={`${plan.highlighted ? btnGold : btnGreen} mt-6 w-full`}>
                {plan.cta || "Book a free trial"}
              </SmartLink>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export async function SectionView({ section, pagePath }: { section: Section; pagePath: string }) {
  switch (section.type) {
    case "hero":
      return <Hero section={section} />;
    case "pageHeader":
      return <PageHeader section={section} />;
    case "cards":
      return <Cards section={section} />;
    case "content":
      return <ContentBlock section={section} />;
    case "features":
      return <Features section={section} />;
    case "quote":
      return <Quote section={section} />;
    case "cta":
      return <Cta section={section} />;
    case "stats":
      return <Stats section={section} />;
    case "image":
      return <ImageBand section={section} />;
    case "team":
      return <Team section={section} />;
    case "testimonials":
      return <Testimonials section={section} />;
    case "faq":
      return <Faq section={section} />;
    case "latestPosts":
      return <LatestPosts section={section} />;
    case "postsArchive":
      return <PostsArchive section={section} />;
    case "contactForm":
      return <ContactFormSection section={section} pagePath={pagePath} />;
    case "subjects":
      return (
        <SubjectsExplorer
          heading={section.heading}
          ctaText={section.ctaText}
          ctaHref={section.ctaHref}
          items={(section.items ?? []).map((item) => ({
            key: asString(item.key),
            icon: asString(item.icon),
            name: asString(item.name),
            tag: asString(item.tag),
            grades: asString(item.grades),
            sessions: asString(item.sessions),
            type: asString(item.type),
            boards: stringList(item.boards),
            topics: stringList(item.topics),
            curr: stringList(item.curr),
          }))}
        />
      );
    default:
      return section.bodyHtml ? (
        <section className="bg-white py-12">
          <div className="mx-auto max-w-3xl px-4">
            {section.heading ? <h2 className="font-[family-name:var(--font-patua)] text-3xl text-[#0b4324]">{section.heading}</h2> : null}
            <Prose html={section.bodyHtml} />
          </div>
        </section>
      ) : null;
  }
}

export async function ArticleView({ doc }: { doc: ContentDoc }) {
  const posts = await getPublishedPosts();
  const related = posts.filter((post) => post.path !== doc.path).slice(0, 2);
  return (
    <article>
      <header className="bg-[#0b4324] py-14 text-white">
        <div className="mx-auto max-w-3xl px-4">
          <p className="text-sm tracking-[0.14em] text-[#e3d879] uppercase">
            <SmartLink href="/blog" className="hover:underline">
              Blog
            </SmartLink>
            {doc.publishedAt ? <span> · {formatDate(doc.publishedAt)}</span> : null}
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-patua)] text-4xl leading-tight md:text-5xl">{doc.title}</h1>
          {doc.excerpt ? <p className="mt-4 text-lg leading-8 text-white/85">{doc.excerpt}</p> : null}
        </div>
      </header>
      {doc.featuredImage?.url ? (
        <div className="mx-auto -mt-8 max-w-4xl px-4">
          <CloudImage image={doc.featuredImage} alt="" className="h-auto w-full rounded-2xl shadow-lg" sizes="(min-width: 768px) 900px, 100vw" priority />
        </div>
      ) : null}
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Prose html={doc.contentHtml} />
      </div>
      {related.length ? <PostGrid heading="More from the academy" posts={related} /> : null}
    </article>
  );
}

export function HtmlFallback({ html, title }: { html?: string; title: string }) {
  const safe = cleanHtml(html);
  return (
    <article className="bg-white py-12">
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="font-[family-name:var(--font-patua)] text-4xl text-[#0b4324]">{title}</h1>
        {safe ? <Prose html={safe} className="mt-6" /> : <p className="mt-6 text-[#5c574c]">This page has no published content yet.</p>}
      </div>
    </article>
  );
}
