import { Suspense } from "react";
import { LoginForm } from "@/app/admin/login/login-form";

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="grid min-h-screen place-items-center bg-[#f6f3ea]">Opening the studio…</main>}>
      <LoginForm />
    </Suspense>
  );
}
