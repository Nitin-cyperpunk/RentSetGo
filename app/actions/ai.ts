"use server";

import { revalidatePath } from "next/cache";

import {
  buildDescriptionUserMessage,
  DESCRIPTION_SYSTEM_PROMPT,
  formatInrPrice,
  POSTER_TAGLINE_SYSTEM_PROMPT,
} from "@/lib/ai/description-prompt";
import { chatCompletion, getOpenAiConfig } from "@/lib/ai/openai";
import { fallbackPosterTaglines, renderPropertyPoster } from "@/lib/ai/poster-render";
import { canGeneratePoster, isProSubscriber } from "@/lib/ai/subscription";
import type { PosterTaglines, PropertyDescriptionInput } from "@/lib/ai/types";
import { ensureProfileIfMissing } from "@/lib/auth/profile";
import { parseDealType, parseListingCategory } from "@/lib/listing";
import { createClient } from "@/lib/supabase/server";
import { getListingBucketId } from "@/lib/supabase/bucket";
import { coverImageUrl, type PropertyWithImages } from "@/types/property";

function parseDescriptionInput(formData: FormData): PropertyDescriptionInput {
  const amenities = formData
    .getAll("amenities")
    .map((a) => String(a).trim())
    .filter(Boolean);

  return {
    title: String(formData.get("title") ?? "").trim(),
    property_type: String(formData.get("property_type") ?? "").trim(),
    deal_type: parseDealType(String(formData.get("deal_type") ?? "rent")),
    category: parseListingCategory(String(formData.get("category") ?? "residential")),
    price: String(formData.get("price") ?? ""),
    location: String(formData.get("location") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    bedrooms: String(formData.get("bedrooms") ?? "").trim() || null,
    bathrooms: String(formData.get("bathrooms") ?? "").trim() || null,
    area_sqft: String(formData.get("area_sqft") ?? "").trim() || null,
    furnishing: String(formData.get("furnishing") ?? "").trim(),
    floor: String(formData.get("floor") ?? "").trim(),
    balcony: String(formData.get("balcony") ?? "").trim(),
    parking: String(formData.get("parking") ?? "").trim(),
    amenities,
    bullets: String(formData.get("bullets") ?? "").trim(),
  };
}

function templateDescription(input: PropertyDescriptionInput): string {
  const deal = input.deal_type === "sale" ? "for sale" : "for rent";
  const type = input.property_type || "property";
  const loc = input.location || "Nashik";
  const furnish = input.furnishing ? `${input.furnishing.replace(/-/g, " ")} ` : "";
  const bhk = input.bedrooms ? `${input.bedrooms} bedroom ` : "";
  const extras = [
    input.floor ? `on ${input.floor}` : null,
    input.balcony && input.balcony !== "no" ? "with balcony" : null,
    input.parking && input.parking !== "no" ? "dedicated parking" : null,
  ]
    .filter(Boolean)
    .join(", ");

  const amenityPart =
    input.amenities && input.amenities.length > 0
      ? ` Amenities include ${input.amenities.slice(0, 5).join(", ")}.`
      : "";

  const price = formatInrPrice(input.price, input.deal_type);
  return (
    `Beautiful ${furnish}${bhk}${type} ${deal} in ${loc}${extras ? `, ${extras}` : ""}. ` +
    `Priced at ${price} — ideal for families and professionals seeking comfort and convenience.${amenityPart} ` +
    `Contact the owner on RentSetGo to schedule a visit.`
  );
}

/**
 * Generate a premium listing description from property form fields.
 */
export async function generateListingDescription(formData: FormData): Promise<{
  text?: string;
  error?: string;
  usedAi?: boolean;
}> {
  const input = parseDescriptionInput(formData);

  if (!input.title && !input.bullets) {
    return { error: "Add a title or a few notes before generating." };
  }

  const { key } = getOpenAiConfig();
  if (!key) {
    return { text: templateDescription(input), usedAi: false };
  }

  const result = await chatCompletion(
    DESCRIPTION_SYSTEM_PROMPT,
    buildDescriptionUserMessage(input),
    { maxTokens: 350, temperature: 0.65 },
  );

  if (result.error || !result.text) {
    return { text: templateDescription(input), usedAi: false };
  }

  return { text: result.text, usedAi: true };
}

async function generateTaglines(
  property: PropertyWithImages,
): Promise<PosterTaglines> {
  const dealType = parseDealType(property.deal_type);
  const priceLine = formatInrPrice(property.price, dealType);
  const location = property.location || property.address || "Nashik";

  const input: PropertyDescriptionInput = {
    title: property.title,
    property_type: property.property_type,
    deal_type: dealType,
    category: parseListingCategory(property.category),
    price: property.price,
    location: property.location ?? undefined,
    address: property.address ?? undefined,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    area_sqft: property.area_sqft,
    furnishing: property.furnishing ?? undefined,
    floor: property.floor ?? undefined,
    balcony: property.balcony ?? undefined,
    parking: property.parking ?? undefined,
    amenities: property.amenities ?? undefined,
  };

  const { key } = getOpenAiConfig();
  if (!key) {
    return fallbackPosterTaglines(property.title, location, priceLine, property.furnishing);
  }

  const result = await chatCompletion(
    POSTER_TAGLINE_SYSTEM_PROMPT,
    buildDescriptionUserMessage(input),
    { maxTokens: 220, temperature: 0.75 },
  );

  if (!result.text) {
    return fallbackPosterTaglines(property.title, location, priceLine, property.furnishing);
  }

  try {
    const parsed = JSON.parse(result.text) as PosterTaglines;
    if (parsed.headline && parsed.bullets?.length && parsed.locationLine && parsed.priceLine) {
      return parsed;
    }
  } catch {
    // fall through
  }

  return fallbackPosterTaglines(property.title, location, priceLine, property.furnishing);
}

export type PosterGenerationResult = {
  url?: string;
  error?: string;
  code?: "UPGRADE" | "NO_IMAGE" | "UNAUTHORIZED";
  remaining?: number;
};

/**
 * Generate a marketing poster for an existing listing (owner only).
 */
export async function generatePropertyPoster(propertyId: string): Promise<PosterGenerationResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sign in to generate posters.", code: "UNAUTHORIZED" };
  }

  await ensureProfileIfMissing(supabase, user);

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("poster_generation_count, subscription_status, subscription_expiry")
    .eq("id", user.id)
    .single();

  if (profileErr || !profile) {
    return { error: "Could not load your profile." };
  }

  if (!canGeneratePoster(profile)) {
    return {
      error: "Free poster limit reached.",
      code: "UPGRADE",
      remaining: 0,
    };
  }

  const { data: property, error: propErr } = await supabase
    .from("properties")
    .select(
      `
      *,
      property_images ( id, image_url )
    `,
    )
    .eq("id", propertyId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (propErr || !property) {
    return { error: "Listing not found or you cannot edit it." };
  }

  const typed = property as PropertyWithImages;
  const cover = coverImageUrl(typed);
  if (!cover) {
    return { error: "Upload at least one property photo first.", code: "NO_IMAGE" };
  }

  let taglines: PosterTaglines;
  try {
    taglines = await generateTaglines(typed);
  } catch (e) {
    console.error("[generatePropertyPoster taglines]", e);
    const dealType = parseDealType(typed.deal_type);
    taglines = fallbackPosterTaglines(
      typed.title,
      typed.location,
      formatInrPrice(typed.price, dealType),
      typed.furnishing,
    );
  }

  let png: Buffer;
  try {
    png = await renderPropertyPoster(cover, taglines);
  } catch (e) {
    console.error("[generatePropertyPoster render]", e);
    return { error: "Could not create poster image. Try again." };
  }

  const bucket = getListingBucketId();
  const path = `${user.id}/posters/${propertyId}-${crypto.randomUUID()}.png`;

  const { error: uploadErr } = await supabase.storage.from(bucket).upload(path, png, {
    contentType: "image/png",
    cacheControl: "3600",
    upsert: true,
  });

  if (uploadErr) {
    console.error("[poster upload]", uploadErr);
    return { error: `Poster upload failed: ${uploadErr.message}` };
  }

  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
  const posterUrl = pub.publicUrl;

  const { error: updateErr } = await supabase
    .from("properties")
    .update({
      generated_poster_url: posterUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", propertyId)
    .eq("owner_id", user.id);

  if (updateErr) {
    console.error("[poster property update]", updateErr);
    return { error: "Poster saved but listing update failed." };
  }

  if (!isProSubscriber(profile)) {
    const { error: countErr } = await supabase
      .from("profiles")
      .update({
        poster_generation_count: (profile.poster_generation_count ?? 0) + 1,
      })
      .eq("id", user.id);

    if (countErr) {
      console.error("[poster count increment]", countErr);
    }
  }

  revalidatePath(`/owner/edit/${propertyId}`);
  revalidatePath("/owner/my-properties");

  const remaining = isProSubscriber(profile)
    ? undefined
    : Math.max(0, 2 - ((profile.poster_generation_count ?? 0) + 1));

  return { url: posterUrl, remaining };
}

export async function getPosterQuota(): Promise<{
  remaining: number;
  isPro: boolean;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { remaining: 0, isPro: false, error: "Sign in required." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("poster_generation_count, subscription_status, subscription_expiry")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { remaining: 0, isPro: false };
  }

  const pro = isProSubscriber(profile);
  if (pro) {
    return { remaining: 999, isPro: true };
  }

  return {
    remaining: Math.max(0, 2 - (profile.poster_generation_count ?? 0)),
    isPro: false,
  };
}
