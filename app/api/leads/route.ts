import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { saveLeadFromFormData } from "@/lib/leads";

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

export async function POST(request: Request) {
  try {
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    if (tooMany(ip)) {
      return NextResponse.json(
        { ok: false, error: "Please wait a minute before sending another request." },
        { status: 429 },
      );
    }

    const formData = await request.formData();
    const result = await saveLeadFromFormData(formData);
    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/leads failed", error);
    return NextResponse.json(
      { ok: false, error: "Could not save your request. Please try again in a moment." },
      { status: 500 },
    );
  }
}
