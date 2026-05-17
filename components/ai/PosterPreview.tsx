"use client";

import { Download, Maximize2, Share2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";

type Props = {
  posterUrl: string;
  title: string;
};

export function PosterPreview({ posterUrl, title }: Props) {
  const [fullscreen, setFullscreen] = useState(false);

  const download = useCallback(() => {
    const a = document.createElement("a");
    a.href = posterUrl;
    a.download = `${title.replace(/\s+/g, "-").slice(0, 40)}-rentsetgo-poster.png`;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.click();
  }, [posterUrl, title]);

  const share = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title} · RentSetGo`,
          text: "Check out this property on RentSetGo",
          url: posterUrl,
        });
        return;
      } catch {
        // user cancelled or failed
      }
    }
    await navigator.clipboard.writeText(posterUrl);
  }, [posterUrl, title]);

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-950/5 shadow-inner dark:border-zinc-700">
        <div className="relative aspect-[4/5] w-full max-w-sm mx-auto">
          <Image
            src={posterUrl}
            alt={`Marketing poster for ${title}`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 400px"
            unoptimized
          />
        </div>
        <div className="flex flex-wrap gap-2 border-t border-zinc-200/80 bg-white/50 p-3 backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/50">
          <button
            type="button"
            onClick={download}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
          >
            <Download className="size-3.5" aria-hidden />
            Download PNG
          </button>
          <button
            type="button"
            onClick={share}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <Share2 className="size-3.5" aria-hidden />
            Share
          </button>
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
            aria-label="Fullscreen preview"
          >
            <Maximize2 className="size-3.5" aria-hidden />
          </button>
        </div>
      </div>

      {fullscreen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Close fullscreen"
            onClick={() => setFullscreen(false)}
          />
          <div className="relative z-[1] max-h-[90vh] max-w-lg w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={posterUrl} alt="" className="max-h-[90vh] w-full rounded-lg object-contain" />
          </div>
        </div>
      ) : null}
    </>
  );
}
