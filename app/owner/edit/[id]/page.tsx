import Link from "next/link";
import { notFound } from "next/navigation";

import { getPropertyForOwner } from "@/app/actions/properties";
import { PropertyForm } from "@/components/PropertyForm";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const p = await getPropertyForOwner(id);
  if (!p) return { title: "Edit · RentSetGo" };
  return { title: `Edit · ${p.title}` };
}

export default async function EditPropertyPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { new: isNew } = await searchParams;
  const property = await getPropertyForOwner(id);
  if (!property) notFound();

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-emerald-50/40 via-zinc-50 to-zinc-100 dark:from-emerald-950/30 dark:via-zinc-950 dark:to-zinc-900">
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <Link
          href="/owner/my-properties"
          className="inline-flex items-center gap-1 text-sm font-medium text-emerald-800/80 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          <span aria-hidden>←</span> My properties
        </Link>

        <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-xl shadow-zinc-200/50 dark:border-zinc-700/80 dark:bg-zinc-900/90 dark:shadow-black/40">
          <div className="border-b border-zinc-100 bg-gradient-to-r from-zinc-800 to-zinc-900 px-6 py-8 text-white dark:border-zinc-700">
            <h1 className="text-2xl font-bold tracking-tight">Edit listing</h1>
            <p className="mt-2 text-sm text-zinc-300">Update details or add photos — changes sync to Supabase.</p>
          </div>
          <div className="p-6 sm:p-8">
            <PropertyForm property={property} showNewListingBanner={isNew === "1"} />
          </div>
        </div>
      </main>
    </div>
  );
}
