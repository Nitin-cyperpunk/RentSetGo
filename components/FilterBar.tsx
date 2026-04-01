import Link from "next/link";

type Props = {
  defaultQ?: string;
  defaultMax?: string;
  defaultLocation?: string;
};

/** GET / — keeps filters in the URL without client JS. */
export function FilterBar({ defaultQ = "", defaultMax = "", defaultLocation = "" }: Props) {
  return (
    <form
      method="get"
      action="/"
      className="flex flex-col gap-4 rounded-2xl border border-white/60 bg-white/70 p-5 shadow-lg shadow-zinc-900/5 backdrop-blur-xl dark:border-zinc-700/80 dark:bg-zinc-900/70 sm:flex-row sm:flex-wrap sm:items-end"
    >
      <label className="flex min-w-[140px] flex-1 flex-col gap-1.5 text-sm">
        <span className="font-medium text-zinc-500 dark:text-zinc-400">Search</span>
        <input
          name="q"
          type="search"
          placeholder="Title or area"
          defaultValue={defaultQ}
          className="rounded-xl border border-zinc-200/90 bg-white/90 px-4 py-2.5 text-zinc-900 outline-none ring-emerald-500/0 transition focus:border-emerald-400/80 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-950/80 dark:text-zinc-100"
        />
      </label>
      <label className="flex w-full min-w-[120px] flex-col gap-1.5 text-sm sm:w-auto">
        <span className="font-medium text-zinc-500 dark:text-zinc-400">Max rent (₹/mo)</span>
        <input
          name="max"
          type="number"
          min={0}
          step={1}
          placeholder="Any"
          defaultValue={defaultMax}
          className="rounded-xl border border-zinc-200/90 bg-white/90 px-4 py-2.5 text-zinc-900 outline-none ring-emerald-500/0 transition focus:border-emerald-400/80 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-950/80 dark:text-zinc-100"
        />
      </label>
      <label className="flex min-w-[140px] flex-1 flex-col gap-1.5 text-sm">
        <span className="font-medium text-zinc-500 dark:text-zinc-400">Location</span>
        <input
          name="loc"
          type="text"
          placeholder="Neighborhood, city"
          defaultValue={defaultLocation}
          className="rounded-xl border border-zinc-200/90 bg-white/90 px-4 py-2.5 text-zinc-900 outline-none ring-emerald-500/0 transition focus:border-emerald-400/80 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-950/80 dark:text-zinc-100"
        />
      </label>
      <div className="flex w-full gap-2 sm:w-auto sm:min-w-0">
        <button
          type="submit"
          className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition hover:brightness-110 active:scale-[0.98] sm:flex-initial"
        >
          Apply
        </button>
        <Link
          href="/"
          className="inline-flex flex-1 items-center justify-center rounded-xl border border-zinc-200/90 bg-white/80 px-5 py-2.5 text-sm font-medium text-zinc-700 backdrop-blur-sm transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:bg-zinc-800 sm:flex-initial"
        >
          Reset
        </Link>
      </div>
    </form>
  );
}
