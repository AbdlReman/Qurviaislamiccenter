"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CloudImage } from "@/components/site/cloud-image";
import { btnWhite, SmartLink } from "@/components/site/smart-link";
import { FALLBACK_MENU } from "@/lib/defaults";
import type { MenuItem, SiteSettings, Menu } from "@/lib/types";

function isActive(pathname: string, href?: string | null): boolean {
  if (!href || href === "#") return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function announcementParts(text: string): { lead: string; rest: string } {
  const bang = text.indexOf("!");
  if (bang === -1) return { lead: text, rest: "" };
  return { lead: text.slice(0, bang + 1), rest: text.slice(bang + 1).trim() };
}

export function Header({ settings, menus }: { settings: SiteSettings; menus: Menu[] }) {
  const pathname = usePathname();
  const menu = menus.find((item) => item.key === "main") ?? FALLBACK_MENU;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [seenPath, setSeenPath] = useState(pathname);
  const [coursesOpen, setCoursesOpen] = useState(false);
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setMobileOpen(false);
  }
  const wordmark = settings.headerImages?.[1] || settings.headerImages?.[0];
  const phone = settings.contact.phones[0];
  const cta = settings.headerCta || { text: "GET CLASS TRIAL", href: "/contact-us" };
  const announcement = announcementParts(settings.announcementBar || "");

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-40">
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>
      <div className="hidden overflow-hidden bg-gradient-to-r from-[#9d742c] to-[#f3f08b] text-white md:block">
        <div className="ilm-marquee flex w-[200%] py-2 text-sm">
          {[0, 1].map((copy) => (
            <p key={copy} className="w-1/2 px-8 whitespace-nowrap" aria-hidden={copy === 1}>
              <span className="font-bold">{announcement.lead}</span>
              {announcement.rest ? <span> {announcement.rest}</span> : null}
            </p>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between bg-gradient-to-r from-[#9d742c] to-[#f3f08b] px-4 py-2 text-sm font-semibold text-[#0b4324] md:hidden">
        {phone ? <a href={`tel:${phone.replace(/[^\d+]/g, "")}`}>{phone}</a> : <span>{settings.siteName}</span>}
        <SmartLink href={cta.href}>{cta.text}</SmartLink>
      </div>
      <div className="bg-[#0b4324] text-white">
        <div className="mx-auto flex max-w-[1240px] items-center gap-3 px-3 py-2 lg:gap-5 lg:px-4">
          <SmartLink href="/" className="shrink-0" aria-label={settings.siteName}>
            {settings.logo?.url ? (
              <CloudImage image={settings.logo} alt={settings.siteName} className="h-14 w-14 object-contain lg:h-16 lg:w-16" priority />
            ) : (
              <span className="font-[family-name:var(--font-patua)] text-lg">{settings.siteName}</span>
            )}
          </SmartLink>
          <nav aria-label="Main" className="ml-auto hidden items-center justify-end gap-x-3 gap-y-1 lg:flex xl:gap-x-4">
            {menu.items.map((item) => (
              <NavItem
                key={item.label}
                item={item}
                pathname={pathname}
                coursesOpen={coursesOpen}
                setCoursesOpen={setCoursesOpen}
              />
            ))}
          </nav>
          <div className="ml-auto hidden items-center gap-3 lg:ml-0 lg:flex">
            {wordmark?.url ? (
              <CloudImage image={wordmark} alt="" className="hidden h-9 w-auto xl:block" />
            ) : null}
            <SmartLink href={cta.href} className={btnWhite}>
              {cta.text}
            </SmartLink>
          </div>
          <button
            type="button"
            className="ml-auto inline-flex size-11 items-center justify-center rounded-md border border-white/30 lg:hidden"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((open) => !open)}
          >
            <span className="sr-only">Menu</span>
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8">
              {mobileOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>
      {mobileOpen ? (
        <nav aria-label="Mobile" className="max-h-[calc(100vh-8rem)] overflow-y-auto bg-[#072e18] px-4 py-4 text-white lg:hidden">
          <ul className="space-y-1">
            {menu.items.map((item) => (
              <li key={item.label}>
                {item.children?.length ? (
                  <details className="rounded-lg">
                    <summary className="cursor-pointer list-none px-2 py-3 text-sm tracking-[0.12em] uppercase">
                      {item.label}
                    </summary>
                    <ul className="space-y-1 pb-2 pl-3">
                      {item.children.map((child) => (
                        <li key={child.label}>
                          <SmartLink href={child.href} className="block rounded-md px-2 py-2 text-sm text-[#f3f08b]">
                            {child.label}
                          </SmartLink>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : (
                  <SmartLink
                    href={item.href}
                    className={`block rounded-md px-2 py-3 text-sm tracking-[0.12em] uppercase ${
                      isActive(pathname, item.href) ? "text-[#dab750]" : "text-white"
                    }`}
                  >
                    {item.label}
                  </SmartLink>
                )}
              </li>
            ))}
          </ul>
          <SmartLink href={cta.href} className={`${btnWhite} mt-4 w-full`}>
            {cta.text}
          </SmartLink>
        </nav>
      ) : null}
    </header>
  );
}

function NavItem({
  item,
  pathname,
  coursesOpen,
  setCoursesOpen,
}: {
  item: MenuItem;
  pathname: string;
  coursesOpen: boolean;
  setCoursesOpen: (open: boolean) => void;
}) {
  if (item.children?.length) {
    const childActive = item.children.some((child) => isActive(pathname, child.href));
    return (
      <div
        className="relative"
        onMouseEnter={() => setCoursesOpen(true)}
        onMouseLeave={() => setCoursesOpen(false)}
      >
        <button
          type="button"
          className={`text-[13px] tracking-[0.08em] uppercase xl:text-[15px] ${childActive || coursesOpen ? "text-[#dab750]" : "text-white"}`}
          aria-expanded={coursesOpen}
          onClick={() => setCoursesOpen(!coursesOpen)}
        >
          {item.label}
        </button>
        <div className={`absolute top-full right-0 z-50 min-w-64 pt-3 ${coursesOpen ? "block" : "hidden"}`}>
          <ul className="rounded-md bg-[#f3f3f3] py-2 text-[#0b4324] shadow-xl">
            {item.children.map((child) => (
              <li key={child.label}>
                <SmartLink
                  href={child.href}
                  className={`block px-4 py-2 text-sm tracking-wide uppercase hover:bg-[#0b4324] hover:text-white ${
                    isActive(pathname, child.href) ? "bg-[#0b4324] text-white" : ""
                  }`}
                >
                  {child.label}
                </SmartLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <SmartLink
      href={item.href}
      className={`text-[13px] tracking-[0.08em] uppercase xl:text-[15px] ${
        isActive(pathname, item.href) ? "text-[#dab750]" : "text-white hover:text-[#dab750]"
      }`}
    >
      {item.label}
    </SmartLink>
  );
}
