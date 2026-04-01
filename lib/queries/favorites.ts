import { getSupabaseForReads } from "@/lib/supabase/server-reads";
import type { PropertyWithImages } from "@/types/property";

const propertySelect = `
  *,
  property_images ( id, image_url )
`;

/** IDs the user has saved (for listing cards). */
export async function getFavoritePropertyIdsForUser(userId: string): Promise<Set<string>> {
  const supabase = await getSupabaseForReads();
  const { data, error } = await supabase
    .from("property_favorites")
    .select("property_id")
    .eq("user_id", userId);
  if (error) {
    console.error("[getFavoritePropertyIdsForUser]", error);
    return new Set();
  }
  return new Set((data ?? []).map((r) => r.property_id as string));
}

export type ListFavoritesResult = {
  rows: PropertyWithImages[];
  error: string | null;
};

/** Saved listings, newest save first. Includes expired listings (caller may badge them). */
export async function listFavoriteProperties(userId: string): Promise<ListFavoritesResult> {
  const supabase = await getSupabaseForReads();

  const { data: favRows, error: favErr } = await supabase
    .from("property_favorites")
    .select("property_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (favErr) {
    return { rows: [], error: favErr.message };
  }

  const orderedIds = (favRows ?? []).map((r) => r.property_id as string);
  if (orderedIds.length === 0) {
    return { rows: [], error: null };
  }

  const { data, error } = await supabase.from("properties").select(propertySelect).in("id", orderedIds);

  if (error) {
    console.error("[listFavoriteProperties]", error);
    const { data: flat, error: flatErr } = await supabase.from("properties").select("*").in("id", orderedIds);
    if (flatErr) {
      return { rows: [], error: error.message };
    }
    const flatRows = (flat ?? []) as unknown as PropertyWithImages[];
    const withNullImages = flatRows.map((row) => ({ ...row, property_images: null })) as PropertyWithImages[];
    const map = new Map(withNullImages.map((p) => [p.id, p]));
    const rows = orderedIds.map((id) => map.get(id)).filter((p): p is PropertyWithImages => p != null);
    return { rows, error: null };
  }

  const props = (data ?? []) as unknown as PropertyWithImages[];
  const map = new Map(props.map((p) => [p.id, p]));
  const rows = orderedIds.map((id) => map.get(id)).filter((p): p is PropertyWithImages => p != null);
  return { rows, error: null };
}
