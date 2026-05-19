"use client";

import { motion } from "framer-motion";

type Props = {
  label: string;
  variant?: "gold" | "muted";
};

export function PlanBadge({ label, variant = "gold" }: Props) {
  return (
    <motion.span
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={
        variant === "gold"
          ? "inline-flex items-center rounded-full border border-amber-400/40 bg-gradient-to-r from-amber-500/20 to-amber-600/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-200 shadow-[0_0_24px_rgba(251,191,36,0.25)]"
          : "inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-zinc-400"
      }
    >
      {label}
    </motion.span>
  );
}
