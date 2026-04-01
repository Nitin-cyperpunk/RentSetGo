"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";

const cycle = ["light", "dark", "system"] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const advance = useCallback(() => {
    const current = (theme ?? "system") as (typeof cycle)[number];
    const i = cycle.indexOf(current);
    const idx = i === -1 ? 0 : i;
    setTheme(cycle[(idx + 1) % cycle.length]);
  }, [setTheme, theme]);

  if (!mounted) {
    return (
      <div
        className="fixed right-4 top-4 z-[60] h-11 w-11 rounded-full border border-zinc-200/80 bg-white/60 backdrop-blur-md dark:border-zinc-700 dark:bg-zinc-900/60"
        aria-hidden
      />
    );
  }

  const t = (theme ?? "system") as (typeof cycle)[number];
  const Icon = t === "light" ? Sun : t === "dark" ? Moon : Monitor;
  const label =
    t === "light" ? "Theme: light. Click for dark." : t === "dark" ? "Theme: dark. Click for system." : "Theme: system. Click for light.";

  return (
    <button
      type="button"
      onClick={advance}
      className="fixed right-4 top-4 z-[60] flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200/80 bg-white/70 text-zinc-700 shadow-lg shadow-zinc-900/5 backdrop-blur-xl transition hover:bg-white hover:text-emerald-800 dark:border-zinc-600 dark:bg-zinc-900/75 dark:text-zinc-200 dark:shadow-black/40 dark:hover:bg-zinc-800 dark:hover:text-emerald-300"
      aria-label={label}
      title={label}
    >
      <Icon className="size-[1.15rem] shrink-0" strokeWidth={2.25} aria-hidden />
    </button>
  );
}
