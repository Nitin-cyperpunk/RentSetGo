import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PropertyCard } from "@/components/PropertyCard";
import { listFavoriteProperties } from "@/lib/queries/favorites";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Saved listings · RentSetGo",
};

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=%2Ffavorites");
  }

  const { rows, error } = await listFavoriteProperties(user.id);

  return (
    <div className="mx-auto max-w-5xl flex-1 px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Saved listings</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Properties you have liked. Tap the heart again on a card to remove.
        </p>
      </header>

      {error ? (
        <div
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-950 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100"
          role="alert"
        >
          Could not load favorites: {error}
        </div>
      ) : null}

      {rows.length === 0 && !error ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white/70 p-12 text-center dark:border-zinc-600 dark:bg-zinc-900/50">
          <p className="text-zinc-600 dark:text-zinc-300">No saved listings yet.</p>
          <Link
            href="/"
            className="mt-4 inline-block font-semibold text-emerald-700 underline hover:text-emerald-800 dark:text-emerald-400"
          >
            Browse listings
          </Link>
        </div>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((p) => (
            <li key={p.id}>
              <PropertyCard property={p} isLoggedIn />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
