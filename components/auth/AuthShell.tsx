import Link from "next/link";

type Props = {
  children: React.ReactNode;
};

export function AuthShell({ children }: Props) {
  return (
    <main className="relative flex min-h-dvh flex-1 flex-col items-center justify-center px-4 py-12 sm:py-16">
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -left-1/4 top-0 h-[420px] w-[420px] rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-600/15" />
        <div className="absolute -right-1/4 top-1/4 h-[380px] w-[380px] rounded-full bg-rose-300/25 blur-3xl dark:bg-rose-500/10" />
        <div className="absolute bottom-0 left-1/3 h-[320px] w-[320px] rounded-full bg-teal-300/20 blur-3xl dark:bg-teal-600/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent dark:from-zinc-900/30" />
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        <Link
          href="/"
          className="mb-8 flex flex-col items-center gap-1 text-center transition-opacity hover:opacity-90"
        >
          <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            RentSetGo
          </span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Rentals in Nashik, made simple
          </span>
        </Link>
        {children}
      </div>
    </main>
  );
}
