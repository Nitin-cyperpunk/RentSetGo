import { getSupabaseForReads } from "@/lib/supabase/server-reads";
import { buildSlugBase, isPropertyUuid } from "@/lib/property-slug";
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

export type SitemapPropertySlug = {
  slug: string;
  updated_at: string;
};

export async function listActivePropertySlugsForSitemap(): Promise<SitemapPropertySlug[]> {
  const supabase = await getSupabaseForReads();
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("properties")
    .select("slug, updated_at")
    .gt("expires_at", nowIso);

  if (error) {
    console.error("[listActivePropertySlugsForSitemap]", error);
    return [];
  }
  return (data ?? []) as SitemapPropertySlug[];
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

type FetchPropertyOptions = {
  activeOnly?: boolean;
};

function throwIfDbUnreachable(err: { message?: string } | null): void {
  const msg = err?.message?.toLowerCase() ?? "";
  if (
    msg.includes("fetch failed") ||
    msg.includes("enotfound") ||
    msg.includes("econnrefused") ||
    msg.includes("network") ||
    msg.includes("getaddrinfo")
  ) {
    throw new Error(
      "Cannot reach Supabase. Check your internet connection and NEXT_PUBLIC_SUPABASE_URL in .env.local.",
    );
  }
}

async function fetchPropertyRow(
  match: { column: "id" | "slug"; value: string },
  options?: FetchPropertyOptions,
): Promise<PropertyWithImages | null> {
  const supabase = await getSupabaseForReads();
  const value = match.value.trim();
  const nowIso = new Date().toISOString();

  let query = supabase.from("properties").select(propertySelect).eq(match.column, value);
  if (options?.activeOnly) {
    query = query.gt("expires_at", nowIso);
  }

  const { data, error } = await query.limit(1);
  const embedded = data?.[0];
  if (!error && embedded) {
    return embedded as PropertyWithImages;
  }

  if (error) {
    throwIfDbUnreachable(error);
    console.error(`[fetchPropertyRow] embed failed (${match.column}=${value}):`, error);
  }

  let flatQuery = supabase.from("properties").select("*").eq(match.column, value);
  if (options?.activeOnly) {
    flatQuery = flatQuery.gt("expires_at", nowIso);
  }

  const { data: flatRows, error: flatErr } = await flatQuery.limit(1);
  if (flatErr) {
    throwIfDbUnreachable(flatErr);
    console.error(`[fetchPropertyRow] flat failed (${match.column}=${value}):`, flatErr);
    return null;
  }

  const flat = flatRows?.[0];
  if (!flat) return null;

  return { ...flat, property_images: null } as PropertyWithImages;
}

async function findPropertyByDerivedSlug(
  param: string,
  options?: FetchPropertyOptions,
): Promise<PropertyWithImages | null> {
  const supabase = await getSupabaseForReads();
  const nowIso = new Date().toISOString();
  let query = supabase.from("properties").select(propertySelect);
  if (options?.activeOnly) {
    query = query.gt("expires_at", nowIso);
  }

  const { data, error } = await query;
  if (error) {
    throwIfDbUnreachable(error);
    console.error("[findPropertyByDerivedSlug]", error);
    return null;
  }
  if (!data?.length) return null;

  const trimmed = param.trim().toLowerCase();
  return (
    (data as PropertyWithImages[]).find((row) => {
      const dbSlug = row.slug?.trim().toLowerCase();
      if (dbSlug === trimmed) return true;
      return (
        buildSlugBase({
          title: row.title,
          location: row.location,
          property_type: row.property_type,
        }) === trimmed
      );
    }) ?? null
  );
}

export async function getPropertyById(id: string): Promise<PropertyWithImages | null> {
  return fetchPropertyRow({ column: "id", value: id });
}

export async function getPropertyBySlug(
  slug: string,
  options?: FetchPropertyOptions,
): Promise<PropertyWithImages | null> {
  return fetchPropertyRow({ column: "slug", value: slug }, options);
}

function isExpired(property: { expires_at: string }): boolean {
  return property.expires_at <= new Date().toISOString();
}

function allowViewer(
  property: PropertyWithImages,
  viewerId: string | null | undefined,
): PropertyWithImages | null {
  if (isExpired(property) && property.owner_id !== viewerId) return null;
  return property;
}

/** Detail page: DB slug, derived slug, UUID, or legacy SEO URL with id suffix. */
export async function getPropertyDetailByParam(
  param: string,
  options?: { activeOnly?: boolean; viewerId?: string | null },
): Promise<PropertyWithImages | null> {
  const trimmed = param.trim();
  const activeOnly = options?.activeOnly ?? false;
  const viewerId = options?.viewerId ?? null;

  if (isPropertyUuid(trimmed)) {
    const row = await getPropertyById(trimmed);
    return row ? allowViewer(row, viewerId) : null;
  }

  let row = await getPropertyBySlug(trimmed, { activeOnly });
  if (row) return allowViewer(row, viewerId);

  row = await findPropertyByDerivedSlug(trimmed, { activeOnly });
  if (row) return allowViewer(row, viewerId);

  const resolved = resolvePropertyIdFromParam(trimmed);
  if (resolved.mode === "uuid") {
    row = await getPropertyById(resolved.value);
    return row ? allowViewer(row, viewerId) : null;
  }

  if (resolved.mode === "prefix") {
    const supabase = await getSupabaseForReads();
    const nowIso = new Date().toISOString();
    let query = supabase.from("properties").select(propertySelect);
    if (activeOnly) query = query.gt("expires_at", nowIso);

    const { data, error } = await query;
    if (error) {
      throwIfDbUnreachable(error);
      return null;
    }

    row =
      (data as PropertyWithImages[] | null)?.find((r) =>
        r.id.replace(/-/g, "").toLowerCase().startsWith(resolved.value),
      ) ?? null;
    return row ? allowViewer(row, viewerId) : null;
  }

  return null;
}

/** Active listings only (browse / metadata). */
export async function getActivePropertyByParam(
  param: string,
): Promise<PropertyWithImages | null> {
  return getPropertyDetailByParam(param, { activeOnly: true });
}
