import Link from "next/link";
import { redirect } from "next/navigation";

import { DeleteListingButton } from "@/components/DeleteListingButton";
import { PropertyCardCarousel } from "@/components/PropertyCardCarousel";
import { resolveOwnerId } from "@/lib/dev-owner";
import { createClient } from "@/lib/supabase/server";
import { listMyProperties } from "@/lib/queries/properties";
import { allImageUrls } from "@/types/property";

export const metadata = {
  title: "My properties · RentSetGo",
};

/** Always fetch latest rows from Supabase `properties` (no static cache). */
export const dynamic = "force-dynamic";

function formatRentInr(amount: number) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `₹${amount}`;
  }
}

export default async function MyPropertiesPage() {
  const supabase = await createClient();
  const ownerId = await resolveOwnerId(supabase);
  if (!ownerId) {
    redirect("/login?next=%2Fowner%2Fmy-properties");
  }

  const { rows, error: listError } = await listMyProperties(ownerId);
  const nowIso = new Date().toISOString();

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-zinc-100 to-zinc-50 dark:from-zinc-950 dark:to-zinc-900">
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/owner/dashboard"
              className="inline-flex items-center gap-1 text-sm font-medium text-emerald-800/80 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              <span aria-hidden>←</span> Dashboard
            </Link>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              My properties
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Edit details, add photos, or remove a listing.
            </p>
          </div>
          <Link
            href="/owner/add-property"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            + New listing
          </Link>
        </div>

        {listError && (
          <div
            className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-950 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100"
            role="alert"
          >
            <p className="font-medium">Could not load listings.</p>
            <p className="mt-2">{listError}</p>
            <p className="mt-2 text-red-900/90 dark:text-red-200/90">
              Add{" "}
              <code className="rounded bg-red-100/80 px-1 dark:bg-red-900/80">
                SELECT
              </code>{" "}
              policies on{" "}
              <code className="rounded bg-red-100/80 px-1 dark:bg-red-900/80">
                properties
              </code>{" "}
              and{" "}
              <code className="rounded bg-red-100/80 px-1 dark:bg-red-900/80">
                property_images
              </code>{" "}
              for your role, or fix RLS so owners can read rows where{" "}
              <code className="rounded bg-red-100/80 px-1 dark:bg-red-900/80">
                owner_id = auth.uid()
              </code>
              .
            </p>
          </div>
        )}

        {rows.length === 0 && !listError ? (
          <div className="mt-14 rounded-2xl border border-dashed border-zinc-300 bg-white/80 p-12 text-center dark:border-zinc-600 dark:bg-zinc-900/60">
            <p className="text-zinc-600 dark:text-zinc-300">
              No listings yet for your account.
            </p>
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
              If you already have rows in Supabase, ensure{" "}
              <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
                owner_id
              </code>{" "}
              matches your user id.
            </p>
            <Link
              href="/owner/add-property"
              className="mt-4 inline-block font-semibold text-emerald-700 underline hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              Create your first listing
            </Link>
          </div>
        ) : rows.length > 0 ? (
          <ul className="mt-10 grid gap-5 sm:grid-cols-2">
            {rows.map((p) => {
              const expired = p.expires_at <= nowIso;
              const urls = allImageUrls(p);
              return (
                <li
                  key={p.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-md shadow-zinc-200/50 transition hover:shadow-lg dark:border-zinc-700/80 dark:bg-zinc-900/90 dark:shadow-black/40"
                >
                  <div className="relative">
                    <PropertyCardCarousel
                      urls={urls}
                      detailHref={`/property/${p.id}`}
                      sizes="(max-width:640px) 100vw, 50vw"
                      aspectClass="aspect-[16/10]"
                    />
                    {expired && (
                      <span className="pointer-events-none absolute right-3 top-3 z-30 rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-semibold text-white shadow">
                        Expired
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800/90 dark:text-emerald-400/90">
                      {p.property_type}
                    </p>
                    <p className="line-clamp-2 font-semibold text-zinc-900 dark:text-zinc-50">
                      {p.title}
                    </p>
                    {p.location ? (
                      <p className="mt-1 line-clamp-1 text-sm text-zinc-500 dark:text-zinc-400">
                        {p.location}
                      </p>
                    ) : null}
                    <p className="mt-2 text-lg font-bold tabular-nums text-emerald-800 dark:text-emerald-400">
                      {formatRentInr(p.price)}
                      <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
                        /mo
                      </span>
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-700">
                      <Link
                        href={`/property/${p.id}`}
                        className="text-sm font-medium text-zinc-700 underline-offset-4 hover:text-zinc-900 hover:underline dark:text-zinc-300 dark:hover:text-white"
                      >
                        View
                      </Link>
                      <Link
                        href={`/owner/edit/${p.id}`}
                        className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
                      >
                        Edit
                      </Link>
                      <DeleteListingButton listingId={p.id} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}
      </main>
    </div>
  );
}
