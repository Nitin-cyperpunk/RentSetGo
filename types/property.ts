import type { Database } from "@/types/database.types";
import { resolveListingImageUrl } from "@/lib/supabase/public-image-url";

export type Property = Database["public"]["Tables"]["properties"]["Row"];
export type PropertyImageRow = Database["public"]["Tables"]["property_images"]["Row"];

/** Property row with nested images from Supabase select. */
export type PropertyWithImages = Property & {
  property_images: Pick<PropertyImageRow, "id" | "image_url">[] | null;
};

export type GalleryImage = {
  id: string;
  url: string;
};

/** Stable gallery order (DB may not have `created_at` on property_images). */
export function sortPropertyImages(
  images: Pick<PropertyImageRow, "id" | "image_url">[] | null | undefined
) {
  if (!images?.length) return [];
  return [...images].sort((a, b) => a.id.localeCompare(b.id));
}

/** One entry per uploaded image row — no merging or duplicating. */
export function galleryImages(p: PropertyWithImages): GalleryImage[] {
  const out: GalleryImage[] = [];
  for (const img of sortPropertyImages(p.property_images)) {
    const url = resolveListingImageUrl(img.image_url);
    if (url) out.push({ id: img.id, url });
  }
  return out;
}

export function coverImageUrl(p: PropertyWithImages): string | null {
  return galleryImages(p)[0]?.url ?? null;
}

/** URLs only (one per DB row). Used for posters, hidden form fields, etc. */
export function allImageUrls(p: PropertyWithImages): string[] {
  return galleryImages(p).map((g) => g.url);
}
