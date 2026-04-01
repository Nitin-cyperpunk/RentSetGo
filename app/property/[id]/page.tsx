import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getPropertyById } from "@/app/actions/properties";
import { createClient } from "@/lib/supabase/server";
import { PropertyImageGallery } from "@/components/PropertyImageGallery";
import { allImageUrls } from "@/types/property";

type PageProps = {
  params: Promise<{ id: string }>;
};

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

function descriptionSnippet(
  description: string | null | undefined,
  fallback: string
): string {
  const raw = description?.trim() ?? "";
  if (!raw) return fallback;
  if (raw.length <= 150) return raw;
  return `${raw.slice(0, 150)}…`;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const property = await getPropertyById(id);
  if (!property) {
    return {
      title: "Listing not found",
    };
  }
  const title = property.location
    ? `${property.title} in ${property.location}`
    : property.title;
  return {
    title,
    description: descriptionSnippet(property.description, property.title),
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/property/${id}`)}`);
  }

  const property = await getPropertyById(id);
  if (!property) notFound();

  if (property.expires_at <= new Date().toISOString()) notFound();

  const images = allImageUrls(property);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-white via-emerald-50/30 to-zinc-50 dark:from-zinc-950 dark:via-emerald-950/25 dark:to-zinc-900">
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-8">
        <div className="mb-6 flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 transition hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            <span aria-hidden>←</span> All listings
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/95 shadow-xl shadow-zinc-200/50 dark:border-zinc-700/80 dark:bg-zinc-900/90 dark:shadow-black/40">
          <div className="lg:grid lg:grid-cols-[1.45fr_0.8fr] gap-x-10">
            <div className="p-6 md:p-10 pb-6">
              <PropertyImageGallery images={images} imageTitle={property.title} />
              {/* Property Tags */}
              <div className="mt-5 flex flex-wrap gap-2 text-sm">
                <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 font-semibold text-emerald-900 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-100">
                  {property.property_type}
                </span>
                {property.furnishing && (
                  <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-zinc-800 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200">
                    {property.furnishing}
                  </span>
                )}
                {property.available_status && (
                  <span className="rounded-full border border-cyan-100 bg-cyan-50 px-2.5 py-0.5 text-cyan-800 dark:border-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-200">
                    {property.available_status}
                  </span>
                )}
              </div>
              {/* Title & Location */}
              <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-zinc-900 md:text-4xl dark:text-zinc-50">
                {property.title}
              </h1>
              {property.location && (
                <p className="mt-2 flex items-center gap-2 text-lg font-medium text-zinc-700 dark:text-zinc-300">
                  <svg
                    width={16}
                    height={16}
                    viewBox="0 0 24 24"
                    className="mr-1 inline text-emerald-600"
                    fill="currentColor"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
                  </svg>
                  {property.location}
                </p>
              )}
              {property.map_link && (
                <p className="mt-2">
                  <a
                    href={property.map_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-400"
                  >
                    View on Map
                  </a>
                </p>
              )}
              {property.address && (
                <p className="text-md mt-1 font-mono text-zinc-500 dark:text-zinc-400">
                  {property.address}
                </p>
              )}
              {/* Overview */}
              <div className="mt-4 flex gap-8 text-[16px] text-zinc-800 dark:text-zinc-200">
                {property.bedrooms != null && (
                  <span className="flex items-center gap-1">
                    <svg
                      width={20}
                      height={20}
                      fill="currentColor"
                      className="text-emerald-600"
                    >
                      <rect x="2" y="8" width="16" height="7" rx="2" />
                      <rect x="6" y="3" width="8" height="5" rx="1.8" />
                    </svg>
                    {property.bedrooms} bed
                  </span>
                )}
                {property.bathrooms != null && (
                  <span className="flex items-center gap-1">
                    <svg
                      width={18}
                      height={18}
                      fill="currentColor"
                      className="text-emerald-600"
                    >
                      <ellipse cx="9" cy="6" rx="6" ry="4" />
                      <rect x="5" y="6" width="8" height="7" rx="2" />
                    </svg>
                    {property.bathrooms} bath
                  </span>
                )}
                {property.area_sqft != null && (
                  <span className="flex items-center gap-1">
                    <svg
                      width={18}
                      height={18}
                      fill="currentColor"
                      className="text-emerald-600"
                    >
                      <rect x="2" y="7" width="14" height="8" rx="2" />
                      <rect x="5" y="3" width="8" height="3" rx="1.5" />
                    </svg>
                    {property.area_sqft.toLocaleString()} sqft
                  </span>
                )}
              </div>
              {/* Description */}
              {property.description && (
                <div className="mt-8 whitespace-pre-line rounded border-l-4 border-emerald-100 bg-emerald-50/40 py-3 pl-5 text-[16px] leading-relaxed text-zinc-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-zinc-200">
                  {property.description}
                </div>
              )}
              {/* Amenities or Features if available */}
              {property.amenities &&
                Array.isArray(property.amenities) &&
                property.amenities.length > 0 && (
                  <div className="mt-8">
                    <h2 className="mb-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      Amenities
                    </h2>
                    <ul className="flex flex-wrap gap-2">
                      {property.amenities.map((am: string) => (
                        <li
                          key={am}
                          className="rounded border border-zinc-200 bg-zinc-100 px-2 py-1 text-sm text-zinc-700 shadow-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
                        >
                          {am}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
            {/* Aside Card */}
            <aside className="flex flex-col justify-between gap-6 border-l border-zinc-100 bg-gradient-to-br from-white via-emerald-50/60 to-zinc-50 p-8 dark:border-zinc-700 dark:from-zinc-900 dark:via-emerald-950/40 dark:to-zinc-950">
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold tabular-nums text-emerald-800 dark:text-emerald-400">
                    {formatRentInr(property.price)}
                  </span>
                  <span className="text-base font-medium text-zinc-600 dark:text-zinc-400">
                    /month
                  </span>
                </div>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    Listed until
                  </span>{" "}
                  {new Date(property.expires_at).toLocaleDateString()}
                </p>
                <div className="mt-5 border-t border-zinc-200 pt-5 dark:border-zinc-700">
                  <p className="text-md mb-2 font-semibold text-zinc-800 dark:text-zinc-100">
                    Contact Owner
                  </p>
                  {property.contact_phone ? (
                    <a
                      href={`tel:${property.contact_phone.replace(/\s/g, "")}`}
                      className="block text-lg font-bold text-emerald-700 underline dark:text-emerald-400"
                    >
                      {property.contact_phone}
                    </a>
                  ) : (
                    <p className="text-md text-zinc-500 dark:text-zinc-400">Phone not available</p>
                  )}
                  {property.contact_email && (
                    <a
                      href={`mailto:${property.contact_email}`}
                      className="mt-2 block text-base font-medium text-emerald-700 underline dark:text-emerald-400"
                    >
                      {property.contact_email}
                    </a>
                  )}
                </div>
              </div>
              {/* Property metadata */}
              <div className="mt-6">
                <h3 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Property ID
                </h3>
                <p className="rounded bg-zinc-100 px-3 py-1 font-mono text-xs tracking-wider text-zinc-500 select-all dark:bg-zinc-800 dark:text-zinc-400">
                  {property.id}
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
