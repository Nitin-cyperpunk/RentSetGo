"use client";

import { Loader2, Sparkles } from "lucide-react";

type Props = {
  onClick: () => void;
  disabled?: boolean;
  pending?: boolean;
  label: string;
  pendingLabel?: string;
  variant?: "primary" | "secondary";
};

export function GenerateButton({
  onClick,
  disabled,
  pending,
  label,
  pendingLabel = "Generating…",
  variant = "primary",
}: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-55";
  const styles =
    variant === "primary"
      ? "bg-gradient-to-r from-violet-600 to-emerald-600 text-white shadow-md shadow-violet-900/20 hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-900/25 active:scale-[0.98]"
      : "border border-zinc-200/80 bg-white/80 text-zinc-800 hover:bg-white dark:border-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-100";

  return (
    <button type="button" onClick={onClick} disabled={disabled || pending} className={`${base} ${styles}`}>
      {pending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : (
        <Sparkles className="size-4" aria-hidden />
      )}
      {pending ? pendingLabel : label}
    </button>
  );
}
