"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import { ListingBadges } from "@/components/ListingBadges";
import { LoginToViewDetailsModal } from "@/components/LoginToViewDetailsModal";
import { PropertyCardCarousel } from "@/components/PropertyCardCarousel";
import { parseDealType, priceSuffix } from "@/lib/listing";
import type { PropertyWithImages } from "@/types/property";

type Props = {
  property: PropertyWithImages;
  imageUrls: string[];
  formattedRent: string;
  isLoggedIn: boolean;
};

const CARD_IMAGE_SIZES =
  "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

export function PropertyCardInteractive({
  property,
  imageUrls,
  formattedRent,
  isLoggedIn,
}: Props) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const detailPath = `/property/${property.id}`;
  const loginHref = `/login?next=${encodeURIComponent(detailPath)}`;

  const onRequireLogin = useCallback(() => setShowLoginModal(true), []);
  const deal = parseDealType(property.deal_type);
  const priceSfx = priceSuffix(deal);

  const titleLinkClass = "hover:underline dark:text-zinc-100";
  const viewDetailsClass =
    "mt-auto inline-flex w-fit items-center text-sm font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100";

  return (
    <>
      <article className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white/95 shadow-md shadow-zinc-900/5 ring-1 ring-zinc-900/[0.04] transition duration-300 hover:-translate-y-1 hover:border-emerald-200/80 hover:shadow-xl hover:shadow-emerald-900/10 dark:border-zinc-700/90 dark:bg-zinc-900/95 dark:ring-white/5 dark:hover:border-emerald-500/25">
        <PropertyCardCarousel
          urls={imageUrls}
          detailHref={detailPath}
          sizes={CARD_IMAGE_SIZES}
          isLoggedIn={isLoggedIn}
          onRequireLogin={onRequireLogin}
        />
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <h2 className="line-clamp-2 text-[15px] font-medium leading-snug text-zinc-900 dark:text-zinc-100">
              <Link href={detailPath} className={titleLinkClass}>
                {property.title}
              </Link>
            </h2>
            <p className="shrink-0 text-[15px] font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
              {formattedRent}
              {priceSfx ? (
                <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
                  {priceSfx}
                </span>
              ) : null}
            </p>
          </div>
          <ListingBadges
            dealType={property.deal_type}
            category={property.category}
            compact
          />
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-800/80 dark:text-emerald-400/90">
            {property.property_type}
          </p>
          {property.location ? (
            <p className="line-clamp-1 text-sm text-zinc-500 dark:text-zinc-400">
              {property.location}
            </p>
          ) : null}
          <Link href={detailPath} className={viewDetailsClass}>
            View details
          </Link>
        </div>
      </article>

      <LoginToViewDetailsModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        loginHref={loginHref}
      />
    </>
  );
}
