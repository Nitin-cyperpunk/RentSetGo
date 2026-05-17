export type PropertyDescriptionInput = {
  title: string;
  property_type: string;
  deal_type: "rent" | "sale";
  category: string;
  price: number | string;
  location?: string;
  address?: string;
  bedrooms?: number | string | null;
  bathrooms?: number | string | null;
  area_sqft?: number | string | null;
  furnishing?: string;
  floor?: string;
  balcony?: string;
  parking?: string;
  amenities?: string[];
  bullets?: string;
};

export type PosterTaglines = {
  headline: string;
  bullets: string[];
  locationLine: string;
  priceLine: string;
};
