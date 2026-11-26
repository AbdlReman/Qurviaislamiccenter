"use server";

import { headers } from "next/headers";
import { saveLeadFromFormData, type LeadResult } from "@/lib/leads";

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

export async function submitLead(formData: FormData): Promise<LeadResult> {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (tooMany(ip)) return { ok: false, error: "Please wait a minute before sending another request." };
  return saveLeadFromFormData(formData);
}
