"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { login } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden bg-[#0b4324] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <p className="font-[family-name:var(--font-display)] text-3xl">Qurvia Islamic Center</p>
        <div>
          <p className="text-sm tracking-[0.16em] text-[#e3d879] uppercase">Certified teachers</p>
          <h1 className="mt-3 max-w-md font-[family-name:var(--font-display)] text-5xl leading-tight">The studio for pages, courses, and trial requests.</h1>
        </div>
        <p className="text-sm text-white/70">Male & female Quran teachers · live one-to-one classes</p>
      </section>
      <section className="flex items-center justify-center bg-[#f6f3ea] px-6 py-16">
        <form
          className="grid w-full max-w-sm gap-4 rounded-2xl bg-white p-6 shadow-sm"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            setError("");
            startTransition(async () => {
              const result = await login(data);
              if (result) setError(result.error);
            });
          }}
        >
          <h2 className="font-[family-name:var(--font-display)] text-3xl text-[#0b4324]">Sign in</h2>
          <input type="hidden" name="next" value={params.get("next") || "/admin"} />
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="username" required />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" disabled={pending} className="h-10">
            {pending ? "Signing in…" : "Enter studio"}
          </Button>
        </form>
      </section>
    </main>
  );
}
