import type { ReactNode } from "react";

type Props = {
  icon: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function AISectionCard({ icon, title, subtitle, children }: Props) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/40 bg-white/60 p-5 shadow-lg shadow-emerald-900/5 backdrop-blur-xl dark:border-zinc-600/50 dark:bg-zinc-900/50 dark:shadow-black/30">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-emerald-400/20 to-violet-400/10 blur-2xl"
      />
      <header className="relative">
        <h3 className="flex items-center gap-2 text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          <span aria-hidden className="text-lg">
            {icon}
          </span>
          {title}
        </h3>
        {subtitle ? (
          <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{subtitle}</p>
        ) : null}
      </header>
      <div className="relative mt-4">{children}</div>
    </section>
  );
}
