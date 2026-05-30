"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { ListingBadges } from "@/components/ListingBadges";
import { LoginToViewDetailsModal } from "@/components/LoginToViewDetailsModal";
import { parseDealType, priceSuffix } from "@/lib/listing";

type Props = {
  propertyId: string;
  title: string;
  propertyType: string;
  location: string | null;
  formattedPrice: string;
  dealType: string | null;
  category: string | null;
};

export function PropertyDetailLoginGate({
  propertyId,
  title,
  propertyType,
  location,
  formattedPrice,
  dealType,
  category,
}: Props) {
  const router = useRouter();
  const detailPath = `/property/${propertyId}`;
  const loginHref = `/login?next=${encodeURIComponent(detailPath)}`;
  const [modalOpen, setModalOpen] = useState(true);

  const onClose = useCallback(() => {
    setModalOpen(false);
    router.push("/#browse");
  }, [router]);

  const priceSfx = priceSuffix(parseDealType(dealType));

  return (
    <>
      <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-white via-emerald-50/30 to-zinc-50 dark:from-zinc-950 dark:via-emerald-950/25 dark:to-zinc-900">
        <main className="mx-auto max-w-4xl px-4 py-12 sm:px-8">
          <nav className="mb-6 flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-1 font-medium text-emerald-700 transition hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              <span aria-hidden>←</span> All listings
            </Link>
          </nav>

          <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/95 shadow-xl dark:border-zinc-700/80 dark:bg-zinc-900/90">
            <div
              className="pointer-events-none select-none blur-md"
              aria-hidden
            >
              <div className="p-8 md:p-10">
                <div className="aspect-[16/10] rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                <div className="mt-6 flex flex-wrap gap-2">
                  <ListingBadges dealType={dealType} category={category} />
                  <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 text-sm font-semibold text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-100">
                    {propertyType}
                  </span>
                </div>
                <h1 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{title}</h1>
                {location ? (
                  <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">{location}</p>
                ) : null}
                <p className="mt-4 text-3xl font-bold text-emerald-800 dark:text-emerald-400">
                  {formattedPrice}
                  {priceSfx ? (
                    <span className="text-base font-medium text-zinc-500">{priceSfx}</span>
                  ) : null}
                </p>
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center bg-white/40 p-6 dark:bg-zinc-950/50">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700"
              >
                Sign in to unlock full details
              </button>
            </div>
          </div>
        </main>
      </div>

      <LoginToViewDetailsModal
        open={modalOpen}
        onClose={onClose}
        loginHref={loginHref}
        listingTitle={title}
        nextPath={detailPath}
      />
    </>
  );
}
