export type CloudImage = {
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
  alt?: string;
};

export type LinkButton = {
  text: string;
  href: string;
};

export type FormField = {
  name: string;
  type: string;
  label?: string;
  placeholder?: string | null;
  required?: boolean;
  options?: string[];
};

export type FormSchema = {
  widget?: string;
  formName?: string;
  fields?: FormField[];
  submitText?: string;
};

export type ContactItem = {
  text: string;
  href?: string;
};

export type Testimonial = {
  content?: string;
  name?: string;
  title?: string;
  image?: CloudImage | null;
};

export type Section = {
  id?: string;
  type: string;
  heading?: string;
  subheading?: string;
  eyebrow?: string;
  headingPrefix?: string;
  rotatingText?: string[];
  text?: string;
  introText?: string;
  bodyHtml?: string;
  layout?: string;
  backgroundImage?: CloudImage | null;
  image?: CloudImage | null;
  images?: CloudImage[];
  buttons?: LinkButton[];
  items?: Record<string, unknown>[];
  testimonials?: Testimonial[];
  breadcrumb?: string;
  formHeading?: string;
  form?: FormSchema;
  contactItems?: ContactItem[];
  source?: string;
  ctaText?: string;
  ctaHref?: string;
  blocks?: unknown;
};

export type Seo = {
  title?: string;
  description?: string;
  ogImage?: string | null;
  canonicalPath?: string;
  descriptionSource?: string;
};

export type ContentDoc = {
  id: string;
  wpId?: number;
  title: string;
  slug: string;
  path: string;
  status: string;
  excerpt?: string;
  publishedAt?: string;
  updatedAt?: string;
  template?: string | null;
  menuOrder?: number;
  featuredImage?: CloudImage | null;
  seo?: Seo;
  contentHtml?: string;
  sections?: Section[];
  parentSlug?: string | null;
  parentWpId?: number | null;
  author?: string;
  categories?: string[];
  tags?: string[];
  pricingHint?: {
    fromUSDPerMonth?: number;
    toUSDPerMonth?: number;
    source?: string;
  };
  flags?: string[];
  kind: "page" | "post";
};

export type PostCard = {
  title: string;
  path: string;
  excerpt?: string;
  publishedAt?: string;
  featuredImage?: CloudImage | null;
};

export type MenuItem = {
  label: string;
  href?: string | null;
  children?: MenuItem[];
};

export type Menu = {
  key: string;
  name: string;
  location?: string;
  items: MenuItem[];
};

export type PricingPlan = {
  name: string;
  price: number;
  cadence: string;
  blurb: string;
  features: string[];
  highlighted?: boolean;
  cta?: string;
  href?: string;
};

export type SocialLink = {
  network: string;
  url: string;
};

export type SiteSettings = {
  key: string;
  siteName: string;
  title: string;
  tagline: string;
  url: string;
  logo?: CloudImage | null;
  headerImages?: CloudImage[];
  footerLogo?: CloudImage | null;
  siteIcon?: CloudImage | null;
  announcementBar?: string;
  headerCta?: { text: string; href: string };
  contact: {
    phones: string[];
    emails: string[];
    raw?: ContactItem[];
    officeHours?: { text: string }[];
  };
  social: SocialLink[];
  chaty?: {
    position?: string;
    ctaText?: string;
    color?: string;
    channels?: {
      channel?: string;
      value?: string;
      url?: string;
      title?: string;
      preSetMessage?: string | null;
    }[];
  }[];
  freeTrialPopup?: {
    heading?: string;
    text?: string;
    form?: FormSchema;
  };
  footer: {
    copyright?: string;
    credit?: string;
  };
  homepageSlug?: string;
  postsPageSlug?: string;
  dateExported?: string;
  pricingPlans?: PricingPlan[];
};

export type Category = {
  id: string;
  wpId?: number;
  name: string;
  slug: string;
  description?: string;
  parentWpId?: number | null;
  count?: number;
  path?: string;
};

export type MediaItem = {
  id?: string;
  publicId: string;
  secureUrl: string;
  width?: number;
  height?: number;
  format?: string;
  alt?: string;
  title?: string;
  caption?: string;
  mimeType?: string;
  uploadedAt?: string;
  bytes?: number;
  wpId?: number;
};

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  course?: string;
  message?: string;
  heardFrom?: string;
  source: string;
  pagePath?: string;
  status: "new" | "read";
  createdAt: string;
};

export type ContentInput = {
  kind: "page" | "post";
  id?: string;
  previousPath?: string;
  title: string;
  slug: string;
  path: string;
  status: string;
  excerpt: string;
  contentHtml: string;
  sections: Section[];
  seo: Seo;
  featuredImage: CloudImage | null;
  author?: string;
  categories?: string[];
};
