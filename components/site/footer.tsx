import { CloudImage } from "@/components/site/cloud-image";
import { SmartLink } from "@/components/site/smart-link";
import { parseCredit, telHref } from "@/lib/format";
import type { Menu, SiteSettings } from "@/lib/types";

function SocialIcon({ network }: { network: string }) {
  const name = network.toLowerCase();
  const common = "size-4";
  if (name.includes("facebook")) {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden fill="currentColor">
        <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.6l.4-3H13v-2c0-.6.4-1 1-1z" />
      </svg>
    );
  }
  if (name.includes("instagram")) {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden fill="currentColor">
        <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm10 2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-5 3.2A3.8 3.8 0 1 1 8.2 12 3.8 3.8 0 0 1 12 8.2zm0 1.6A2.2 2.2 0 1 0 14.2 12 2.2 2.2 0 0 0 12 9.8zM17.2 6.6a1 1 0 1 1-1 1 1 1 0 0 1 1-1z" />
      </svg>
    );
  }
  if (name.includes("youtube")) {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden fill="currentColor">
        <path d="M23 12.2s0-3.2-.4-4.6a3 3 0 0 0-2.1-2.1C18.9 5 12 5 12 5s-6.9 0-8.5.5a3 3 0 0 0-2.1 2.1C1 9 1 12.2 1 12.2s0 3.2.4 4.6a3 3 0 0 0 2.1 2.1C5.1 19.4 12 19.4 12 19.4s6.9 0 8.5-.5a3 3 0 0 0 2.1-2.1c.4-1.4.4-4.6.4-4.6zM9.8 15.5v-6.6l6.2 3.3z" />
      </svg>
    );
  }
  if (name.includes("tiktok")) {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden fill="currentColor">
        <path d="M14 3h2.1a5.2 5.2 0 0 0 3.4 3.2v2.2a7.3 7.3 0 0 1-3.4-1v6.4a5.8 5.8 0 1 1-5.8-5.8c.3 0 .6 0 .9.1v2.4a3.4 3.4 0 1 0 2.4 3.3V3z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={common} aria-hidden fill="currentColor">
      <path d="M4 4h3.2l4.2 5.7L16.2 4H20l-6.4 8.2L20.4 20h-3.2l-4.6-6.2L7.6 20H4l6.8-8.6z" />
    </svg>
  );
}

export function Footer({ settings, menus }: { settings: SiteSettings; menus: Menu[] }) {
  const courses = menus.find((menu) => menu.key === "footer-courses");
  const more = menus.find((menu) => menu.key === "footer-more");
  const credit = parseCredit(settings.footer.credit);
  const logo = settings.footerLogo || settings.logo;

  return (
    <footer className="mt-auto border-t border-sand bg-pine text-white">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-16 md:grid-cols-2 lg:grid-cols-4 lg:px-6">
        <div>
          <SmartLink href="/" className="inline-flex items-center gap-3">
            {logo?.url ? (
              <CloudImage image={logo} alt={settings.siteName} className="h-14 w-14 object-contain brightness-0 invert" />
            ) : null}
            <span className="font-[family-name:var(--font-display)] text-2xl tracking-tight">{settings.siteName}</span>
          </SmartLink>
          <p className="mt-4 max-w-xs text-sm leading-7 text-white/70">{settings.tagline}</p>
          {settings.social.length ? (
            <ul className="mt-6 flex flex-wrap items-center gap-2">
              {settings.social.map((item) => (
                <li key={item.url}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.network}
                    className="flex size-9 items-center justify-center rounded-sm border border-white/15 text-white/80 transition hover:border-white/40 hover:text-white"
                  >
                    <SocialIcon network={item.network} />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <FooterMenu title="Courses" menu={courses} />
        <FooterMenu title="Explore" menu={more} />
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl tracking-tight">Contact</h2>
          <ul className="mt-4 space-y-2 text-sm leading-7 text-white/75">
            {settings.contact.phones.map((phone) => (
              <li key={phone}>
                <a href={telHref(phone)} className="transition hover:text-white">
                  {phone}
                </a>
              </li>
            ))}
            {settings.contact.emails.map((email) => (
              <li key={email}>
                <a href={`mailto:${email}`} className="transition hover:text-white">
                  {email}
                </a>
              </li>
            ))}
            {(settings.contact.officeHours ?? []).map((hours) => (
              <li key={hours.text}>{hours.text}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-sm text-white/55">
        <p>{settings.footer.copyright}</p>
        <p className="mt-1">
          {credit.href ? (
            <a href={credit.href} className="transition hover:text-white" target="_blank" rel="noopener noreferrer">
              {credit.text}
            </a>
          ) : (
            credit.text
          )}
          <span className="mx-2">·</span>
          <SmartLink href="/pricing" className="transition hover:text-white">
            Pricing
          </SmartLink>
        </p>
      </div>
    </footer>
  );
}

function FooterMenu({ title, menu }: { title: string; menu?: Menu }) {
  if (!menu) return <div />;
  return (
    <div>
      <h2 className="font-[family-name:var(--font-display)] text-xl tracking-tight">{title}</h2>
      <ul className="mt-4 space-y-2 text-sm text-white/75">
        {menu.items.map((item) => (
          <li key={item.label}>
            <SmartLink href={item.href} className="transition hover:text-white">
              {item.label}
            </SmartLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
