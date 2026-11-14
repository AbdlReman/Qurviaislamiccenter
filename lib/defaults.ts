import type { Menu, PricingPlan, SiteSettings } from "@/lib/types";

export const DEFAULT_PRICING_PLANS: PricingPlan[] = [
  {
    name: "Starter",
    price: 29,
    cadence: "month",
    blurb: "A calm start for one student, with two live classes a week.",
    features: [
      "2 live one-to-one classes each week",
      "Certified male or female teacher",
      "Noorani Qaida or Quran reading",
      "Free 3-day trial on eligible courses",
    ],
    cta: "Book a free trial",
    href: "/contact-us",
  },
  {
    name: "Family",
    price: 59,
    cadence: "month",
    blurb: "The pace most families choose for steady Tajweed and revision.",
    features: [
      "3 live one-to-one classes each week",
      "Tajweed, Hifz, or Islamic studies",
      "Timings across UK, US, and Gulf zones",
      "Progress notes for parents",
    ],
    highlighted: true,
    cta: "Book a free trial",
    href: "/contact-us",
  },
  {
    name: "Intensive",
    price: 99,
    cadence: "month",
    blurb: "More sessions for Hifz and students who want a faster rhythm.",
    features: [
      "5 live one-to-one classes each week",
      "Hifz with structured revision",
      "Priority scheduling",
      "The same teacher, class after class",
    ],
    cta: "Book a free trial",
    href: "/contact-us",
  },
];

const BRAND_LOGO = {
  url: "/images/logo.png",
  width: 512,
  height: 512,
  alt: "Qurvia Islamic Center",
};

export function defaultSettings(): SiteSettings {
  return {
    key: "site",
    siteName: "Qurvia Islamic Center",
    title: "Qurvia Islamic Center - Online Quran Classes",
    tagline: "Journey of Faith & Knowledge",
    url: "https://ilmworldacademy.com",
    logo: BRAND_LOGO,
    footerLogo: BRAND_LOGO,
    siteIcon: BRAND_LOGO,
    announcementBar:
      "Claim Your Free Trial Classes Today! Available on all plans except Tafseer and Arabic courses. No credit card required and zero hidden conditions.",
    headerCta: { text: "GET CLASS TRIAL", href: "/contact-us" },
    contact: { phones: [], emails: [], officeHours: [], raw: [] },
    social: [],
    chaty: [
      {
        position: "right",
        ctaText: "WhatsApp us",
        color: "#A886CD",
        channels: [
          {
            channel: "Whatsapp",
            value: "923709177700",
            url: "https://wa.me/923709177700",
            title: "WhatsApp",
          },
        ],
      },
    ],
    freeTrialPopup: {
      heading: "Book Your Free Trial Class",
      text: "Experience a free one-to-one Quran lesson with a certified tutor. Safe & secure. No payment required.",
      form: {
        formName: "Free Trial Popup",
        submitText: "Get Trial",
        fields: [
          { name: "name", type: "text", placeholder: "Full Name", required: true },
          { name: "phone", type: "text", placeholder: "Phone Number", required: true },
          { name: "email", type: "email", placeholder: "Email", required: true },
          {
            name: "course",
            type: "select",
            label: "Select the course",
            required: true,
            options: [
              "Noorani Qaida Course",
              "Quran Tajweed Course",
              "Quran Tafseer Course",
              "Quran Hifz Course",
              "Islamic Edu & Dua Course",
              "Arabic Language Course",
              "Academic Tuition",
              "Other",
            ],
          },
          {
            name: "heardFrom",
            type: "select",
            label: "How did you hear about us?",
            required: true,
            options: ["Google", "Facebook", "Instagram", "Friend/Family", "Other"],
          },
        ],
      },
    },
    footer: {
      copyright: "© 2026 Qurvia Islamic Center. All Rights Reserved.",
      credit: "Website design & developed by devtyx (http://devtyx.com)",
    },
    homepageSlug: "home",
    postsPageSlug: "blog",
    pricingPlans: DEFAULT_PRICING_PLANS,
  };
}

export function normalizeSettings(input: Partial<SiteSettings> | null | undefined): SiteSettings {
  const base = defaultSettings();
  if (!input) return base;
  const contact = input.contact;
  return {
    ...base,
    ...input,
    contact: {
      phones: contact?.phones ?? base.contact.phones,
      emails: contact?.emails ?? base.contact.emails,
      raw: contact?.raw ?? [],
      officeHours: contact?.officeHours ?? [],
    },
    social: input.social ?? [],
    chaty: input.chaty?.length ? input.chaty : base.chaty,
    headerCta: input.headerCta?.text ? input.headerCta : base.headerCta,
    footer: { ...base.footer, ...input.footer },
    freeTrialPopup: input.freeTrialPopup?.form ? input.freeTrialPopup : base.freeTrialPopup,
    pricingPlans: input.pricingPlans?.length ? input.pricingPlans : base.pricingPlans,
  };
}

export const FALLBACK_MENU: Menu = {
  key: "main",
  name: "Main Navigation",
  location: "header",
  items: [
    { label: "Home", href: "/" },
    { label: "About us", href: "/about-us" },
    {
      label: "Quran Courses",
      href: null,
      children: [
        { label: "Learn Quran With Tajweed", href: "/quran-courses/learn-quran-with-tajweed-online" },
        { label: "Learn Quran Tafseer", href: "/quran-courses/learn-quran-tafseer-online" },
        { label: "Hifz Quran", href: "/quran-courses/hifz-quran-online-quran-memorization" },
        { label: "Basic Islamic Education", href: "/quran-courses/basic-islamic-education-for-kids-daily-duas" },
        { label: "Arabic Language Course", href: "/quran-courses/arabic-language-course" },
        { label: "Noorani Qaida", href: "/quran-courses/noorani-qaida-online" },
      ],
    },
    { label: "Blogs", href: "/blog" },
    { label: "Academic Tuition", href: "/academic-tuition" },
    { label: "Contact us", href: "/contact-us" },
  ],
};
