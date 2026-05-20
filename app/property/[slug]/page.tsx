import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import { ListingBadges } from "@/components/ListingBadges";
import { JsonLd } from "@/components/seo/JsonLd";
import { PropertyImageGallery } from "@/components/PropertyImageGallery";
import { PropertyOwnerContact } from "@/components/PropertyOwnerContact";
import { parseDealType, priceSuffix } from "@/lib/listing";
import { getActivePropertyByParam } from "@/lib/queries/properties";
import {
  breadcrumbJsonLd,
  buildPropertyMetadata,
  propertyPath,
  propertySlug,
  realEstateListingJsonLd,
} from "@/lib/seo";
import { galleryImages } from "@/types/property";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getActivePropertyByParam(slug);
  if (!property) {
    return { title: "Listing not found", robots: { index: false, follow: false } };
  }
  return buildPropertyMetadata(property);
}

function formatPriceInr(amount: number) {
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

export default async function PropertyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const property = await getActivePropertyByParam(slug);
  if (!property) notFound();

  const canonicalSlug = propertySlug(property);
  if (slug !== canonicalSlug) {
    permanentRedirect(propertyPath(property));
  }

  const images = galleryImages(property);
  const dealType = parseDealType(property.deal_type);
  const priceSfx = priceSuffix(dealType);
  const salePriceLooksLikeRent =
    dealType === "sale" && property.price > 0 && property.price < 100_000;

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Listings", path: "/#browse" },
    { name: property.title, path: propertyPath(property) },
  ]);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-white via-emerald-50/30 to-zinc-50 dark:from-zinc-950 dark:via-emerald-950/25 dark:to-zinc-900">
      <JsonLd data={[breadcrumbs, realEstateListingJsonLd(property)]} />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-8">
        <nav className="mb-6 flex items-center gap-2 text-sm" aria-label="Breadcrumb">
          <Link
            href="/"
            className="inline-flex items-center gap-1 font-medium text-emerald-700 transition hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            <span aria-hidden>←</span> All listings
          </Link>
        </nav>
        <article className="rounded-2xl border border-zinc-200/80 bg-white/95 shadow-xl shadow-zinc-200/50 dark:border-zinc-700/80 dark:bg-zinc-900/90 dark:shadow-black/40">
          <div className="lg:grid lg:grid-cols-[1.45fr_0.85fr] lg:items-start">
            <div className="min-w-0 p-6 pb-10 md:p-10 md:pb-12">
              <PropertyImageGallery
                images={images}
                imageTitle={property.title}
                location={property.location}
              />
              <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
                <ListingBadges dealType={property.deal_type} category={property.category} />
                <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 font-semibold text-emerald-900 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-100">
                  {property.property_type}
                </span>
                {property.furnishing ? (
                  <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-zinc-800 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200">
                    {property.furnishing}
                  </span>
                ) : null}
                {property.available_status ? (
                  <span className="rounded-full border border-cyan-100 bg-cyan-50 px-2.5 py-0.5 text-cyan-800 dark:border-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-200">
                    {property.available_status}
                  </span>
                ) : null}
              </div>
              <h1 className="mt-6 break-words text-2xl font-extrabold leading-tight tracking-tight text-zinc-900 sm:text-3xl md:text-4xl dark:text-zinc-50">
                {property.title}
              </h1>
              {property.location ? (
                <p className="mt-2 flex items-center gap-2 text-lg font-medium text-zinc-700 dark:text-zinc-300">
                  <svg
                    width={16}
                    height={16}
                    viewBox="0 0 24 24"
                    className="mr-1 inline text-emerald-600"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
                  </svg>
                  {property.location}
                </p>
              ) : null}
              {property.map_link ? (
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
              ) : null}
              {property.address ? (
                <p className="text-md mt-1 font-mono text-zinc-500 dark:text-zinc-400">
                  {property.address}
                </p>
              ) : null}
              <div className="mt-4 flex gap-8 text-[16px] text-zinc-800 dark:text-zinc-200">
                {property.bedrooms != null ? (
                  <span className="flex items-center gap-1">
                    {property.bedrooms} bed
                  </span>
                ) : null}
                {property.bathrooms != null ? (
                  <span className="flex items-center gap-1">
                    {property.bathrooms} bath
                  </span>
                ) : null}
                {property.area_sqft != null ? (
                  <span className="flex items-center gap-1">
                    {property.area_sqft.toLocaleString()} sqft
                  </span>
                ) : null}
              </div>
              {property.description ? (
                <div className="mt-8 whitespace-pre-line rounded border-l-4 border-emerald-100 bg-emerald-50/40 py-3 pl-5 text-[16px] leading-relaxed text-zinc-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-zinc-200">
                  {property.description}
                </div>
              ) : null}
              {property.amenities &&
              Array.isArray(property.amenities) &&
              property.amenities.length > 0 ? (
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
              ) : null}
            </div>
            <aside className="flex flex-col gap-6 border-t border-zinc-200 bg-zinc-50/90 p-6 md:p-8 lg:sticky lg:top-6 lg:border-t-0 lg:border-l lg:self-start dark:border-zinc-700 dark:bg-zinc-900/50">
              <div>
                {salePriceLooksLikeRent ? (
                  <p
                    className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm leading-snug text-amber-950 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100"
                    role="status"
                  >
                    Marked <strong>For sale</strong>, but ₹
                    {property.price.toLocaleString("en-IN")} is typical for{" "}
                    <strong>monthly rent</strong>.
                  </p>
                ) : null}
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="text-3xl font-bold tabular-nums text-emerald-800 sm:text-4xl dark:text-emerald-400">
                    {formatPriceInr(property.price)}
                  </span>
                  {priceSfx ? (
                    <span className="text-base font-medium text-zinc-600 dark:text-zinc-400">
                      {priceSfx === "/mo" ? "/month" : priceSfx}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {dealType === "sale" ? "Sale price" : "Monthly rent"}
                </p>
                <PropertyOwnerContact
                  phone={property.contact_phone}
                  email={property.contact_email}
                  listingTitle={property.title}
                />
              </div>
            </aside>
          </div>
        </article>
      </main>
    </div>
  );
}
