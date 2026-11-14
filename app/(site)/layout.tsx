import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { TrialPopup } from "@/components/site/trial-popup";
import { WhatsAppButton } from "@/components/site/whatsapp";
import { getMenus, getSettings } from "@/lib/content";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, menus] = await Promise.all([getSettings(), getMenus()]);
  const sameAs = settings.social.map((item) => item.url);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: settings.siteName,
    description: settings.tagline,
    url: settings.url,
    email: settings.contact.emails[0],
    telephone: settings.contact.phones,
    sameAs,
  };

  return (
    <div className="site-root flex min-h-full flex-1 flex-col">
      <Header settings={settings} menus={menus} />
      <main id="content" className="flex-1">
        {children}
      </main>
      <Footer settings={settings} menus={menus} />
      <WhatsAppButton settings={settings} />
      <TrialPopup settings={settings} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
