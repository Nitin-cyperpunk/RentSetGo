"use client";

import Link from "next/link";
import { useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function UpgradeModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-[1] w-full max-w-md overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-b from-zinc-900 via-zinc-900 to-emerald-950 p-6 text-white shadow-2xl">
        <p className="text-2xl font-bold tracking-tight">✨ Unlock Unlimited AI Posters</p>
        <ul className="mt-4 space-y-2 text-sm text-zinc-300">
          <li>Unlimited generations</li>
          <li>HD export</li>
          <li>Premium templates</li>
          <li>No watermark</li>
        </ul>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/owner/dashboard"
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
          >
            Upgrade Now
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center rounded-xl border border-zinc-600 px-4 py-3 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
