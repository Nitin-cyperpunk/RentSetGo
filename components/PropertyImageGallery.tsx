"use client";

import Image from "next/image";
import { useState } from "react";

function EnlargedModal({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
      style={{ cursor: "zoom-out" }}
    >
      <div className="relative mx-4 my-8 w-full max-w-3xl">
        <Image
          src={src}
          alt=""
          width={1200}
          height={800}
          className="max-h-[80vh] w-full rounded-xl bg-zinc-100 object-contain shadow-2xl dark:bg-zinc-900"
          style={{ margin: "0 auto" }}
        />
        <button
          type="button"
          className="absolute right-3 top-3 rounded-full bg-white/80 p-2 shadow hover:bg-white dark:bg-zinc-800/90 dark:hover:bg-zinc-700"
          aria-label="Close enlarged image"
          onClick={onClose}
        >
          <svg width={28} height={28} fill="none" stroke="black">
            <line x1={7} y1={7} x2={21} y2={21} strokeWidth={2} />
            <line x1={21} y1={7} x2={7} y2={21} strokeWidth={2} />
          </svg>
        </button>
      </div>
    </div>
  );
}

type Props = {
  images: string[];
  imageTitle: string;
};

export function PropertyImageGallery({ images, imageTitle }: Props) {
  const [enlarged, setEnlarged] = useState<string | null>(null);

  return (
    <>
      {enlarged && <EnlargedModal src={enlarged} onClose={() => setEnlarged(null)} />}
      <div>
        {images.length > 0 ? (
          <>
            <div
              className="group relative aspect-[16/10] cursor-zoom-in overflow-hidden rounded-xl shadow ring-1 ring-zinc-100 dark:ring-zinc-700"
              onClick={() => setEnlarged(images[0])}
              onKeyDown={(e) => {
                if (e.key === "Enter") setEnlarged(images[0]);
              }}
              tabIndex={0}
              role="button"
              aria-label="Enlarge main photo"
            >
              <Image
                src={images[0]}
                alt={imageTitle || "Property image"}
                fill
                className="object-cover transition group-hover:scale-105"
                priority
                sizes="(max-width: 1024px) 100vw, 720px"
              />
              <span className="absolute bottom-2 right-3 hidden rounded-md bg-black/50 px-2 py-0.5 text-xs text-white opacity-75 group-hover:block">
                Click to enlarge
              </span>
            </div>
            {images.length > 1 && (
              <div className="mt-2 flex gap-2">
                {images.slice(1, 6).map((src, i) => (
                  <div
                    key={`${src}-${i}`}
                    className="relative h-[68px] min-w-0 max-w-[120px] flex-1 cursor-zoom-in overflow-hidden rounded-md border border-zinc-200 bg-zinc-100 shadow-sm aspect-[4/3] dark:border-zinc-600 dark:bg-zinc-800"
                    onClick={() => setEnlarged(src)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setEnlarged(src);
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label="Enlarge thumbnail"
                  >
                    <Image src={src} alt="" fill className="object-cover" sizes="120px" />
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex aspect-[16/10] items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 text-base font-semibold text-zinc-400 shadow-inner dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-500">
            No photos
          </div>
        )}
      </div>
    </>
  );
}
