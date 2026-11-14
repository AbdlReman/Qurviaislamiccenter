import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listMedia } from "@/lib/admin-data";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const query = new URL(request.url).searchParams.get("q") || "";
  const items = await listMedia(query);
  return NextResponse.json({ items });
}
