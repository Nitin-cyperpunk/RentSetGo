"use client";

import Image from "next/image";
import { useState } from "react";

import type { GalleryImage } from "@/types/property";

function EnlargedModal({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <Image
          src={src}
          alt=""
          width={1200}
          height={800}
          className="max-h-[85vh] w-full rounded-xl bg-zinc-100 object-contain shadow-2xl dark:bg-zinc-900"
        />
        <button
          type="button"
          className="absolute right-2 top-2 rounded-full bg-white/90 p-2 shadow hover:bg-white dark:bg-zinc-800"
          aria-label="Close enlarged image"
          onClick={onClose}
        >
          <svg width={24} height={24} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <line x1={6} y1={6} x2={18} y2={18} />
            <line x1={18} y1={6} x2={6} y2={18} />
          </svg>
        </button>
      </div>
    </div>
  );
}

type Props = {
  images: GalleryImage[];
  imageTitle: string;
};

export function PropertyImageGallery({ images, imageTitle }: Props) {
  const [enlarged, setEnlarged] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const safeIndex = images.length ? Math.min(activeIndex, images.length - 1) : 0;
  const main = images[safeIndex]?.url;

  return (
    <>
      {enlarged && <EnlargedModal src={enlarged} onClose={() => setEnlarged(null)} />}
      <div>
        {images.length > 0 ? (
          <>
            <div
              className="group relative aspect-[16/10] cursor-zoom-in overflow-hidden rounded-xl shadow ring-1 ring-zinc-200 dark:ring-zinc-700"
              onClick={() => main && setEnlarged(main)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && main) setEnlarged(main);
              }}
              tabIndex={0}
              role="button"
              aria-label="Enlarge main photo"
            >
              {main ? (
                <Image
                  src={main}
                  alt={imageTitle || "Property image"}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-[1.02]"
                  priority
                  sizes="(max-width: 1024px) 100vw, 720px"
                />
              ) : null}
              <span className="pointer-events-none absolute bottom-2 right-3 rounded-md bg-black/55 px-2 py-1 text-xs text-white">
                {safeIndex + 1} / {images.length}
              </span>
            </div>
            {images.length > 1 && (
              <div
                className="mt-3 flex gap-2 overflow-x-auto pb-1"
                role="tablist"
                aria-label="Property photos"
              >
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    type="button"
                    role="tab"
                    aria-selected={i === safeIndex}
                    className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                      i === safeIndex
                        ? "border-emerald-500 ring-2 ring-emerald-500/30"
                        : "border-zinc-200 opacity-90 hover:opacity-100 dark:border-zinc-600"
                    }`}
                    onClick={() => setActiveIndex(i)}
                    aria-label={`Photo ${i + 1} of ${images.length}`}
                  >
                    <Image src={img.url} alt="" fill className="object-cover" sizes="96px" />
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex aspect-[16/10] items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 text-zinc-500 dark:border-zinc-600 dark:bg-zinc-800/50">
            No photos
          </div>
        )}
      </div>
    </>
  );
}
