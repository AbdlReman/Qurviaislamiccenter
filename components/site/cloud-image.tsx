import Image from "next/image";
import type { CloudImage as CloudImageData } from "@/lib/types";

type Props = {
  image?: CloudImageData | null;
  alt?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
};

export function CloudImage({ image, alt, className, priority, sizes, fill }: Props) {
  if (!image?.url) return null;
  const resolvedAlt = alt ?? image.alt ?? "";
  if (fill) {
    return (
      <Image
        src={image.url}
        alt={resolvedAlt}
        fill
        className={className}
        priority={priority}
        sizes={sizes}
      />
    );
  }
  return (
    <Image
      src={image.url}
      alt={resolvedAlt}
      className={className}
      priority={priority}
      sizes={sizes}
      width={Math.max(1, image.width || 1200)}
      height={Math.max(1, image.height || 800)}
    />
  );
}
