"use client";

import { LeafIcon } from "@/components/icons/LeafIcon";

interface ProductImageProps {
  src: string | null;
  alt: string;
}

export function ProductImage({ src, alt }: ProductImageProps) {
  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <LeafIcon className="h-12 w-12 text-emerald-300" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  );
}