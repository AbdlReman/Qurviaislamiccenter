import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { digestEqual, SESSION_COOKIE, signSession, verifySessionToken, type SessionPayload } from "@/lib/session";

const MAX_AGE = 60 * 60 * 24 * 7;

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function setSessionCookie(email: string): Promise<void> {
  const token = await signSession({
    email,
    exp: Date.now() + MAX_AGE * 1000,
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function credentialsMatch(email: string, password: string): Promise<boolean> {
  const expectedEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const expectedPassword = process.env.ADMIN_PASSWORD || "";
  if (!expectedEmail || !expectedPassword || !process.env.AUTH_SECRET) return false;
  const [emailOk, passwordOk] = await Promise.all([
    digestEqual(email.trim().toLowerCase(), expectedEmail),
    digestEqual(password, expectedPassword),
  ]);
  return emailOk && passwordOk;
}
