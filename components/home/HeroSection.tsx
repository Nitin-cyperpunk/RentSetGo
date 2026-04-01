import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14">
      <div className="pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-16 top-32 h-56 w-56 rounded-full bg-teal-400/15 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-96 -translate-x-1/2 rounded-full bg-cyan-300/10 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-5xl text-center">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-800 shadow-sm backdrop-blur-md dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-200">
          Nashik rentals
          <span className="h-1 w-1 rounded-full bg-emerald-500" aria-hidden />
          Direct from owners
        </p>
        <h1 className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-emerald-900 bg-clip-text text-4xl font-extrabold leading-tight tracking-tight text-transparent sm:text-5xl md:text-6xl dark:from-zinc-100 dark:via-zinc-200 dark:to-emerald-200">
          Find a home
          <br />
          <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 bg-clip-text text-transparent dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400">
            worth staying in
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-zinc-600 sm:text-lg dark:text-zinc-400">
          Browse curated listings, filter by budget and neighbourhood, then connect with owners in a few taps.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#browse"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:brightness-110 active:scale-[0.98]"
          >
            Explore listings
          </a>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-full border border-zinc-200/90 bg-white/80 px-7 py-3 text-sm font-semibold text-zinc-800 shadow-sm backdrop-blur-sm transition hover:bg-white dark:border-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            List your property
          </Link>
        </div>
      </div>
    </section>
  );
}
