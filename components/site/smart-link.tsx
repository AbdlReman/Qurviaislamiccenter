import Link from "next/link";
import type { ReactNode } from "react";

export function SmartLink({
  href,
  className,
  children,
}: {
  href?: string | null;
  className?: string;
  children: ReactNode;
}) {
  const target = href || "#";
  if (target.startsWith("#") || target.startsWith("mailto:") || target.startsWith("tel:")) {
    return (
      <a href={target} className={className}>
        {children}
      </a>
    );
  }
  if (target.startsWith("http://") || target.startsWith("https://")) {
    return (
      <a href={target} className={className} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={target} className={className}>
      {children}
    </Link>
  );
}

export const btnGreen =
  "inline-flex min-h-12 items-center justify-center rounded-md bg-gradient-to-r from-[#0b4324] to-[#639139] px-7 py-3 text-center font-[family-name:var(--font-patua)] text-base tracking-wide text-white shadow-sm transition hover:from-[#ba9d4c] hover:to-[#ba9d4c]";

export const btnGold =
  "inline-flex min-h-12 items-center justify-center rounded-md bg-gradient-to-r from-[#9f772e] to-[#e3d879] px-7 py-3 text-center font-[family-name:var(--font-patua)] text-base tracking-wide text-white shadow-sm transition hover:from-[#0b4324] hover:to-[#639139]";

export const btnWhite =
  "inline-flex min-h-10 items-center justify-center rounded-md bg-white px-4 py-2 text-center font-[family-name:var(--font-patua)] text-sm tracking-[0.08em] text-[#0b4324] transition hover:bg-[#dab750]";
