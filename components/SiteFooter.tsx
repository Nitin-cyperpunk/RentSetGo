import Link from "next/link";
import { Building2, Heart, Home, KeyRound, LayoutDashboard, LogIn, Sparkles } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-auto w-full border-t border-zinc-200/70 bg-background/80 backdrop-blur-md dark:border-zinc-800/90 dark:bg-zinc-950/50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3 md:gap-12">
          <div className="md:max-w-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-900/15">
                <Sparkles className="size-4" strokeWidth={2.25} aria-hidden />
              </span>
              <span className="bg-gradient-to-br from-emerald-700 via-teal-700 to-zinc-800 bg-clip-text text-lg font-bold tracking-tight text-transparent dark:from-emerald-300 dark:via-teal-300 dark:to-zinc-100">
                RentSetGo
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Flats and rooms in Nashik—filter by area and budget, then reach owners directly.
            </p>
            <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Heart className="size-3.5 text-rose-500/80" aria-hidden />
              For renters and owners in Nashik
            </p>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-emerald-800 dark:text-emerald-400/90">
              Explore
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm">
              <li>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-foreground/80 transition hover:text-emerald-700 dark:hover:text-emerald-400"
                >
                  <Home className="size-4 shrink-0 opacity-60" aria-hidden />
                  Browse listings
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-foreground/80 transition hover:text-emerald-700 dark:hover:text-emerald-400"
                >
                  <LogIn className="size-4 shrink-0 opacity-60" aria-hidden />
                  Log in
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 text-foreground/80 transition hover:text-emerald-700 dark:hover:text-emerald-400"
                >
                  <KeyRound className="size-4 shrink-0 opacity-60" aria-hidden />
                  Sign up
                </Link>
              </li>
            </ul>
          </div>

          <div className="sm:col-span-2 md:col-span-1">
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-emerald-800 dark:text-emerald-400/90">
              Owners
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm">
              <li>
                <Link
                  href="/owner/dashboard"
                  className="inline-flex items-center gap-2 text-foreground/80 transition hover:text-emerald-700 dark:hover:text-emerald-400"
                >
                  <LayoutDashboard className="size-4 shrink-0 opacity-60" aria-hidden />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/owner/add-property"
                  className="inline-flex items-center gap-2 text-foreground/80 transition hover:text-emerald-700 dark:hover:text-emerald-400"
                >
                  <Building2 className="size-4 shrink-0 opacity-60" aria-hidden />
                  Add a listing
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-stretch gap-4 border-t border-zinc-200/70 pt-8 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <p className="text-center text-xs text-muted-foreground sm:text-left">
            © {new Date().getFullYear()} RentSetGo · Nashik, India
          </p>
          <nav
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground sm:justify-end"
            aria-label="Footer"
          >
            <Link href="/forgot-password" className="transition hover:text-emerald-700 dark:hover:text-emerald-400">
              Forgot password
            </Link>
            <Link href="#browse" className="transition hover:text-emerald-700 dark:hover:text-emerald-400">
              Search
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
