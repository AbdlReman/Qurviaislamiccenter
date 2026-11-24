"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CloudImage } from "@/components/site/cloud-image";
import { SmartLink } from "@/components/site/smart-link";
import { FALLBACK_MENU } from "@/lib/defaults";
import { telHref } from "@/lib/format";
import type { MenuItem, SiteSettings, Menu, SocialLink } from "@/lib/types";

function isActive(pathname: string, href?: string | null): boolean {
  if (!href || href === "#") return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function emblemLogoUrl(url: string): string {
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", "/upload/c_fill,g_north,h_500,w_500,q_auto,f_auto/");
  }
  return url;
}

function SocialIcon({ network }: { network: string }) {
  const name = network.toLowerCase();
  if (name.includes("facebook")) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden fill="currentColor">
        <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.6l.4-3H13v-2c0-.6.4-1 1-1z" />
      </svg>
    );
  }
  if (name.includes("instagram")) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden fill="currentColor">
        <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 4.2A4.8 4.8 0 1 0 16.8 12 4.8 4.8 0 0 0 12 7.2zm0 1.8A3 3 0 1 1 9 12a3 3 0 0 1 3-3zm5.4-2.4a1.1 1.1 0 1 0 1.1 1.1 1.1 1.1 0 0 0-1.1-1.1z" />
      </svg>
    );
  }
  if (name.includes("youtube")) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden fill="currentColor">
        <path d="M23 12.2s0-3.2-.4-4.6a3 3 0 0 0-2.1-2.1C18.9 5 12 5 12 5s-6.9 0-8.5.5a3 3 0 0 0-2.1 2.1C1 9 1 12.2 1 12.2s0 3.2.4 4.6a3 3 0 0 0 2.1 2.1C5.1 19.4 12 19.4 12 19.4s6.9 0 8.5-.5a3 3 0 0 0 2.1-2.1c.4-1.4.4-4.6.4-4.6zM9.8 15.5v-6.6l6.2 3.3z" />
      </svg>
    );
  }
  if (name.includes("tiktok")) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden fill="currentColor">
        <path d="M14 3h2.1a5.2 5.2 0 0 0 3.4 3.2v2.2a7.3 7.3 0 0 1-3.4-1v6.4a5.8 5.8 0 1 1-5.8-5.8c.3 0 .6 0 .9.1v2.4a3.4 3.4 0 1 0 2.4 3.3V3z" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <path d="M4 4h3.2l4.2 5.7L16.2 4H20l-6.4 8.2L20.4 20h-3.2l-4.6-6.2L7.6 20H4l6.8-8.6z" />
    </svg>
  );
}

