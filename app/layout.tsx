import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit, Noto_Naskh_Arabic } from "next/font/google";
import { getSettings } from "@/lib/content";
import { siteUrl } from "@/lib/paths";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const naskh = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: settings.title || settings.siteName,
      template: "%s",
    },
    description: settings.tagline,
    icons: settings.siteIcon?.url ? { icon: settings.siteIcon.url } : undefined,
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${display.variable} ${naskh.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-mist text-ink">{children}</body>
    </html>
  );
}
