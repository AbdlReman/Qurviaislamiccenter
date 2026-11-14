"use server";

import { headers } from "next/headers";
import { getDb } from "@/lib/mongodb";

const hits = new Map<string, number[]>();

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

export async function submitLead(formData: FormData): Promise<{ ok: true } | { ok: false; error: string }> {
  if (String(formData.get("company_website") || "").trim()) return { ok: true };

  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (tooMany(ip)) return { ok: false, error: "Please wait a minute before sending another request." };

  const name = text(formData, "name", 120);
  const phone = text(formData, "phone", 40);
  const email = text(formData, "email", 160);
  const course = text(formData, "course", 120);
  const message = text(formData, "message", 2000);
  const heardFrom = text(formData, "heardFrom", 80);
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
    status: "new",
    createdAt: new Date().toISOString(),
  });
  return { ok: true };
}
