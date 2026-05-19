"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Lock, Sparkles, X, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

const HIGHLIGHTS = [
  "100 HD AI posters / month",
  "No watermark · premium templates",
  "AI descriptions & social-ready exports",
  "Priority generation speed",
];

type Props = {
  open: boolean;
  onClose: () => void;
  upgradeHref?: string;
};

export function PricingModal({
  open,
  onClose,
  upgradeHref = "/owner/upgrade",
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="upgrade-modal-title"
        >
          <motion.button
            type="button"
            className="absolute inset-0 bg-black/65 backdrop-blur-md"
            aria-label="Close"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="relative z-[1] w-full max-w-lg overflow-hidden rounded-3xl border border-amber-400/25 bg-gradient-to-b from-zinc-900/95 via-zinc-950 to-black p-6 shadow-[0_0_80px_rgba(212,165,116,0.12)] sm:p-8"
          >
            <motion.div
              className="pointer-events-none absolute -right-6 -top-6 text-amber-400/30"
              animate={{ rotate: [0, 12, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 5, repeat: Infinity }}
              aria-hidden
            >
              <Sparkles className="size-32" />
            </motion.div>

            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-2 text-zinc-500 transition hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>

            <motion.div
              className="relative mx-auto flex size-16 items-center justify-center rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/20 to-amber-900/20"
              animate={{
                boxShadow: [
                  "0 0 0 rgba(251,191,36,0)",
                  "0 0 32px rgba(251,191,36,0.25)",
                  "0 0 0 rgba(251,191,36,0)",
                ],
              }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <Lock className="size-7 text-amber-300" />
              <motion.span
                className="absolute -right-1 -top-1"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className="size-4 fill-amber-400 text-amber-400" />
              </motion.span>
            </motion.div>

            <h2
              id="upgrade-modal-title"
              className="relative mt-5 text-center text-2xl font-bold tracking-tight text-[#faf7f2]"
            >
              You&apos;ve reached your free AI poster limit
            </h2>
            <p className="relative mt-2 text-center text-sm text-zinc-400">
              Unlock Pro to generate premium HD posters, remove watermarks, and
              automate your property marketing.
            </p>

            <ul className="relative mt-6 space-y-2.5">
              {HIGHLIGHTS.map((h, i) => (
                <motion.li
                  key={h}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  className="flex items-center gap-2.5 text-sm text-zinc-300"
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                    <Sparkles className="size-3" />
                  </span>
                  {h}
                </motion.li>
              ))}
            </ul>

            <div className="relative mt-8 flex flex-col gap-3 sm:flex-row">
              <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href={upgradeHref}
                  onClick={onClose}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#d4a574] via-[#c9956a] to-[#b8864a] px-4 py-3.5 text-sm font-semibold text-zinc-900 shadow-[0_8px_32px_rgba(212,165,116,0.35)] transition hover:brightness-110"
                >
                  Upgrade Now
                </Link>
              </motion.div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex flex-1 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-medium text-zinc-400 transition hover:bg-white/10 hover:text-zinc-200"
              >
                Maybe Later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
