import type { PropertyDescriptionInput } from "@/lib/ai/types";

export function formatInrPrice(price: number | string, dealType: "rent" | "sale"): string {
  const n = typeof price === "number" ? price : Number.parseInt(String(price), 10);
  if (!Number.isFinite(n)) return "—";
  const formatted = n.toLocaleString("en-IN");
  return dealType === "sale" ? `₹${formatted}` : `₹${formatted}/mo`;
}

export function buildDescriptionUserMessage(input: PropertyDescriptionInput): string {
  const dealPhrase = input.deal_type === "sale" ? "for sale" : "for rent";
  const lines = [
    `Title: ${input.title || "—"}`,
    `Deal: ${dealPhrase}`,
    `Category: ${input.category || "residential"}`,
    `Type: ${input.property_type || "—"}`,
    `Price: ${formatInrPrice(input.price, input.deal_type)}`,
    `Location: ${input.location || "—"}`,
    `Address: ${input.address || "—"}`,
    `Bedrooms: ${input.bedrooms ?? "—"}`,
    `Bathrooms: ${input.bathrooms ?? "—"}`,
    `Area (sqft): ${input.area_sqft ?? "—"}`,
    `Furnishing: ${input.furnishing || "—"}`,
    `Floor: ${input.floor || "—"}`,
    `Balcony: ${input.balcony || "—"}`,
    `Parking: ${input.parking || "—"}`,
    `Amenities: ${input.amenities?.length ? input.amenities.join(", ") : "—"}`,
  ];
  if (input.bullets?.trim()) {
    lines.push(`Owner notes:\n${input.bullets.trim()}`);
  }
  return lines.join("\n");
}

export const DESCRIPTION_SYSTEM_PROMPT =
  "You write premium, professional property listing descriptions for RentSetGo (Nashik, India). " +
  "Output a single paragraph of 2–4 sentences (about 80–120 words). " +
  "Tone: warm, trustworthy, conversion-focused — suitable for real-estate platforms. " +
  "Highlight furnishing, floor/view, balcony, parking, amenities, and ideal tenants/buyers when provided. " +
  "Use plain English with Indian context (₹). Mention rent vs sale correctly. " +
  "No fake claims, exaggeration, or ALL CAPS.";

export const POSTER_TAGLINE_SYSTEM_PROMPT =
  "You create short marketing lines for a luxury real-estate social poster in India. " +
  'Respond with ONLY valid JSON: {"headline":"...","bullets":["...","...","...","..."],"locationLine":"...","priceLine":"..."}. ' +
  "headline: max 6 words. bullets: exactly 4 lines, max 28 chars each, may use one emoji each. " +
  'locationLine: area/locality with 📍 prefix. priceLine: rent/sale price with ₹. No other keys.';
