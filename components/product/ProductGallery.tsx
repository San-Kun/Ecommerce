"use client";

import { useState } from "react";
import { LeafIcon } from "@/components/icons/LeafIcon";

export function ProductGallery({
  images,
  alt,
  isOrganic,
  overlay,
}: {
  images: string[];
  alt: string;
  isOrganic?: boolean;
  overlay?: React.ReactNode;
}) {
  const [active, setActive] = useState(0);
  const [broken, setBroken] = useState<Record<number, boolean>>({});

  const validImages = images.filter((_, i) => !broken[i]);
  const current = images[active];
  const showImage = current && !broken[active];

  return (
    <div>
      {/* Gambar utama */}
      <div className="leaf-pattern relative aspect-square overflow-hidden rounded-xl bg-emerald-50">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={current}
            src={current}
            alt={alt}
            className="animate-fade-in-up h-full w-full object-cover"
            onError={() => setBroken((b) => ({ ...b, [active]: true }))}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <LeafIcon className="h-20 w-20 text-emerald-300" />
          </div>
        )}

        {isOrganic && (
          <span className="stamp-badge absolute left-4 top-4 bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-700 backdrop-blur-sm">
            organik
          </span>
        )}

        {overlay && <div className="absolute right-3 top-3">{overlay}</div>}
      </div>

      {/* Thumbnail (tampil kalau ada lebih dari 1 gambar valid) */}
      {validImages.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) =>
            broken[i] ? null : (
              <button
                key={img + i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Lihat gambar ${i + 1}`}
                className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                  active === i ? "border-emerald-600" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={`${alt} ${i + 1}`}
                  className="h-full w-full object-cover"
                  onError={() => setBroken((b) => ({ ...b, [i]: true }))}
                />
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