export function Header({ settings, menus }: { settings: SiteSettings; menus: Menu[] }) {
  const pathname = usePathname();
  const menu = menus.find((item) => item.key === "main") ?? FALLBACK_MENU;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const phone = settings.contact.phones[0];
  const email = settings.contact.emails[0];
  const social = settings.social ?? [];
  const cta = settings.headerCta || { text: "GET CLASS TRIAL", href: "/contact-us" };

  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
    <header
      className={`fixed inset-x-0 top-0 z-40 w-full bg-white transition-shadow duration-300 ${
        scrolled ? "shadow-[0_8px_28px_rgb(0_0_0/0.14)]" : "shadow-none"
      }`}
    >
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:px-3 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>

      {/* Top bar — solid sticky bg */}
      <div className="border-b border-black/10 bg-[#e8ebe6] text-black">
        <div className="mx-auto flex h-10 w-full max-w-[1140px] items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-3">
            {social.length > 0 ? (
              <>
                <span className="hidden text-[11px] text-black/55 sm:inline">Follow us:</span>
                <ul className="flex items-center gap-2.5">
                  {social.slice(0, 4).map((item: SocialLink) => (
                    <li key={item.url}>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={item.network}
                        className="text-black/70 transition hover:text-black"
                      >
                        <SocialIcon network={item.network} />
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-4">
            {email ? (
              <a
                href={`mailto:${email}`}
                className="hidden items-center gap-1.5 text-[11px] text-black/75 whitespace-nowrap transition hover:text-black lg:inline-flex"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 7 9-7" />
                </svg>
                {email}
              </a>
            ) : null}
            {phone ? (
              <a
                href={telHref(phone)}
                className="inline-flex items-center gap-1.5 text-[11px] text-black/80 whitespace-nowrap transition hover:text-black"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.5-1.1a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z" />
                </svg>
                {phone}
              </a>
            ) : null}
            <SmartLink
              href={cta.href}
              className="ml-3 inline-flex h-7 items-center justify-center rounded-md bg-[#1b3a2a] px-3 text-[6px] font-semibold tracking-[0.08em] text-black shadow-sm whitespace-nowrap transition hover:bg-[#14261c] hover:shadow-md"
            >
              {cta.text}
            </SmartLink>
          </div>
        </div>
      </div>

      {/* Main bar — solid white */}
      <div className="border-b border-black/10 bg-white text-black">
        <div className="mx-auto flex h-16 w-full max-w-[1140px] items-center gap-3 px-4 lg:h-[4.5rem] lg:gap-4">
          <SmartLink href="/" className="flex shrink-0 items-center" aria-label={settings.siteName}>
            {settings.logo?.url ? (
              <CloudImage
                image={{
                  ...settings.logo,
                  url: emblemLogoUrl(settings.logo.url),
                  width: 160,
                  height: 160,
                }}
                alt={settings.siteName}
                className="h-14 w-14 object-contain lg:h-16 lg:w-16"
                priority
                sizes="64px"
              />
            ) : (
              <span className="font-[family-name:var(--font-display)] text-xl text-black">Qurvia</span>
            )}
          </SmartLink>

          <nav aria-label="Main" className="ml-auto hidden items-center gap-0.5 lg:flex">
            {menu.items.map((item) => (
              <NavItem
                key={item.label}
                item={item}
                pathname={pathname}
                open={openDropdown === item.label}
                onOpen={() => setOpenDropdown(item.label)}
                onClose={() => setOpenDropdown(null)}
              />
            ))}
          </nav>

          <button
            type="button"
            className="ml-auto flex h-9 w-9 items-center justify-center border border-black/20 text-black lg:hidden"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((open) => !open)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              {mobileOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <nav className="max-h-[calc(100vh-6.5rem)] overflow-y-auto border-b border-black/10 bg-white px-4 py-4 text-black lg:hidden" aria-label="Mobile">
          <ul className="space-y-0.5">
            {menu.items.map((item) => (
              <li key={item.label}>
                {item.children?.length ? (
                  <details>
                    <summary className="cursor-pointer list-none px-2 py-3 text-[15px] whitespace-nowrap">
                      {item.label}
                    </summary>
                    <ul className="pb-2 pl-3">
                      {item.children.map((child) => (
                        <li key={child.label}>
                          <SmartLink href={child.href} className="block px-2 py-2 text-sm text-black/65">
                            {child.label}
                          </SmartLink>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : (
                  <SmartLink
                    href={item.href}
                    className={`block px-2 py-3 text-[15px] whitespace-nowrap ${
                      isActive(pathname, item.href) ? "text-black" : "text-black/70"
                    }`}
                  >
                    {item.label}
                  </SmartLink>
                )}
              </li>
            ))}
          </ul>
          <SmartLink
            href={cta.href}
            className="mt-4 flex h-11 w-full items-center justify-center bg-[#1b3a2a] text-[8px] font-semibold tracking-[0.08em] text-black whitespace-nowrap"
          >
            {cta.text}
          </SmartLink>
        </nav>
      ) : null}
    </header>
    {/* Spacer so content doesn't sit under fixed header (top 2.5rem + main ~4.5rem) */}
    <div className="h-[7rem] lg:h-[7.5rem]" aria-hidden />
    </>
  );
}

function NavItem({
  item,
  pathname,
  open,
  onOpen,
  onClose,
}: {
  item: MenuItem;
  pathname: string;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const linkClass = (active: boolean) =>
    `inline-flex h-16 items-center px-2 text-[13px] font-medium tracking-[0.02em] whitespace-nowrap transition-colors lg:h-[4.5rem] xl:px-2.5 xl:text-sm ${
      active ? "text-black" : "text-black/70 hover:text-black"
    }`;

  if (item.children?.length) {
    const childActive = item.children.some((child) => isActive(pathname, child.href));
    return (
      <div className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
        <button
          type="button"
          className={linkClass(childActive || open)}
          aria-expanded={open}
          onClick={() => (open ? onClose() : onOpen())}
        >
          {item.label}
          <span className="ml-1 text-[9px] leading-none text-black/55" aria-hidden>
            ▼
          </span>
        </button>
        {open ? (
          <div className="absolute top-full left-0 z-50 min-w-[220px] pt-0">
            <ul className="border border-black/10 bg-white py-2 shadow-xl">
              {item.children.map((child) => (
                <li key={child.label}>
                  <SmartLink
                    href={child.href}
                    className={`block px-4 py-2.5 text-[13px] whitespace-nowrap transition-colors hover:bg-black/5 ${
                      isActive(pathname, child.href) ? "bg-black/5 text-black" : "text-black/70"
                    }`}
                  >
                    {child.label}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <SmartLink href={item.href} className={linkClass(isActive(pathname, item.href))}>
      {item.label}
    </SmartLink>
  );
}
