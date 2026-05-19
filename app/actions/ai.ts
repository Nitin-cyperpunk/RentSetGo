"use server";

import { revalidatePath } from "next/cache";

import {
  buildDescriptionUserMessage,
  DESCRIPTION_SYSTEM_PROMPT,
  formatInrPrice,
  POSTER_TAGLINE_SYSTEM_PROMPT,
} from "@/lib/ai/description-prompt";
import { chatCompletion, getGeminiConfig } from "@/lib/ai/gemini";
import { analyzePropertyImages } from "@/lib/ai/poster/analyze-images";
import { generateCreativeBrief, mergeCreativeBrief } from "@/lib/ai/poster/creative-brief";
import { composePropertyPoster } from "@/lib/ai/poster/compose";
import { LAYOUT_LABELS, STYLE_LABELS } from "@/lib/ai/poster/constants";
import { fallbackPosterTaglines } from "@/lib/ai/poster-render";
import {
  canGeneratePoster,
  getActivePlan,
  remainingPosters,
} from "@/lib/ai/subscription";
import type { PosterTaglines, PropertyDescriptionInput } from "@/lib/ai/types";
import { ensureProfileIfMissing } from "@/lib/auth/profile";
import { parseDealType, parseListingCategory } from "@/lib/listing";
import { createClient } from "@/lib/supabase/server";
import { getListingBucketId } from "@/lib/supabase/bucket";
import { allImageUrls, type PropertyWithImages } from "@/types/property";

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

  const amenitiesLine =
    input.amenities && input.amenities.length > 0
      ? ` Key highlights: ${input.amenities.slice(0, 6).join(", ")}.`
      : "";

  const price = formatInrPrice(input.price, input.deal_type);
  const areaPart = input.area_sqft ? `Spread across ${input.area_sqft} sqft, ` : "";
  const bathPart =
    input.bathrooms != null ? ` It includes ${input.bathrooms} bathroom${input.bathrooms === 1 ? "" : "s"}.` : "";

  return [
    `Discover a well-presented ${furnish}${bhk}${type} ${deal} in ${loc}${extras ? `, ${extras}` : ""}. ${areaPart}this home offers a comfortable layout suited for everyday living in Nashik.`,
    `The property is thoughtfully laid out with practical finishes and good natural light.${bathPart}${amenitiesLine}`,
    `Ideal for families and working professionals who value convenience, connectivity, and a peaceful neighbourhood. The space is ready for you to move in and make it your own.`,
    `Listed at ${price}${input.deal_type === "rent" ? " per month" : ""}. Contact the owner on RentSetGo to schedule a visit and explore this opportunity.`,
  ].join("\n\n");
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

  const { key } = getGeminiConfig();
  if (!key) {
    return { text: templateDescription(input), usedAi: false };
  }

  const result = await chatCompletion(
    DESCRIPTION_SYSTEM_PROMPT,
    buildDescriptionUserMessage(input),
    { maxTokens: 900, temperature: 0.7 },
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

  const { key } = getGeminiConfig();
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
  styleLabel?: string;
  layoutLabel?: string;
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
    .select(
      "poster_generation_count, subscription_status, subscription_plan, subscription_expiry",
    )
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
  const images = allImageUrls(typed);
  if (!images.length) {
    return { error: "Upload at least one property photo first.", code: "NO_IMAGE" };
  }

  const dealType = parseDealType(typed.deal_type);
  const priceLine = formatInrPrice(typed.price, dealType);
  const location = typed.location || typed.address || "Nashik";

  const descriptionInput: PropertyDescriptionInput = {
    title: typed.title,
    property_type: typed.property_type,
    deal_type: dealType,
    category: parseListingCategory(typed.category),
    price: typed.price,
    location: typed.location ?? undefined,
    address: typed.address ?? undefined,
    bedrooms: typed.bedrooms,
    bathrooms: typed.bathrooms,
    area_sqft: typed.area_sqft,
    furnishing: typed.furnishing ?? undefined,
    floor: typed.floor ?? undefined,
    balcony: typed.balcony ?? undefined,
    parking: typed.parking ?? undefined,
    amenities: typed.amenities ?? undefined,
  };

  let taglines: PosterTaglines;
  try {
    taglines = await generateTaglines(typed);
  } catch (e) {
    console.error("[generatePropertyPoster taglines]", e);
    taglines = fallbackPosterTaglines(typed.title, location, priceLine, typed.furnishing);
  }

  let analysis;
  try {
    analysis = await analyzePropertyImages(images);
  } catch (e) {
    console.error("[generatePropertyPoster analyze]", e);
    analysis = await analyzePropertyImages([images[0]!]);
  }

  const lastStyle = typed.last_poster_style_id;
  const lastLayout = typed.last_poster_layout_id;

  let brief;
  try {
    brief = await generateCreativeBrief(
      descriptionInput,
      analysis,
      taglines,
      lastStyle,
      lastLayout,
    );
  } catch (e) {
    console.error("[generatePropertyPoster brief]", e);
    brief = mergeCreativeBrief(taglines, analysis, null, lastStyle, lastLayout);
  }

  const renderMeta = {
    dealType,
    propertyType: typed.property_type,
    title: typed.title,
    location: typed.location,
    priceDisplay: `₹${typed.price.toLocaleString("en-IN")}`,
    floor: typed.floor,
    furnishing: typed.furnishing,
    parking: typed.parking,
    balcony: typed.balcony,
    bedrooms: typed.bedrooms,
    contactPhone: typed.contact_phone,
  };

  let png: Buffer;
  let styleId = brief.styleId;
  let layoutId = brief.layoutId;
  try {
    const composed = await composePropertyPoster(images, brief, renderMeta);
    png = composed.buffer;
    styleId = composed.styleId;
    layoutId = composed.layoutId;
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

  const updatedAt = new Date().toISOString();
  const posterFields = {
    generated_poster_url: posterUrl,
    last_poster_style_id: styleId,
    last_poster_layout_id: layoutId,
    updated_at: updatedAt,
  };

  let { error: updateErr } = await supabase
    .from("properties")
    .update(posterFields)
    .eq("id", propertyId)
    .eq("owner_id", user.id);

  if (updateErr) {
    console.error("[poster property update]", updateErr.message, updateErr);
    const { error: fallbackErr } = await supabase
      .from("properties")
      .update({
        generated_poster_url: posterUrl,
        updated_at: updatedAt,
      })
      .eq("id", propertyId)
      .eq("owner_id", user.id);

    if (fallbackErr) {
      console.error("[poster property update fallback]", fallbackErr.message, fallbackErr);
      return {
        error: `Poster uploaded but could not link to listing: ${fallbackErr.message}`,
      };
    }
    console.warn(
      "[poster] Saved URL without style columns — run migration 20260518120000_poster_style_tracking.sql",
    );
  }

  const { error: countErr } = await supabase
    .from("profiles")
    .update({
      poster_generation_count: (profile.poster_generation_count ?? 0) + 1,
    })
    .eq("id", user.id);

  if (countErr) {
    console.error("[poster count increment]", countErr);
  }

  revalidatePath(`/owner/edit/${propertyId}`);
  revalidatePath("/owner/my-properties");

  const afterCount = (profile.poster_generation_count ?? 0) + 1;
  const updatedProfile = { ...profile, poster_generation_count: afterCount };
  const left = remainingPosters(updatedProfile);
  const remaining = left === Infinity ? undefined : left;

  return {
    url: posterUrl,
    remaining,
    styleLabel: STYLE_LABELS[styleId],
    layoutLabel: LAYOUT_LABELS[layoutId],
  };
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
    .select(
      "poster_generation_count, subscription_status, subscription_plan, subscription_expiry",
    )
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { remaining: 0, isPro: false };
  }

  const plan = getActivePlan(profile);
  const left = remainingPosters(profile);

  return {
    remaining: left === Infinity ? 999 : left,
    isPro: plan !== "free",
  };
}
