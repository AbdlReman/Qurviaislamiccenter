import { CloudImage } from "@/components/site/cloud-image";
import { LeadForm } from "@/components/site/lead-form";
import { Prose } from "@/components/site/prose";
import { btnGold, btnGreen, btnWhite, SmartLink } from "@/components/site/smart-link";
import { RotatingWords } from "@/components/sections/rotating";
import { SubjectsExplorer } from "@/components/sections/subjects";
import { getPublishedPosts, getSettings } from "@/lib/content";
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

function Heading({ children, light = false }: { children: string; light?: boolean }) {
  return (
    <div className="mb-10 max-w-2xl">
      <h2 className={`font-[family-name:var(--font-display)] text-3xl tracking-tight md:text-4xl ${light ? "text-white" : "text-ink"}`}>
        {children}
      </h2>
      <span className={`mt-4 block h-px w-12 ${light ? "bg-white/35" : "bg-moss/50"}`} />
    </div>
  );
}

function ActionButtons({
  buttons,
  className = "",
  onDark = false,
}: {
  buttons?: LinkButton[];
  className?: string;
  onDark?: boolean;
}) {
  if (!buttons?.length) return null;
  return (
    <div className={`mt-8 flex flex-wrap gap-3 ${className}`}>
      {buttons.map((button, index) => {
        const primary = onDark ? btnWhite : btnGreen;
        const secondary = onDark
          ? "inline-flex min-h-12 items-center justify-center rounded-sm border border-white/35 bg-transparent px-8 py-3 text-center text-sm font-medium tracking-[0.04em] text-white transition duration-300 hover:border-white hover:bg-white/10"
          : btnGold;
        return (
          <SmartLink key={`${button.text}-${index}`} href={button.href} className={index % 2 === 0 ? primary : secondary}>
            {button.text}
          </SmartLink>
        );
      })}
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

async function Hero({ section }: { section: Section }) {
  const settings = await getSettings();
  const background = safeBackground(section.backgroundImage || section.image);
  const rotating = section.rotatingText?.filter(Boolean) ?? [];
  const primaryButtons = section.buttons?.slice(0, 2);

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-pine text-white">
      {background ? (
        <div className="absolute inset-0">
          <div className="ilm-hero-media absolute inset-0">
            <CloudImage
              image={{ url: background, width: section.backgroundImage?.width, height: section.backgroundImage?.height }}
              alt=""
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-ink/88 via-ink/55 to-ink/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-ink/20" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgb(74_107_85/0.35),transparent_55%),linear-gradient(160deg,#1b3a2a,#121a16)]" />
      )}

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1200px] flex-col justify-end px-4 pb-16 pt-36 lg:px-6 lg:pb-24">
        <p className="ilm-fade-up font-[family-name:var(--font-display)] text-4xl leading-none tracking-tight text-white md:text-6xl lg:text-7xl">
          {settings.siteName}
        </p>
        <h1 className="ilm-fade-up-delay mt-6 max-w-3xl font-[family-name:var(--font-display)] text-2xl leading-snug tracking-tight text-white/95 md:text-4xl">
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
        {section.subheading ? (
          <p className="ilm-fade-up-delay-2 mt-5 max-w-xl text-base leading-8 text-white/75 md:text-lg">
            {section.subheading}
          </p>
        ) : null}
        <div className="ilm-fade-up-delay-2">
          <ActionButtons buttons={primaryButtons} onDark />
        </div>
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
    <section className="relative flex min-h-[240px] items-end overflow-hidden bg-pine text-white">
      {background ? (
        <div className="absolute inset-0">
          <CloudImage image={{ url: background }} alt="" fill className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-ink/65" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#1b3a2a,#121a16)]" />
      )}
      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-4 pt-10 pb-14 lg:px-6">
        {crumbs.length ? (
          <p className="mb-3 text-sm text-white/60">
            {crumbs.map((crumb, index) => (
              <span key={`${crumb}-${index}`}>
                {index === 0 ? <SmartLink href="/" className="hover:text-white">{crumb}</SmartLink> : crumb}
                {index < crumbs.length - 1 ? " / " : ""}
              </span>
            ))}
          </p>
        ) : null}
        <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight md:text-5xl">{section.heading}</h1>
      </div>
    </section>
  );
}

