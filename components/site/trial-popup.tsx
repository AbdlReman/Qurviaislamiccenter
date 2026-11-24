"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LeadForm } from "@/components/site/lead-form";
import { Button } from "@/components/ui/button";
import type { SiteSettings } from "@/lib/types";

export function TrialPopup({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname();
  const popup = settings.freeTrialPopup;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!popup?.form?.fields?.length) return;
    if (pathname.startsWith("/admin")) return;
    if (window.sessionStorage.getItem("ilm-trial-dismissed") === "1") return;
    const timer = window.setTimeout(() => setOpen(true), 1800);
    return () => window.clearTimeout(timer);
  }, [pathname, popup]);

  if (!open || !popup?.form) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/45 p-4 sm:items-center" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="trial-popup-title"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto border border-sand bg-white p-6 shadow-[0_24px_80px_rgb(18_26_22/0.2)]"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.16em] text-moss uppercase">Free trial</p>
            <h2 id="trial-popup-title" className="mt-1 font-[family-name:var(--font-display)] text-2xl tracking-tight text-ink">
              {popup.heading}
            </h2>
            {popup.text ? <p className="mt-2 text-sm leading-6 text-ink/65">{popup.text}</p> : null}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              window.sessionStorage.setItem("ilm-trial-dismissed", "1");
              setOpen(false);
            }}
          >
            Close
          </Button>
        </div>
        <LeadForm fields={popup.form.fields || []} submitText={popup.form.submitText} source="popup" pagePath={pathname} />
      </div>
    </div>
  );
}
