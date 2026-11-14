"use client";

import { useState, useTransition } from "react";
import { saveSettings } from "@/app/admin/actions";
import { MediaPicker } from "@/components/admin/media-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PricingPlan, SiteSettings } from "@/lib/types";

export function SettingsEditor({ initial }: { initial: SiteSettings }) {
  const [settings, setSettings] = useState(initial);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const plans = settings.pricingPlans || [];

  function setPlan(index: number, patch: Partial<PricingPlan>) {
    setSettings((current) => ({
      ...current,
      pricingPlans: (current.pricingPlans || []).map((plan, planIndex) => (planIndex === index ? { ...plan, ...patch } : plan)),
    }));
  }

  return (
    <form
      className="grid max-w-4xl gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        setError("");
        startTransition(async () => {
          const result = await saveSettings(settings);
          if (!result.ok) setError(result.error);
          else setSaved(true);
        });
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl text-[#0b4324]">Settings</h1>
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save settings"}</Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {saved ? <p className="text-sm text-[#0b4324]">Settings saved.</p> : null}

      <section className="grid gap-4 rounded-xl bg-white p-4 md:grid-cols-2">
        <Field label="Site name" value={settings.siteName} onChange={(siteName) => setSettings({ ...settings, siteName })} />
        <Field label="Browser title" value={settings.title} onChange={(title) => setSettings({ ...settings, title })} />
        <Field label="Tagline" value={settings.tagline} onChange={(tagline) => setSettings({ ...settings, tagline })} />
        <Field label="Public URL" value={settings.url} onChange={(url) => setSettings({ ...settings, url })} />
        <div className="md:col-span-2">
          <Label>Announcement bar</Label>
          <Textarea className="mt-1.5" value={settings.announcementBar || ""} onChange={(event) => setSettings({ ...settings, announcementBar: event.target.value })} />
        </div>
        <Field label="Header button" value={settings.headerCta?.text || ""} onChange={(text) => setSettings({ ...settings, headerCta: { text, href: settings.headerCta?.href || "/contact-us" } })} />
        <Field label="Header button link" value={settings.headerCta?.href || ""} onChange={(href) => setSettings({ ...settings, headerCta: { text: settings.headerCta?.text || "GET CLASS TRIAL", href } })} />
      </section>

      <section className="grid gap-4 rounded-xl bg-white p-4 md:grid-cols-3">
        <div>
          <Label>Header logo</Label>
          <div className="mt-2"><MediaPicker value={settings.logo} onChange={(logo) => setSettings({ ...settings, logo })} /></div>
        </div>
        <div>
          <Label>Footer logo</Label>
          <div className="mt-2"><MediaPicker value={settings.footerLogo} onChange={(footerLogo) => setSettings({ ...settings, footerLogo })} /></div>
        </div>
        <div>
          <Label>Site icon</Label>
          <div className="mt-2"><MediaPicker value={settings.siteIcon} onChange={(siteIcon) => setSettings({ ...settings, siteIcon })} /></div>
        </div>
      </section>

      <section className="grid gap-4 rounded-xl bg-white p-4">
        <h2 className="text-xl text-[#0b4324]">Contact</h2>
        <div className="grid gap-1.5">
          <Label>Phones, one per line</Label>
          <Textarea value={settings.contact.phones.join("\n")} onChange={(event) => setSettings({ ...settings, contact: { ...settings.contact, phones: lines(event.target.value) } })} />
        </div>
        <div className="grid gap-1.5">
          <Label>Emails, one per line</Label>
          <Textarea value={settings.contact.emails.join("\n")} onChange={(event) => setSettings({ ...settings, contact: { ...settings.contact, emails: lines(event.target.value) } })} />
        </div>
        <div className="grid gap-1.5">
          <Label>Office hours</Label>
          <Textarea
            value={(settings.contact.officeHours || []).map((item) => item.text).join("\n")}
            onChange={(event) =>
              setSettings({
                ...settings,
                contact: { ...settings.contact, officeHours: lines(event.target.value).map((text) => ({ text })) },
              })
            }
          />
        </div>
        <Field label="WhatsApp number" value={settings.chaty?.[0]?.channels?.[0]?.value || ""} onChange={(value) => {
          const chaty = [...(settings.chaty || [{ ctaText: "WhatsApp us", color: "#A886CD", channels: [{}] }])];
          const first = { ...chaty[0], channels: [{ ...(chaty[0].channels?.[0] || {}), value, channel: "Whatsapp" }] };
          chaty[0] = first;
          setSettings({ ...settings, chaty });
        }} />
        <Field label="Copyright" value={settings.footer.copyright || ""} onChange={(copyright) => setSettings({ ...settings, footer: { ...settings.footer, copyright } })} />
        <Field label="Footer credit" value={settings.footer.credit || ""} onChange={(credit) => setSettings({ ...settings, footer: { ...settings.footer, credit } })} />
      </section>

      <section className="grid gap-4 rounded-xl bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl text-[#0b4324]">Pricing plans</h2>
          <Button type="button" variant="outline" onClick={() => setSettings({ ...settings, pricingPlans: [...plans, { name: "New plan", price: 49, cadence: "month", blurb: "", features: ["One-to-one classes"], cta: "Book a free trial", href: "/contact-us" }] })}>
            Add plan
          </Button>
        </div>
        <p className="text-sm text-[#5e5a4e]">The public pricing page uses these plans. The original site only records a range of $29 to $99 per month.</p>
        {plans.map((plan, index) => (
          <div key={index} className="grid gap-3 rounded-lg border p-3 md:grid-cols-2">
            <Field label="Name" value={plan.name} onChange={(name) => setPlan(index, { name })} />
            <Field label="Price (USD)" value={String(plan.price)} onChange={(price) => setPlan(index, { price: Number(price) })} />
            <Field label="Cadence" value={plan.cadence} onChange={(cadence) => setPlan(index, { cadence })} />
            <Field label="Button link" value={plan.href || ""} onChange={(href) => setPlan(index, { href })} />
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Textarea className="mt-1.5" value={plan.blurb} onChange={(event) => setPlan(index, { blurb: event.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label>Features, one per line</Label>
              <Textarea className="mt-1.5" value={plan.features.join("\n")} onChange={(event) => setPlan(index, { features: lines(event.target.value) })} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={Boolean(plan.highlighted)} onChange={(event) => setPlan(index, { highlighted: event.target.checked })} />
              Highlight this plan
            </label>
            <Button type="button" variant="ghost" onClick={() => setSettings({ ...settings, pricingPlans: plans.filter((_, planIndex) => planIndex !== index) })}>
              Remove plan
            </Button>
          </div>
        ))}
      </section>
    </form>
  );
}

function lines(value: string): string[] {
  return value.split("\n").map((line) => line.trim()).filter(Boolean);
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
