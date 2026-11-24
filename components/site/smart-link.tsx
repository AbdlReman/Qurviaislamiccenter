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
  "inline-flex min-h-12 items-center justify-center rounded-sm bg-pine px-8 py-3 text-center text-sm font-medium tracking-[0.04em] text-white transition duration-300 hover:bg-ink";

export const btnGold =
  "inline-flex min-h-12 items-center justify-center rounded-sm border border-pine/25 bg-transparent px-8 py-3 text-center text-sm font-medium tracking-[0.04em] text-pine transition duration-300 hover:border-pine hover:bg-pine hover:text-white";

export const btnWhite =
  "inline-flex min-h-10 items-center justify-center rounded-sm bg-white px-5 py-2.5 text-center text-sm font-medium tracking-[0.04em] text-pine transition duration-300 hover:bg-mist";
