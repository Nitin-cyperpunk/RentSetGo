import { getSupabaseForReads } from "@/lib/supabase/server-reads";
import { resolvePropertyIdFromParam } from "@/lib/seo";
import type { PropertyWithImages } from "@/types/property";

const propertySelect = `
  *,
  property_images ( id, image_url )
`;

/** Strip characters that break PostgREST `or()` / `ilike` patterns (commas split OR clauses; %/_ are LIKE wildcards). */
function sanitizeIlikeTerm(raw: string): string {
  return raw
    .replace(/,/g, " ")
    .replace(/[%_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type ListActivePropertiesResult = {
  rows: PropertyWithImages[];
  error: string | null;
};

type ActiveFilters = {
  q?: string;
  maxPrice?: number;
  location?: string;
  dealType?: "rent" | "sale";
  category?: "residential" | "commercial";
};

function buildActivePropertiesQuery(
  supabase: Awaited<ReturnType<typeof getSupabaseForReads>>,
  select: string,
  filters: ActiveFilters,
  nowIso: string,
) {
  let query = supabase
    .from("properties")
    .select(select)
    .gt("expires_at", nowIso)
    .order("created_at", { ascending: false });

  if (filters.maxPrice !== undefined && Number.isFinite(filters.maxPrice)) {
    query = query.lte("price", filters.maxPrice);
  }

  const loc = sanitizeIlikeTerm(filters.location ?? "");
  if (loc) {
    query = query.ilike("location", `%${loc}%`);
  }

  const search = sanitizeIlikeTerm(filters.q ?? "");
  if (search) {
    const pat = `%${search}%`;
    query = query.or(`title.ilike.${pat},location.ilike.${pat}`);
  }

  if (filters.dealType === "rent" || filters.dealType === "sale") {
    query = query.eq("deal_type", filters.dealType);
  }
  if (filters.category === "residential" || filters.category === "commercial") {
    query = query.eq("category", filters.category);
  }

  return query;
}

/** Active listings only, newest first. Retries without nested `property_images` if embed fails (RLS). */
export async function listActiveProperties(filters: ActiveFilters): Promise<ListActivePropertiesResult> {
  const supabase = await getSupabaseForReads();
  const nowIso = new Date().toISOString();

  const { data, error } = await buildActivePropertiesQuery(supabase, propertySelect, filters, nowIso);

  if (!error) {
    return { rows: (data ?? []) as unknown as PropertyWithImages[], error: null };
  }

  console.error("[listActiveProperties] select with property_images failed:", error);

  const { data: flat, error: flatErr } = await buildActivePropertiesQuery(supabase, "*", filters, nowIso);

  if (flatErr) {
    return {
      rows: [],
      error: `${error.message}${flatErr.message !== error.message ? ` (${flatErr.message})` : ""}`,
    };
  }

  const flatRows = (flat ?? []) as unknown as PropertyWithImages[];
  const rows = flatRows.map((row) => ({
    ...row,
    property_images: null,
  })) as PropertyWithImages[];

  return { rows, error: null };
}

export type ListMyPropertiesResult = {
  rows: PropertyWithImages[];
  /** Set when Supabase rejects the query (often RLS on read). */
  error: string | null;
};

/**
 * Lists rows from `properties` for `owner_id`. If the nested `property_images` select fails
 * (common when RLS allows `properties` but not `property_images`), retries with `*` only.
 */
export async function listMyProperties(ownerId: string): Promise<ListMyPropertiesResult> {
  const supabase = await getSupabaseForReads();
  const { data, error } = await supabase
    .from("properties")
    .select(propertySelect)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (!error) {
    return { rows: (data ?? []) as unknown as PropertyWithImages[], error: null };
  }

  console.error("[listMyProperties] select with property_images failed:", error);

  const { data: flat, error: flatErr } = await supabase
    .from("properties")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (flatErr) {
    return {
      rows: [],
      error: `${error.message}${flatErr.message !== flatErr.message ? ` (${flatErr.message})` : ""}`,
    };
  }

  const flatRows = (flat ?? []) as unknown as PropertyWithImages[];
  const rows = flatRows.map((row) => ({
    ...row,
    property_images: null,
  })) as PropertyWithImages[];

  return { rows, error: null };
}

export type SitemapPropertyEntry = Pick<
  PropertyWithImages,
  "id" | "title" | "location" | "property_type" | "created_at" | "updated_at"
>;

/** Active listings for sitemap generation. */
export async function listActivePropertiesForSitemap(): Promise<SitemapPropertyEntry[]> {
  const supabase = await getSupabaseForReads();
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("properties")
    .select("id, title, location, property_type, created_at, updated_at")
    .gt("expires_at", nowIso)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[listActivePropertiesForSitemap]", error);
    return [];
  }
  return (data ?? []) as SitemapPropertyEntry[];
}

/** Resolve a property by SEO slug or UUID (active listings only). */
export async function getActivePropertyByParam(
  param: string,
): Promise<PropertyWithImages | null> {
  const resolved = resolvePropertyIdFromParam(param);
  if (resolved.mode === "invalid") return null;

  const supabase = await getSupabaseForReads();
  const nowIso = new Date().toISOString();

  if (resolved.mode === "uuid") {
    const { data, error } = await supabase
      .from("properties")
      .select(propertySelect)
      .eq("id", resolved.value)
      .gt("expires_at", nowIso)
      .maybeSingle();
    if (error || !data) return null;
    return data as PropertyWithImages;
  }

  const { data, error } = await supabase
    .from("properties")
    .select(propertySelect)
    .gt("expires_at", nowIso);

  if (error || !data?.length) return null;

  const prefix = resolved.value;
  const match = (data as PropertyWithImages[]).find((row) =>
    row.id.replace(/-/g, "").toLowerCase().startsWith(prefix),
  );
  return match ?? null;
}
