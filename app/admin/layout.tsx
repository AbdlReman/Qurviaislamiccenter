import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studio · Qurvia",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
