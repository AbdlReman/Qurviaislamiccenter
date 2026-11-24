"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CloudImage } from "@/components/site/cloud-image";
import { btnGreen, SmartLink } from "@/components/site/smart-link";
import { FALLBACK_MENU } from "@/lib/defaults";
import type { MenuItem, SiteSettings, Menu } from "@/lib/types";

function isActive(pathname: string, href?: string | null): boolean {
  if (!href || href === "#") return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Crop full brand mark to the emblem only for the header. */
function emblemLogoUrl(url: string): string {
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", "/upload/c_fill,g_north,h_500,w_500,q_auto,f_auto/");
  }
  return url;
}

export function Header({ settings, menus }: { settings: SiteSettings; menus: Menu[] }) {
  const pathname = usePathname();
  const menu = menus.find((item) => item.key === "main") ?? FALLBACK_MENU;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);

  const cta = settings.headerCta || { text: "GET CLASS TRIAL", href: "/contact-us" };

  useEffect(() => {
    setMobileOpen(false);
    setCoursesOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-sand/80 bg-white/90 backdrop-blur-md">
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>
      <div className="mx-auto flex max-w-[1200px] items-center gap-4 px-4 py-3 lg:px-6">
        <SmartLink href="/" className="flex shrink-0 items-center" aria-label={settings.siteName}>
          {settings.logo?.url ? (
            <CloudImage
              image={{
                ...settings.logo,
                url: emblemLogoUrl(settings.logo.url),
                width: 112,
                height: 112,
              }}
              alt={settings.siteName}
              className="h-12 w-12 object-contain lg:h-14 lg:w-14"
              priority
              sizes="56px"
            />
          ) : (
            <span className="font-[family-name:var(--font-display)] text-xl tracking-tight text-ink">
              {settings.siteName}
            </span>
          )}
        </SmartLink>

        <nav aria-label="Main" className="ml-auto hidden items-center gap-x-6 lg:flex">
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

        <SmartLink href={cta.href} className={`${btnGreen} ml-2 hidden !min-h-10 !px-5 !py-2 text-xs lg:inline-flex`}>
          {cta.text}
        </SmartLink>

        <button
          type="button"
          className="ml-auto inline-flex size-11 items-center justify-center rounded-sm border border-pine/20 text-pine lg:hidden"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((open) => !open)}
        >
          <span className="sr-only">Menu</span>
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6">
            {mobileOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {mobileOpen ? (
        <nav aria-label="Mobile" className="max-h-[calc(100vh-4.5rem)] overflow-y-auto border-t border-sand bg-white px-4 py-5 lg:hidden">
          <ul className="space-y-1">
            {menu.items.map((item) => (
              <li key={item.label}>
                {item.children?.length ? (
                  <details className="rounded-sm">
                    <summary className="cursor-pointer list-none px-2 py-3 text-sm tracking-[0.08em] text-ink uppercase">
                      {item.label}
                    </summary>
                    <ul className="space-y-1 pb-2 pl-3">
                      {item.children.map((child) => (
                        <li key={child.label}>
                          <SmartLink href={child.href} className="block rounded-sm px-2 py-2 text-sm text-moss">
                            {child.label}
                          </SmartLink>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : (
                  <SmartLink
                    href={item.href}
                    className={`block rounded-sm px-2 py-3 text-sm tracking-[0.08em] uppercase ${
                      isActive(pathname, item.href) ? "text-pine" : "text-ink"
                    }`}
                  >
                    {item.label}
                  </SmartLink>
                )}
              </li>
            ))}
          </ul>
          <SmartLink href={cta.href} className={`${btnGreen} mt-5 w-full`}>
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
          className={`text-[13px] tracking-[0.06em] uppercase transition-colors ${
            childActive || coursesOpen ? "text-pine" : "text-ink/70 hover:text-ink"
          }`}
          aria-expanded={coursesOpen}
          onClick={() => setCoursesOpen(!coursesOpen)}
        >
          {item.label}
        </button>
        <div className={`absolute top-full right-0 z-50 min-w-60 pt-3 ${coursesOpen ? "block" : "hidden"}`}>
          <ul className="border border-sand bg-white py-2 text-ink shadow-[0_12px_40px_rgb(18_26_22/0.08)]">
            {item.children.map((child) => (
              <li key={child.label}>
                <SmartLink
                  href={child.href}
                  className={`block px-4 py-2.5 text-sm tracking-wide transition-colors hover:bg-mist ${
                    isActive(pathname, child.href) ? "bg-mist text-pine" : ""
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
      className={`text-[13px] tracking-[0.06em] uppercase transition-colors ${
        isActive(pathname, item.href) ? "text-pine" : "text-ink/70 hover:text-ink"
      }`}
    >
      {item.label}
    </SmartLink>
  );
}
