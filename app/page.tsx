import type { Metadata } from "next";

import { PropertyCard } from "@/components/PropertyCard";
import { FilterBar } from "@/components/FilterBar";
import { CtaStrip } from "@/components/home/CtaStrip";
import { FeaturesGrid } from "@/components/home/FeaturesGrid";
import { HeroSection } from "@/components/home/HeroSection";
import { listActiveProperties } from "@/lib/queries/properties";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Flats for Rent in Nashik",
  description:
    "Browse latest rental properties in Nashik including 1BHK, 2BHK flats in Indra Nagar, Canada Corner and more.",
};

/** Search params + fresh Supabase reads on every request. */
export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ q?: string; max?: string; loc?: string }>;
};

export default async function HomePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = sp.q?.trim();
  const loc = sp.loc?.trim();
  const maxRaw = sp.max?.trim();
  const maxPrice = maxRaw ? Number(maxRaw) : undefined;

  const { rows: properties, error: listError } = await listActiveProperties({
    q: q || undefined,
    maxPrice: maxPrice !== undefined && Number.isFinite(maxPrice) ? maxPrice : undefined,
    location: loc || undefined,
  });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  return (
    <div className="flex flex-1 flex-col">
      <HeroSection />

      <section id="browse" className="scroll-mt-8 border-b border-zinc-200/80 px-4 pb-12 pt-2 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 text-center sm:text-left">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl dark:text-zinc-50">
              Browse listings
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
              Listings from individual owners. Filter by budget and area, then reach out directly.
            </p>
          </div>
          <FilterBar defaultQ={q} defaultMax={maxRaw} defaultLocation={loc} />
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        {properties.length > 0 && !listError ? (
          <h2 className="mb-6 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {q || loc || maxRaw ? "Matching listings" : "Latest listings"}
          </h2>
        ) : null}

        {listError && (
          <div
            className="mb-6 rounded-2xl border border-red-200/90 bg-red-50/90 p-5 text-sm text-red-950 shadow-sm backdrop-blur-sm dark:border-red-900 dark:bg-red-950/50 dark:text-red-100"
            role="alert"
          >
            <p className="font-medium">Could not load listings from Supabase.</p>
            <p className="mt-2">{listError}</p>
            <p className="mt-2 text-red-900/90 dark:text-red-200/90">
              Check Supabase URL and anon key in <code className="rounded bg-red-100/80 px-1 dark:bg-red-900/80">.env.local</code>, and add{" "}
              <code className="rounded bg-red-100/80 px-1 dark:bg-red-900/80">SELECT</code> policies on{" "}
              <code className="rounded bg-red-100/80 px-1 dark:bg-red-900/80">properties</code> and{" "}
              <code className="rounded bg-red-100/80 px-1 dark:bg-red-900/80">property_images</code> for public or{" "}
              <code className="rounded bg-red-100/80 px-1 dark:bg-red-900/80">anon</code> reads (for example active listings only).
            </p>
          </div>
        )}

        {properties.length === 0 && !listError ? (
          <div className="space-y-4 rounded-2xl border border-zinc-200/80 bg-white/60 p-6 text-sm text-zinc-600 shadow-sm backdrop-blur-sm dark:border-zinc-700/80 dark:bg-zinc-900/50">
            <p className="font-medium text-zinc-800 dark:text-zinc-200">No active listings match your filters.</p>
            <ul className="list-inside list-disc space-y-1 text-zinc-500 dark:text-zinc-400">
              <li>
                Browse only shows rows where <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">expires_at</code> is in the
                future.
              </li>
              <li>
                Clear filters with <span className="font-medium text-zinc-700 dark:text-zinc-300">Reset</span> or widen search.
              </li>
              <li>Commas in the search box are treated as spaces so filters stay valid.</li>
            </ul>
          </div>
        ) : properties.length > 0 ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((p) => (
              <li key={p.id}>
                <PropertyCard property={p} isLoggedIn={isLoggedIn} />
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <FeaturesGrid />
      <CtaStrip />
    </div>
  );
}
