"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import { parseDealType, parseListingCategory } from "@/lib/listing";
import { propertyPath } from "@/lib/seo";
import { ensureProfileIfMissing } from "@/lib/auth/profile";
import { resolveOwnerId } from "@/lib/dev-owner";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseForReads } from "@/lib/supabase/server-reads";
import { getListingBucketId } from "@/lib/supabase/bucket";
import type { PropertyWithImages } from "@/types/property";

const propertySelect = `
  *,
  property_images ( id, image_url )
`;

function safeFileName(name: string) {
  return name.replace(/[^\w.\-]+/g, "_");
}

async function getClientsForOwnerAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sign in to manage listings." as const };
  }

  await ensureProfileIfMissing(supabase, user);

  return { ownerId: user.id, db: supabase, storage: supabase };
}

async function revalidateListingPaths(propertyId: string) {
  revalidatePath("/");
  const row = await getPropertyById(propertyId);
  if (row) {
    revalidatePath(propertyPath(row));
  }
  revalidatePath(`/property/${propertyId}`);
}

function dbErrorMessage(err: { message: string; hint?: string | null; details?: string | null; code?: string }) {
  const parts = [err.message, err.hint, err.details].filter(Boolean);
  if (err.code?.startsWith("23503")) {
    if (err.message?.includes("properties_owner_id_fkey") && err.message?.includes("users")) {
      parts.push(
        "Your database still links owner_id to public.users — run the auth.users FK migration in Supabase SQL Editor (see supabase/migrations/20260513120000_properties_owner_auth_users.sql).",
      );
    } else {
      parts.push("Foreign key failed: ensure you are signed in and your account is valid.");
    }
  }
  if (err.code === "42501" || err.message?.toLowerCase().includes("row-level security")) {
    parts.push("RLS blocked this — sign in and ensure storage/database policies allow your role.");
  }
  return parts.join(" ");
}

async function uploadImages(
  storage: SupabaseClient,
  ownerId: string,
  files: FormDataEntryValue[]
): Promise<{ urls: string[]; error?: string }> {
  const bucket = getListingBucketId();
  const urls: string[] = [];
  for (const entry of files) {
    if (!(entry instanceof File) || entry.size === 0) continue;
    const path = `${ownerId}/${crypto.randomUUID()}-${safeFileName(entry.name)}`;
    // supabase.storage.from(bucket).upload(path, file) — bucket must match Dashboard
    const { error: upErr } = await storage.storage.from(bucket).upload(path, entry, {
      cacheControl: "3600",
      upsert: false,
      contentType: entry.type || "application/octet-stream",
    });
    if (upErr) {
      console.error("[storage upload]", bucket, path, upErr);
      const hint =
        upErr.message?.includes("Bucket not found") || upErr.message?.includes("not found")
          ? ` Create a public bucket named "${bucket}" in Supabase → Storage.`
          : "";
      return {
        urls: [],
        error: `Image upload failed: ${upErr.message}.${hint} Sign in and ensure Storage policies allow uploads for authenticated users.`,
      };
    }
    const { data: pub } = storage.storage.from(bucket).getPublicUrl(path);
    if (pub?.publicUrl) urls.push(pub.publicUrl);
  }
  return { urls };
}

function parseIntOptional(raw: string): number | null {
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}

function parseAmenities(formData: FormData): string[] {
  return formData
    .getAll("amenities")
    .map((a) => String(a).trim())
    .filter(Boolean);
}

function parseOptionalText(formData: FormData, key: string): string | null {
  const t = String(formData.get(key) ?? "").trim();
  return t || null;
}

/** Optional non-negative integer sqft; empty input → null. */
function parseAreaSqftField(raw: string): { area_sqft: number | null; error?: string } {
  const t = raw.trim();
  if (!t) return { area_sqft: null };
  const n = Number.parseInt(t, 10);
  if (!Number.isFinite(n) || n < 0) {
    return { area_sqft: null, error: "Area (sqft) must be a non-negative whole number." };
  }
  return { area_sqft: n };
}

