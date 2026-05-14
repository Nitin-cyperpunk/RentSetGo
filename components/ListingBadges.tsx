import {
  categoryLabel,
  dealTypeLabel,
  parseDealType,
  parseListingCategory,
} from "@/lib/listing";

type Props = {
  dealType?: string | null;
  category?: string | null;
  compact?: boolean;
};

export function ListingBadges({ dealType: rawDeal, category: rawCat, compact }: Props) {
  const deal = parseDealType(rawDeal ?? undefined);
  const cat = parseListingCategory(rawCat ?? undefined);

  return (
    <div className={`flex flex-wrap gap-1.5 ${compact ? "" : "mt-1"}`}>
      <span
        className={
          deal === "sale"
            ? "rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900 dark:bg-amber-950/80 dark:text-amber-200"
            : "rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-900 dark:bg-sky-950/80 dark:text-sky-200"
        }
      >
        {dealTypeLabel(deal)}
      </span>
      {cat === "commercial" ? (
        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-900 dark:bg-violet-950/80 dark:text-violet-200">
          {categoryLabel(cat)}
        </span>
      ) : null}
    </div>
  );
}
