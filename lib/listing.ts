export type DealType = "rent" | "sale";
export type ListingCategory = "residential" | "commercial";

export function parseDealType(raw: string | null | undefined): DealType {
  return raw === "sale" ? "sale" : "rent";
}

export function parseListingCategory(raw: string | null | undefined): ListingCategory {
  return raw === "commercial" ? "commercial" : "residential";
}

export function dealTypeLabel(deal: DealType): string {
  return deal === "sale" ? "For sale" : "For rent";
}

export function categoryLabel(cat: ListingCategory): string {
  return cat === "commercial" ? "Commercial" : "Residential";
}

export function priceLabel(deal: DealType): string {
  return deal === "sale" ? "Sale price (₹)" : "Monthly rent (₹)";
}

export function priceSuffix(deal: DealType): string {
  return deal === "sale" ? "" : "/mo";
}

export const RESIDENTIAL_TYPES = ["1BHK", "2BHK", "3BHK", "PG"] as const;
export const COMMERCIAL_TYPES = ["shop", "office", "warehouse", "showroom"] as const;

export function propertyTypesForCategory(cat: ListingCategory): readonly string[] {
  return cat === "commercial" ? COMMERCIAL_TYPES : RESIDENTIAL_TYPES;
}