/**
 * Empty → null. Non-empty must look like a Google Maps URL.
 * Allows maps.app.goo.gl share links in addition to google.com/maps and goo.gl/maps.
 */
function parseMapLinkField(raw: string): { map_link: string | null; error?: string } {
  const t = raw.trim();
  if (!t) return { map_link: null };
  let href = t;
  if (!/^https?:\/\//i.test(href)) {
    href = `https://${href}`;
  }
  try {
    new URL(href);
  } catch {
    return { map_link: null, error: "Enter a valid Google Maps link." };
  }
  const lower = href.toLowerCase();
  const allowed =
    lower.includes("google.com/maps") ||
    lower.includes("goo.gl/maps") ||
    lower.includes("maps.app.goo.gl");
  if (!allowed) {
    return {
      map_link: null,
      error: 'Paste a Google Maps share link (must include "google.com/maps" or "goo.gl/maps").',
    };
  }
  return { map_link: href };
}

export async function submitListing(formData: FormData) {
  const clients = await getClientsForOwnerAction();
  if ("error" in clients) {
    return { error: clients.error };
  }

  const { ownerId, db, storage } = clients;

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "");
  const location = String(formData.get("location") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const property_type = String(formData.get("property_type") ?? "").trim();
  const deal_type = parseDealType(String(formData.get("deal_type") ?? "rent"));
  const category = parseListingCategory(String(formData.get("category") ?? "residential"));
  const furnishing = String(formData.get("furnishing") ?? "").trim();
  const available_status = String(formData.get("available_status") ?? "available").trim();
  const contact_phone = String(formData.get("contact_phone") ?? "").trim();
  const priceRaw = Math.round(Number(formData.get("price")));
  const bedrooms = parseIntOptional(String(formData.get("bedrooms") ?? ""));
  const bathrooms = parseIntOptional(String(formData.get("bathrooms") ?? ""));
  const expires_at = String(formData.get("expires_at") ?? "");
  const areaParsed = parseAreaSqftField(String(formData.get("area_sqft") ?? ""));
  if (areaParsed.error) {
    return { error: areaParsed.error };
  }
  const mapParsed = parseMapLinkField(String(formData.get("map_link") ?? ""));
  if (mapParsed.error) {
    return { error: mapParsed.error };
  }
  const amenities = parseAmenities(formData);
  const floor = parseOptionalText(formData, "floor");
  const balcony = parseOptionalText(formData, "balcony");
  const parking = parseOptionalText(formData, "parking");
  const ai_description = parseOptionalText(formData, "ai_description");

  if (!title) {
    return { error: "Title is required." };
  }
  if (!property_type) {
    return { error: "Property type is required." };
  }
  if (!Number.isFinite(priceRaw) || priceRaw < 0) {
    return { error: deal_type === "sale" ? "Enter a valid sale price." : "Enter a valid monthly rent." };
  }
  if (!expires_at) {
    return { error: "Choose when the listing expires." };
  }

  const files = formData.getAll("images");
  const uploaded = await uploadImages(storage, ownerId, files);
  if (uploaded.error) {
    return { error: uploaded.error };
  }

  const { data: inserted, error: insertErr } = await db
    .from("properties")
    .insert({
      owner_id: ownerId,
      title,
      description: description.trim() || null,
      ai_description,
      price: priceRaw,
      property_type,
      deal_type,
      category,
      location: location || null,
      address: address || null,
      area_sqft: areaParsed.area_sqft,
      map_link: mapParsed.map_link,
      bedrooms,
      bathrooms,
      furnishing: furnishing || null,
      available_status: available_status || "available",
      contact_phone: contact_phone || null,
      amenities: amenities.length > 0 ? amenities : null,
      floor,
      balcony,
      parking,
      expires_at: new Date(expires_at).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (insertErr || !inserted?.id) {
    console.error("[properties insert]", insertErr);
    return {
      error: insertErr
        ? `Could not save listing: ${dbErrorMessage(insertErr)}`
        : "Could not save listing (no row returned).",
    };
  }

  const propertyId = inserted.id;

  if (uploaded.urls.length > 0) {
    const rows = uploaded.urls.map((image_url) => ({
      property_id: propertyId,
      image_url,
    }));
    const { error: imgErr } = await db.from("property_images").insert(rows);
    if (imgErr) {
      console.error(imgErr);
      return { error: `Property saved but images failed: ${dbErrorMessage(imgErr)}` };
    }
  }

  revalidatePath("/");
  revalidatePath("/owner/my-properties");
  revalidatePath("/owner/dashboard");
  return { ok: true as const, propertyId };
}

export async function updateListing(propertyId: string, formData: FormData) {
  const clients = await getClientsForOwnerAction();
  if ("error" in clients) {
    return { error: clients.error };
  }

  const { ownerId, db, storage } = clients;

  const existing = await db.from("properties").select("id, owner_id").eq("id", propertyId).maybeSingle();

  if (existing.error || !existing.data || existing.data.owner_id !== ownerId) {
    return { error: "Listing not found or you can’t edit it." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "");
  const location = String(formData.get("location") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const property_type = String(formData.get("property_type") ?? "").trim();
  const deal_type = parseDealType(String(formData.get("deal_type") ?? "rent"));
  const category = parseListingCategory(String(formData.get("category") ?? "residential"));
  const furnishing = String(formData.get("furnishing") ?? "").trim();
  const available_status = String(formData.get("available_status") ?? "available").trim();
  const contact_phone = String(formData.get("contact_phone") ?? "").trim();
  const priceRaw = Math.round(Number(formData.get("price")));
  const bedrooms = parseIntOptional(String(formData.get("bedrooms") ?? ""));
  const bathrooms = parseIntOptional(String(formData.get("bathrooms") ?? ""));
  const expires_at = String(formData.get("expires_at") ?? "");
  const areaParsed = parseAreaSqftField(String(formData.get("area_sqft") ?? ""));
  if (areaParsed.error) {
    return { error: areaParsed.error };
  }
  const mapParsed = parseMapLinkField(String(formData.get("map_link") ?? ""));
  if (mapParsed.error) {
    return { error: mapParsed.error };
  }
  const amenities = parseAmenities(formData);
  const floor = parseOptionalText(formData, "floor");
  const balcony = parseOptionalText(formData, "balcony");
  const parking = parseOptionalText(formData, "parking");
  const ai_description = parseOptionalText(formData, "ai_description");

  if (!title || !property_type) {
    return { error: "Title and property type are required." };
  }
  if (!Number.isFinite(priceRaw) || priceRaw < 0) {
    return { error: deal_type === "sale" ? "Enter a valid sale price." : "Enter a valid monthly rent." };
  }
  if (!expires_at) {
    return { error: "Choose when the listing expires." };
  }

  let keepUrls: string[] = [];
  const keepRaw = String(formData.get("existing_image_urls") ?? "[]");
  try {
    keepUrls = JSON.parse(keepRaw) as string[];
    if (!Array.isArray(keepUrls)) keepUrls = [];
  } catch {
    keepUrls = [];
  }

  const imageFiles = formData.getAll("images").filter(
    (f): f is File => f instanceof File && f.size > 0,
  );
  const uploaded = await uploadImages(storage, ownerId, imageFiles);
  if (uploaded.error) {
    return { error: uploaded.error };
  }

  /** New file picks replace the gallery — do not append to kept URLs (was causing 5+5=10). */
  const allUrls = imageFiles.length > 0 ? uploaded.urls : keepUrls;

  const { error: upErr } = await db
    .from("properties")
    .update({
      title,
      description: description.trim() || null,
      ai_description,
      price: priceRaw,
      property_type,
      deal_type,
      category,
      location: location || null,
      address: address || null,
      area_sqft: areaParsed.area_sqft,
      map_link: mapParsed.map_link,
      bedrooms,
      bathrooms,
      furnishing: furnishing || null,
      available_status: available_status || "available",
      contact_phone: contact_phone || null,
      amenities: amenities.length > 0 ? amenities : null,
      floor,
      balcony,
      parking,
      expires_at: new Date(expires_at).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", propertyId)
    .eq("owner_id", ownerId);

  if (upErr) {
    console.error(upErr);
    return { error: `Could not update listing: ${dbErrorMessage(upErr)}` };
  }

  await db.from("property_images").delete().eq("property_id", propertyId);

  if (allUrls.length > 0) {
    const rows = allUrls.map((image_url) => ({ property_id: propertyId, image_url }));
    const { error: imgErr } = await db.from("property_images").insert(rows);
    if (imgErr) {
      console.error(imgErr);
      return { error: `Listing updated but images failed: ${dbErrorMessage(imgErr)}` };
    }
  }

  revalidatePath("/");
  revalidatePath("/owner/my-properties");
  await revalidateListingPaths(propertyId);
  return { ok: true as const };
}

export async function deleteProperty(id: string) {
  const clients = await getClientsForOwnerAction();
  if ("error" in clients) {
    return { error: clients.error };
  }
  const { ownerId, db } = clients;

  const { error } = await db.from("properties").delete().eq("id", id).eq("owner_id", ownerId);

  if (error) {
    console.error(error);
    return { error: `Could not delete listing: ${dbErrorMessage(error)}` };
  }

  revalidatePath("/");
  revalidatePath("/owner/my-properties");
  return { ok: true };
}

export async function getPropertyById(id: string): Promise<PropertyWithImages | null> {
  const supabase = await getSupabaseForReads();
  const { data, error } = await supabase
    .from("properties")
    .select(propertySelect)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }
  return data as PropertyWithImages;
}

export async function getPropertyForOwner(id: string): Promise<PropertyWithImages | null> {
  const supabase = await createClient();
  const ownerId = await resolveOwnerId(supabase);
  if (!ownerId) return null;

  const row = await getPropertyById(id);
  if (!row || row.owner_id !== ownerId) return null;
  return row;
}

/** Extend listing expiry by 30 days (owner only). */
export async function extendListingExpiry(propertyId: string) {
  const clients = await getClientsForOwnerAction();
  if ("error" in clients) {
    return { error: clients.error };
  }
  const { ownerId, db } = clients;

  const { data: row, error: fetchErr } = await db
    .from("properties")
    .select("expires_at")
    .eq("id", propertyId)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (fetchErr || !row) {
    return { error: "Listing not found." };
  }

  const base = new Date(row.expires_at);
  const from = base.getTime() > Date.now() ? base : new Date();
  const next = new Date(from);
  next.setDate(next.getDate() + 30);

  const { error: upErr } = await db
    .from("properties")
    .update({
      expires_at: next.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", propertyId)
    .eq("owner_id", ownerId);

  if (upErr) {
    return { error: dbErrorMessage(upErr) };
  }

  revalidatePath("/");
  revalidatePath("/owner/my-properties");
  revalidatePath("/owner/dashboard");
  await revalidateListingPaths(propertyId);
  return { ok: true as const, expires_at: next.toISOString() };
}

/** Quick status toggle for owner inventory. */
export async function setListingAvailability(propertyId: string, status: "available" | "occupied") {
  const clients = await getClientsForOwnerAction();
  if ("error" in clients) {
    return { error: clients.error };
  }
  const { ownerId, db } = clients;

  const { error } = await db
    .from("properties")
    .update({
      available_status: status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", propertyId)
    .eq("owner_id", ownerId);

  if (error) {
    return { error: dbErrorMessage(error) };
  }

  revalidatePath("/");
  revalidatePath("/owner/my-properties");
  await revalidateListingPaths(propertyId);
  return { ok: true as const };
}