function Cards({ section }: { section: Section }) {
  const anchor = section.heading?.toLowerCase().includes("quran courses") ? "qurancourses" : section.id;
  return (
    <section id={anchor} className="py-20 md:py-24">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
        {section.heading ? <Heading>{section.heading}</Heading> : null}
        <div className="grid gap-12 md:grid-cols-3 md:gap-10">
          {(section.items ?? []).map((item, index) => {
            const image = asImage(item.image);
            const title = asString(item.title);
            return (
              <article key={`${title}-${index}`} className="group flex flex-col">
                {image ? (
                  <div
                    className="relative w-full overflow-hidden bg-sand"
                    style={{ aspectRatio: "600 / 364" }}
                  >
                    <CloudImage
                      image={image}
                      alt={title}
                      fill
                      className="object-cover object-center transition duration-700 group-hover:scale-[1.02]"
                      sizes="(min-width: 768px) 33vw, 100vw"
                    />
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col px-1 pt-6">
                  <h3 className="font-[family-name:var(--font-display)] text-2xl tracking-tight text-ink">{title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-7 text-ink/70">{asString(item.description)}</p>
                  {asString(item.buttonText) ? (
                    <SmartLink
                      href={asString(item.href) || "#"}
                      className="mt-5 inline-flex text-sm font-medium tracking-[0.04em] text-pine underline decoration-moss/40 underline-offset-4 transition hover:decoration-pine"
                    >
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
    <section className="bg-white/60 py-20 md:py-24">
      <div className={`mx-auto grid max-w-[1200px] items-center gap-12 px-4 lg:px-6 ${split ? "lg:grid-cols-2" : ""}`}>
        <div className={split ? "" : "mx-auto max-w-3xl"}>
          {section.heading ? (
            <h2 className="font-[family-name:var(--font-display)] text-3xl leading-tight tracking-tight text-ink md:text-4xl">
              {section.heading}
            </h2>
          ) : null}
          <Prose html={section.bodyHtml} className="mt-5" />
          <ActionButtons buttons={section.buttons} />
        </div>
        {images.length ? (
          <div className={split ? "" : "mx-auto mt-8 max-w-4xl"}>
            {images.map((image) => (
              <CloudImage
                key={image.url}
                image={image}
                alt={image.alt || section.heading || ""}
                className="mx-auto h-auto w-full max-w-lg object-contain"
                sizes="(min-width: 1024px) 40vw, 100vw"
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Features({ section }: { section: Section }) {
  return (
    <section className="py-20 md:py-24">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
        {section.heading ? <Heading>{section.heading}</Heading> : null}
        {section.introText ? (
          <p className="-mt-4 mb-10 max-w-2xl leading-7 text-ink/70">{section.introText}</p>
        ) : null}
        <div className="grid gap-px overflow-hidden border border-sand bg-sand md:grid-cols-2">
          {(section.items ?? []).map((item, index) => (
            <article key={`${asString(item.title)}-${index}`} className="bg-mist p-7 md:p-8">
              <h3 className="font-[family-name:var(--font-display)] text-xl tracking-tight text-ink">
                {asString(item.title)}
              </h3>
              <Prose html={asString(item.descriptionHtml) || asString(item.description)} className="mt-2 text-[15px]" />
            </article>
          ))}
        </div>
        {section.testimonials?.length ? (
          <div className="mt-10 grid gap-8 md:grid-cols-2">
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
    <figure className="border-l border-moss/40 pl-5">
      <blockquote className="font-[family-name:var(--font-display)] text-xl leading-relaxed tracking-tight text-ink md:text-2xl">
        {item.content}
      </blockquote>
      <figcaption className="mt-5 text-sm font-medium text-pine">
        {item.name}
        {item.title ? <span className="mt-0.5 block font-normal text-ink/55">{item.title}</span> : null}
      </figcaption>
    </figure>
  );
}

function Quote({ section }: { section: Section }) {
  return (
    <section className="bg-pine py-20 text-white md:py-24">
      <div className="mx-auto max-w-3xl px-4 text-center lg:px-6">
        <p className="font-[family-name:var(--font-display)] text-2xl leading-snug tracking-tight md:text-4xl">
          {section.text}
        </p>
      </div>
    </section>
  );
}

function Cta({ section }: { section: Section }) {
  return (
    <section className="relative overflow-hidden bg-ink py-20 text-center text-white md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgb(74_107_85/0.35),transparent_55%)]" />
      <div className="relative mx-auto max-w-3xl px-4 lg:px-6">
        <p className="font-[family-name:var(--font-display)] text-2xl leading-snug tracking-tight md:text-4xl">
          {section.text}
        </p>
        <ActionButtons buttons={section.buttons} className="justify-center" onDark />
      </div>
    </section>
  );
}

const HOME_STATS = {
  heading: "The Numbers Say It All",
  intro:
    "Thousands of students choose our online Quran academy for flexible class schedules, experienced male and female Quran teachers, personalized one-on-one Quran classes, and structured courses designed for both children and adults.",
  items: [
    { value: "4.9", suffix: "+", label: "139★ Google Verified Reviews" },
    { value: "6", suffix: "+", label: "Years of Experience" },
    { value: "200", suffix: "+", label: "Qualified Tutors" },
    { value: "24/7", suffix: "", label: "All Time Zones" },
  ],
} as const;

export function HomeStatsSection() {
  return (
    <section className="border-y border-sand bg-white/70 py-16 md:py-20">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
        <Heading>{HOME_STATS.heading}</Heading>
        <p className="-mt-4 mb-10 max-w-2xl leading-7 text-ink/70">{HOME_STATS.intro}</p>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {HOME_STATS.items.map((item) => (
            <article key={item.label} className="text-center sm:text-left">
              <p className="font-[family-name:var(--font-display)] text-5xl tracking-tight text-pine">
                {item.value}
                {item.suffix}
              </p>
              <p className="mt-2 text-xs tracking-[0.14em] text-ink/55 uppercase">{item.label}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats({ section }: { section: Section }) {
  // Home numbers stay static so CMS edits cannot break this block
  if (section.heading === HOME_STATS.heading || !section.items?.length) {
    return <HomeStatsSection />;
  }
  return (
    <section className="border-y border-sand bg-white/70 py-16 md:py-20">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
        {section.heading ? <Heading>{section.heading}</Heading> : null}
        {section.introText ? (
          <p className="-mt-4 mb-10 max-w-2xl leading-7 text-ink/70">{section.introText}</p>
        ) : null}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {(section.items ?? []).map((item, index) => (
            <article key={index} className="text-center sm:text-left">
              <p className="font-[family-name:var(--font-display)] text-5xl tracking-tight text-pine">
                {asString(item.prefix)}
                {asString(item.value)}
                {asString(item.suffix)}
              </p>
              <p className="mt-2 text-xs tracking-[0.14em] text-ink/55 uppercase">{asString(item.label)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Team({ section }: { section: Section }) {
  return (
    <section className="py-20 md:py-24">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
        {section.heading ? <Heading>{section.heading}</Heading> : null}
        <div className="grid gap-10 md:grid-cols-3">
          {(section.items ?? []).map((item, index) => {
            const image = asImage(item.image);
            const name = asString(item.name);
            return (
              <article key={`${name}-${index}`}>
                <div className="relative aspect-[4/5] overflow-hidden bg-sand">
                  {image ? <CloudImage image={image} alt={name} fill className="object-cover" sizes="280px" /> : null}
                </div>
                <h3 className="mt-5 font-[family-name:var(--font-display)] text-2xl tracking-tight text-ink">{name}</h3>
                <p className="mt-2 text-sm leading-7 text-ink/65">{asString(item.bio)}</p>
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
    <section className="bg-white/60 py-20 md:py-24">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
        {section.heading ? <Heading>{section.heading}</Heading> : null}
        <div className="grid gap-10 md:grid-cols-2">
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
    <section className="py-20 md:py-24">
      <div className="mx-auto max-w-3xl px-4 lg:px-6">
        {section.heading ? <Heading>{section.heading}</Heading> : null}
        <div className="divide-y divide-sand border-y border-sand">
          {(section.items ?? []).map((item, index) => (
            <details key={`${asString(item.question)}-${index}`} className="group py-1">
              <summary className="cursor-pointer list-none py-5 font-[family-name:var(--font-display)] text-xl tracking-tight text-ink transition group-open:text-pine">
                {asString(item.question)}
              </summary>
              <div className="pb-5">
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
    <section className="py-20 md:py-24">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
        {heading ? <Heading>{heading}</Heading> : null}
        {posts.length === 0 ? (
          <p className="text-ink/60">New articles will appear here once they are published.</p>
        ) : (
          <div className="grid gap-10 md:grid-cols-3 md:gap-8">
            {posts.map((post) => (
              <article key={post.path} className="group">
                {post.featuredImage?.url ? (
                  <div className="relative aspect-[16/10] overflow-hidden bg-sand">
                    <CloudImage
                      image={post.featuredImage}
                      alt=""
                      fill
                      className="object-cover transition duration-700 group-hover:scale-[1.03]"
                      sizes="(min-width: 768px) 33vw, 100vw"
                    />
                  </div>
                ) : null}
                <div className="pt-5">
                  {post.publishedAt ? (
                    <p className="text-xs tracking-[0.12em] text-moss uppercase">{formatDate(post.publishedAt)}</p>
                  ) : null}
                  <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl leading-snug tracking-tight text-ink">
                    <SmartLink href={post.path} className="transition hover:text-pine">
                      {post.title}
                    </SmartLink>
                  </h3>
                  {post.excerpt ? <p className="mt-3 line-clamp-3 text-sm leading-7 text-ink/65">{post.excerpt}</p> : null}
                  <SmartLink
                    href={post.path}
                    className="mt-4 inline-block text-sm font-medium text-pine underline decoration-moss/40 underline-offset-4"
                  >
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
    <section className="py-8">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
        {images.map((image) => (
          <CloudImage key={image.url} image={image} alt={image.alt || ""} className="h-auto w-full" sizes="100vw" />
        ))}
      </div>
    </section>
  );
}

function ContactFormSection({ section, pagePath }: { section: Section; pagePath: string }) {
  return (
    <section id="form" className="bg-white/70 py-20 md:py-24">
      <div className="mx-auto grid max-w-[1200px] gap-12 px-4 lg:grid-cols-2 lg:px-6">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-ink md:text-4xl">
            {section.heading || "Contact"}
          </h2>
          <ul className="mt-8 space-y-3">
            {(section.contactItems ?? []).map((item) => (
              <li key={item.text} className="border-b border-sand py-3 text-ink/80">
                {item.href ? (
                  <a href={item.href} className="transition hover:text-pine">
                    {item.text}
                  </a>
                ) : (
                  item.text
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="border border-sand bg-mist p-6 md:p-8">
          <h3 className="font-[family-name:var(--font-display)] text-2xl tracking-tight text-ink">
            {section.formHeading || section.form?.formName}
          </h3>
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
    <section className="py-20 md:py-24">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
        <Heading>Class plans</Heading>
        <p className="-mt-4 mb-12 max-w-2xl leading-7 text-ink/70">
          Online Quran classes at Qurvia Islamic Center run from ${from} a month up to ${to} a month, depending on the
          course and how many sessions you take each week. These three plans are a starting guide you can edit from the
          admin settings. Tafseer and Arabic are confirmed separately, and eligible courses include a free 3-day trial.
        </p>
        <div className="grid gap-6 lg:grid-cols-3">
          {list.map((plan) => (
            <article
              key={plan.name}
              className={`flex flex-col border p-7 ${
                plan.highlighted ? "border-pine bg-pine text-white" : "border-sand bg-white text-ink"
              }`}
            >
              <h3 className="font-[family-name:var(--font-display)] text-2xl tracking-tight">{plan.name}</h3>
              <p className={`mt-3 text-sm leading-6 ${plan.highlighted ? "text-white/70" : "text-ink/60"}`}>
                {plan.blurb}
              </p>
              <p className={`mt-6 font-[family-name:var(--font-display)] text-5xl tracking-tight ${plan.highlighted ? "text-white" : "text-pine"}`}>
                ${plan.price}
                <span className="ml-1 text-base font-[family-name:var(--font-outfit)] text-current opacity-70">
                  / {plan.cadence}
                </span>
              </p>
              <ul className="mt-6 flex-1 space-y-2 text-sm leading-7">
                {plan.features.map((feature) => (
                  <li key={feature} className={plan.highlighted ? "text-white/80" : "text-ink/70"}>
                    {feature}
                  </li>
                ))}
              </ul>
              <SmartLink
                href={plan.href || "/contact-us"}
                className={`${plan.highlighted ? btnWhite : btnGreen} mt-8 w-full`}
              >
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
        <section className="py-16">
          <div className="mx-auto max-w-3xl px-4">
            {section.heading ? (
              <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-ink">{section.heading}</h2>
            ) : null}
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
      <header className="bg-pine py-16 text-white md:py-20">
        <div className="mx-auto max-w-3xl px-4 lg:px-6">
          <p className="text-xs tracking-[0.16em] text-white/55 uppercase">
            <SmartLink href="/blog" className="hover:text-white">
              Blog
            </SmartLink>
            {doc.publishedAt ? <span> · {formatDate(doc.publishedAt)}</span> : null}
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl leading-tight tracking-tight md:text-5xl">
            {doc.title}
          </h1>
          {doc.excerpt ? <p className="mt-5 text-lg leading-8 text-white/75">{doc.excerpt}</p> : null}
        </div>
      </header>
      {doc.featuredImage?.url ? (
        <div className="mx-auto -mt-8 max-w-4xl px-4">
          <CloudImage image={doc.featuredImage} alt="" className="h-auto w-full shadow-lg" sizes="(min-width: 768px) 900px, 100vw" priority />
        </div>
      ) : null}
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Prose html={doc.contentHtml} />
      </div>
      {related.length ? <PostGrid heading="More from the academy" posts={related} /> : null}
    </article>
  );
}

export function HtmlFallback({ html, title }: { html?: string; title: string }) {
  const safe = cleanHtml(html);
  return (
    <article className="py-16">
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight text-ink">{title}</h1>
        {safe ? (
          <Prose html={safe} className="mt-6" />
        ) : (
          <p className="mt-6 text-ink/60">This page has no published content yet.</p>
        )}
      </div>
    </article>
  );
}
