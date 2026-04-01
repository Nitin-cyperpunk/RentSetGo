import Link from "next/link";

export function CtaStrip() {
  return (
    <section className="px-4 pb-10 pt-8 sm:px-6 sm:pb-12 sm:pt-10">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-emerald-200/60 bg-gradient-to-br from-emerald-600/95 via-teal-700/95 to-zinc-800 p-8 shadow-xl shadow-emerald-900/20 sm:p-10 dark:border-emerald-500/20">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-teal-300/20 blur-3xl"
          aria-hidden
        />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Have a flat to rent out?
            </h2>
            <p className="mt-2 text-emerald-50/95">
              Create an owner account, publish your listing, and reach people who are actively looking in Nashik.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-emerald-800 shadow-lg transition hover:bg-emerald-50 active:scale-[0.98]"
            >
              Get started
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
