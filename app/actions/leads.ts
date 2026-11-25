"use server";

import { headers } from "next/headers";
import { getDb } from "@/lib/mongodb";

const hits = new Map<string, number[]>();

const SKIP_KEYS = new Set(["source", "pagePath", "company_website", "website_url_hp", "_hp"]);

function tooMany(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((stamp) => now - stamp < 60_000);
  if (recent.length >= 6) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

function text(formData: FormData, key: string, max: number): string {
  return String(formData.get(key) || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function pick(formData: FormData, keys: string[], max: number): string {
  for (const key of keys) {
    const value = text(formData, key, max);
    if (value) return value;
  }
  return "";
}

function collectDetails(formData: FormData): Record<string, string> {
  const details: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (SKIP_KEYS.has(key) || key.startsWith("_")) continue;
    if (typeof value !== "string") continue;
    const cleaned = value.replace(/\s+/g, " ").trim().slice(0, 2000);
    if (!cleaned) continue;
    details[key] = cleaned;
  }
  return details;
}

function fromDetails(details: Record<string, string>, matchers: RegExp[]): string {
  for (const [key, value] of Object.entries(details)) {
    if (matchers.some((re) => re.test(key))) return value;
  }
  return "";
}

export async function submitLead(formData: FormData): Promise<{ ok: true } | { ok: false; error: string }> {
  // Honeypot — only treat as bot if filled; obscure name avoids browser autofill
  const honeypot = String(formData.get("website_url_hp") || formData.get("company_website") || "").trim();
  if (honeypot) return { ok: true };

  try {
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    if (tooMany(ip)) return { ok: false, error: "Please wait a minute before sending another request." };

    const details = collectDetails(formData);

    const name =
      pick(formData, ["name", "fullName", "full_name", "form_fields[name]"], 120) ||
      fromDetails(details, [/^name$/i, /full.?name/i, /\[name\]/i]);
    const phone =
      pick(formData, ["phone", "tel", "whatsapp", "form_fields[field_ec3694d]"], 40) ||
      fromDetails(details, [/phone|tel|whatsapp|ec3694d/i]);
    const email =
      pick(formData, ["email", "form_fields[email]"], 160) ||
      fromDetails(details, [/email/i]);
    const course =
      pick(formData, ["course", "form_fields[field_1e2d594]"], 120) ||
      fromDetails(details, [/course|1e2d594/i]);
    const message =
      pick(formData, ["message", "form_fields[message]"], 2000) ||
      fromDetails(details, [/message|comment|note/i]);
    const heardFrom =
      pick(formData, ["heardFrom", "heard_from", "form_fields[field_cc5c6b5]"], 80) ||
      fromDetails(details, [/hear|cc5c6b5/i]);

    const source = text(formData, "source", 40) || "contact";
    const pagePath = text(formData, "pagePath", 180);

    if (name.length < 2) return { ok: false, error: "Please add the student's or parent's name." };
    if (phone.length < 6) return { ok: false, error: "Please add a phone or WhatsApp number." };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Please add a valid email address." };

    const db = await getDb();
    await db.collection("leads").insertOne({
      name,
      phone,
      email,
      course,
      message,
      heardFrom,
      source,
      pagePath,
      details,
      status: "new",
      createdAt: new Date().toISOString(),
    });
    return { ok: true };
  } catch (error) {
    console.error("submitLead failed", error);
    return { ok: false, error: "Could not save your request. Please try again in a moment." };
  }
}
