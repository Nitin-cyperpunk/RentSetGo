"use client";

import { useState } from "react";

import { SUPPORT_QR_PATH } from "@/lib/support";

type Props = {
  src?: string;
  alt?: string;
  size?: "md" | "sm";
};

const sizes = {
  md: "size-48 sm:size-56",
  sm: "size-40",
} as const;

function QrFrame({
  src,
  alt,
  sizeClass,
  className = "",
}: {
  src: string;
  alt: string;
  sizeClass: string;
  className?: string;
}) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-inner ${sizeClass} ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover object-center"
        loading="eager"
        decoding="async"
      />
    </div>
  );
}

function EnlargedModal({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
      style={{ cursor: "zoom-out" }}
      role="dialog"
      aria-modal="true"
      aria-label="Enlarged QR code"
    >
      <div
        className="relative w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <QrFrame src={src} alt={alt} sizeClass="aspect-square w-full" />
        <button
          type="button"
          className="absolute right-3 top-3 rounded-full bg-white/95 p-2 shadow-lg"
          aria-label="Close enlarged image"
          onClick={onClose}
        >
          <svg width={24} height={24} fill="none" stroke="currentColor" className="text-zinc-900">
            <line x1={6} y1={6} x2={18} y2={18} strokeWidth={2} />
            <line x1={18} y1={6} x2={6} y2={18} strokeWidth={2} />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function SupportQrImage({
  src = SUPPORT_QR_PATH,
  alt = "UPI QR code to support RentSetGo",
  size = "md",
}: Props) {
  const [enlarged, setEnlarged] = useState(false);
  const sizeClass = sizes[size];

  return (
    <>
      {enlarged ? (
        <EnlargedModal src={src} alt={alt} onClose={() => setEnlarged(false)} />
      ) : null}
      <button
        type="button"
        className="group relative cursor-zoom-in rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
        onClick={() => setEnlarged(true)}
        aria-label="Enlarge QR code"
      >
        <QrFrame src={src} alt={alt} sizeClass={sizeClass} />
        <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100">
          Enlarge
        </span>
      </button>
    </>
  );
}
