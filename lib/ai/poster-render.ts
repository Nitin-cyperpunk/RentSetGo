import { composePropertyPoster } from "@/lib/ai/poster/compose";
import type { PosterCreativeBrief } from "@/lib/ai/poster/types";
import type { PosterRenderMeta, PosterTaglines } from "@/lib/ai/types";

export { composePropertyPoster };

/** @deprecated Use composePropertyPoster with a full creative brief. Kept for compatibility. */
export async function renderPropertyPoster(
  imageUrls: string[],
  taglines: PosterTaglines,
  meta?: PosterRenderMeta,
): Promise<Buffer> {
  const brief: PosterCreativeBrief = {
    ...taglines,
    styleId: "magazine_editorial",
    layoutId: "editorial_collage",
    cta: "CONTACT OWNER",
  };
  const result = await composePropertyPoster(imageUrls, brief, meta ?? {});
  return result.buffer;
}

export function fallbackPosterTaglines(
  title: string,
  location: string | null,
  priceLine: string,
  furnishing?: string | null,
): PosterTaglines {
  const furnishLabel = furnishing
    ? furnishing.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Semi Furnished";

  return {
    headline: location ?? title,
    tagline: "Comfort. Convenience. Perfect for Family.",
    bullets: [
      "Spacious Bedroom",
      "Parking Included",
      "Balcony with View",
      furnishLabel,
    ],
    locationLine: location ? `📍 ${location}` : "📍 Nashik",
    priceLine,
  };
}
