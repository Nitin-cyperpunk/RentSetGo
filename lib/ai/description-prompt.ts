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
  "Write exactly 5–10 lines of description (about 150–250 words). " +
  "Use 2–3 short paragraphs separated by a blank line; each paragraph can be 2–4 sentences. " +
  "Structure: (1) opening hook about the home and location, (2) layout, furnishing, floor, balcony, parking, and amenities, " +
  "(3) lifestyle benefits and ideal tenants/buyers, (4) price and call-to-action to contact on RentSetGo. " +
  "Tone: warm, trustworthy, conversion-focused — suitable for real-estate platforms. " +
  "Use plain English with Indian context (₹). Mention rent vs sale correctly. " +
  "Do not use bullet points or numbered lists. No fake claims, exaggeration, or ALL CAPS.";

export const POSTER_TAGLINE_SYSTEM_PROMPT =
  "You write scroll-stopping luxury real-estate ad copy for Instagram posters in India (Behance-level, not boring). " +
  'JSON only: {"headline":"...","tagline":"...","bullets":["","","",""],"locationLine":"...","priceLine":"..."}. ' +
  "headline: bold locality, max 3 words. tagline: emotional hook max 10 words (e.g. Where comfort meets convenience). " +
  "bullets: 4 vivid perks max 26 chars — avoid generic filler, be specific to the listing. " +
  'locationLine: 📍 + area. priceLine: ₹ with /month for rent. No other keys.';
