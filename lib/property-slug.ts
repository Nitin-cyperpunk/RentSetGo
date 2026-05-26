import type { SupabaseClient } from "@supabase/supabase-js";

/** Kept for DB `slug` column (SEO/backfill); URLs use `/property/[id]` only. */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isPropertyUuid(param: string): boolean {
  return UUID_RE.test(param.trim());
}

export function slugifySegment(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export type PropertySlugInput = {
  title: string;
  location?: string | null;
  property_type: string;
};

export function buildSlugBase(input: PropertySlugInput): string {
  const parts = [input.property_type, input.title, input.location ?? ""].filter(Boolean);
  const base = slugifySegment(parts.join(" "));
  return base || "property";
}

export async function resolveUniquePropertySlug(
  db: SupabaseClient,
  input: PropertySlugInput,
  excludeId?: string,
): Promise<string> {
  const base = buildSlugBase(input);

  for (let n = 0; n < 50; n++) {
    const candidate = n === 0 ? base : `${base}-${n + 1}`;
    let query = db.from("properties").select("id").eq("slug", candidate);
    if (excludeId) {
      query = query.neq("id", excludeId);
    }
    const { data, error } = await query.maybeSingle();
    if (error) {
      console.error("[resolveUniquePropertySlug]", error);
      throw new Error("Could not generate listing URL.");
    }
    if (!data) return candidate;
  }

  return `${base}-${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`;
}
