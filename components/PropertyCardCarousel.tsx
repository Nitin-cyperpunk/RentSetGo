"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

const AUTO_MS = 4500;

type Props = {
  urls: string[];
  propertyId: string;
  sizes: string;
  /** Tailwind aspect class, e.g. `aspect-[16/10]` for owner cards */
  aspectClass?: string;
  /** When false, image area opens login prompt instead of navigating (home listings). */
  isLoggedIn?: boolean;
  onRequireLogin?: () => void;
};

export function PropertyCardCarousel({
  urls,
  propertyId,
  sizes,
  aspectClass = "aspect-[4/3]",
  isLoggedIn = true,
  onRequireLogin,
}: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const n = urls.length;

  const go = useCallback(
    (delta: number) => {
      if (n <= 1) return;
      setIndex((i) => (i + delta + n) % n);
    },
    [n],
  );

  useEffect(() => {
    if (n <= 1 || paused) return;
    const prefersReduced =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % n);
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [n, paused]);

  const detailHref = `/property/${propertyId}`;

  const ImageNav = ({ className, children }: { className: string; children: ReactNode }) => {
    if (isLoggedIn) {
      return (
        <Link href={detailHref} className={className}>
          {children}
        </Link>
      );
    }
    return (
      <button
        type="button"
        className={className}
        onClick={() => onRequireLogin?.()}
      >
        {children}
      </button>
    );
  };

  if (n === 0) {
    return (
      <div className={`relative ${aspectClass} bg-zinc-100 dark:bg-zinc-800`}>
        <div className="flex h-full items-center justify-center text-sm text-zinc-400 dark:text-zinc-500">
          No photo
        </div>
      </div>
    );
  }

  if (n === 1) {
    return (
      <ImageNav className={`relative block ${aspectClass} bg-zinc-100 dark:bg-zinc-800`}>
        <Image src={urls[0]} alt="" fill className="object-cover" sizes={sizes} priority={false} />
      </ImageNav>
    );
  }

  return (
    <div
      className={`relative ${aspectClass} overflow-hidden bg-zinc-100 dark:bg-zinc-800`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (dx > 48) go(-1);
        else if (dx < -48) go(1);
      }}
    >
      {urls.map((url, i) => (
        <div
          key={`${url}-${i}`}
          className={
            i === index
              ? "absolute inset-0 z-[1] opacity-100 transition-opacity duration-300 pointer-events-auto"
              : "absolute inset-0 z-0 opacity-0 transition-opacity duration-300 pointer-events-none"
          }
          aria-hidden={i !== index}
        >
          <ImageNav className="block h-full w-full">
            <Image src={url} alt="" fill className="object-cover" sizes={sizes} />
          </ImageNav>
        </div>
      ))}

      <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-between px-1">
        <button
          type="button"
          aria-label="Previous photo"
          className="pointer-events-auto rounded-full bg-black/45 p-1.5 text-lg leading-none text-white shadow-sm backdrop-blur-sm transition hover:bg-black/60"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            go(-1);
          }}
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Next photo"
          className="pointer-events-auto rounded-full bg-black/45 p-1.5 text-lg leading-none text-white shadow-sm backdrop-blur-sm transition hover:bg-black/60"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            go(1);
          }}
        >
          ›
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-2 left-0 right-0 z-[2] flex justify-center gap-1.5">
        {urls.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Photo ${i + 1} of ${n}`}
            aria-current={i === index}
            className={
              i === index
                ? "pointer-events-auto h-1.5 w-5 rounded-full bg-white shadow"
                : "pointer-events-auto h-1.5 w-1.5 rounded-full bg-white/55 shadow hover:bg-white/80"
            }
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIndex(i);
            }}
          />
        ))}
      </div>
    </div>
  );
}
