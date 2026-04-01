import Link from "next/link";
import { redirect } from "next/navigation";

import { resolveOwnerId } from "@/lib/dev-owner";
import { createClient } from "@/lib/supabase/server";
import { listMyProperties } from "@/lib/queries/properties";

export const metadata = {
  title: "Owner dashboard · RentSetGo",
};

export const dynamic = "force-dynamic";

export default async function OwnerDashboardPage() {
  const supabase = await createClient();
  const ownerId = await resolveOwnerId(supabase);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!ownerId) {
    redirect("/login?next=%2Fowner%2Fdashboard");
  }

  const { rows: mine, error: listError } = await listMyProperties(ownerId);
  const active = mine.filter((p) => {
    const t = new Date(p.expires_at).getTime();
    return Number.isFinite(t) && t > Date.now();
  });

  const who = user?.email ?? user?.id ?? "Owner";

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-br from-emerald-50/50 via-zinc-50 to-sky-50/30 dark:from-emerald-950/30 dark:via-zinc-950 dark:to-zinc-900">
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <header className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700/80 dark:text-emerald-400/90">
            Owner hub
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Dashboard</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Signed in as <span className="font-medium text-zinc-800 dark:text-zinc-200">{who}</span>
          </p>
        </header>

        {listError && (
          <div
            className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-950 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100"
            role="alert"
          >
            <p className="font-medium">Could not load your listings from Supabase.</p>
            <p className="mt-2">{listError}</p>
            <p className="mt-2 text-red-900/90 dark:text-red-200/90">
              In Supabase, add <code className="rounded bg-red-100/80 px-1 dark:bg-red-900/80">SELECT</code> policies on{" "}
              <code className="rounded bg-red-100/80 px-1 dark:bg-red-900/80">properties</code> and{" "}
              <code className="rounded bg-red-100/80 px-1 dark:bg-red-900/80">property_images</code> so authenticated owners can read
              their own rows (for example <code className="rounded bg-red-100/80 px-1 dark:bg-red-900/80">owner_id = auth.uid()</code>
              ).
            </p>
          </div>
        )}

        {mine.length === 0 && !listError && (
          <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            <p className="font-medium">No listings for your account in the database yet.</p>
            <p className="mt-2">
              If you expect existing rows, ensure <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/60">properties.owner_id</code>{" "}
              matches your user id in Supabase Auth.
            </p>
          </div>
        )}

        <div className="mb-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/60 bg-white/90 p-6 shadow-lg shadow-zinc-200/50 backdrop-blur-sm dark:border-zinc-700/80 dark:bg-zinc-900/80 dark:shadow-black/30">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Active listings</p>
            <p className="mt-2 text-4xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">{active.length}</p>
          </div>
          <div className="rounded-2xl border border-white/60 bg-white/90 p-6 shadow-lg shadow-zinc-200/50 backdrop-blur-sm dark:border-zinc-700/80 dark:bg-zinc-900/80 dark:shadow-black/30">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total</p>
            <p className="mt-2 text-4xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">{mine.length}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/owner/add-property"
            className="group flex flex-col rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white shadow-lg shadow-emerald-900/10 transition hover:scale-[1.01] hover:shadow-xl"
          >
            <span className="text-sm font-semibold uppercase tracking-wide text-emerald-100">Create</span>
            <span className="mt-2 text-lg font-bold">Add a property</span>
            <span className="mt-1 text-sm text-emerald-100/90">New listing & photos</span>
            <span className="mt-4 text-sm font-medium text-white group-hover:underline">Open →</span>
          </Link>

          <Link
            href="/owner/my-properties"
            className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-md shadow-zinc-200/40 transition hover:border-zinc-300 hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-900/80 dark:hover:border-zinc-600 dark:shadow-black/30"
          >
            <span className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Manage</span>
            <span className="mt-2 text-lg font-bold text-zinc-900 dark:text-zinc-50">My properties</span>
            <span className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Edit & delete listings</span>
            <span className="mt-4 text-sm font-medium text-emerald-700 group-hover:underline dark:text-emerald-400">Open →</span>
          </Link>

          <Link
            href="/"
            className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-md shadow-zinc-200/40 transition hover:border-zinc-300 hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-900/80 dark:hover:border-zinc-600 dark:shadow-black/30"
          >
            <span className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Public</span>
            <span className="mt-2 text-lg font-bold text-zinc-900 dark:text-zinc-50">Browse feed</span>
            <span className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">See how renters view listings</span>
            <span className="mt-4 text-sm font-medium text-emerald-700 group-hover:underline dark:text-emerald-400">Open →</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
