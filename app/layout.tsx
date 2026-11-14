import type { Metadata } from "next";
import { Patua_One, Source_Sans_3, Noto_Naskh_Arabic } from "next/font/google";
import { getSettings } from "@/lib/content";
import { siteUrl } from "@/lib/paths";
import "./globals.css";

const source = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source",
  display: "swap",
});

const patua = Patua_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-patua",
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
    <html lang="en" className={`${source.variable} ${patua.variable} ${naskh.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-[#1c1c1c]">{children}</body>
    </html>
  );
}
