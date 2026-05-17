"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { submitListing, updateListing } from "@/app/actions/properties";
import { AIDescriptionGenerator } from "@/components/ai/AIDescriptionGenerator";
import { PosterGenerator } from "@/components/ai/PosterGenerator";
import {
  parseDealType,
  parseListingCategory,
  priceLabel,
  propertyTypesForCategory,
  type DealType,
  type ListingCategory,
} from "@/lib/listing";
import { allImageUrls, type PropertyWithImages } from "@/types/property";

const FORM_ID = "property-listing-form";

type Props = {
  property?: PropertyWithImages;
  showNewListingBanner?: boolean;
};

export function PropertyForm({ property, showNewListingBanner }: Props) {
  const router = useRouter();
  const isEdit = Boolean(property);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [description, setDescription] = useState(property?.description ?? "");
  const [aiDescription, setAiDescription] = useState(property?.ai_description ?? "");
  const [dealType, setDealType] = useState<DealType>(
    parseDealType(property?.deal_type ?? "rent"),
  );
  const [category, setCategory] = useState<ListingCategory>(
    parseListingCategory(property?.category ?? "residential"),
  );
  const [imageCount, setImageCount] = useState(
    () => property?.property_images?.length ?? 0,
  );

  const typeOptions = useMemo(() => propertyTypesForCategory(category), [category]);
  const defaultType = property?.property_type ?? typeOptions[0];
  const defaultAmenities = property?.amenities ?? [];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("description", description);
    if (aiDescription) fd.set("ai_description", aiDescription);

    setPending(true);
    try {
      const result = isEdit
        ? await updateListing(property!.id, fd)
        : await submitListing(fd);

      if (result?.error) {
        setError(result.error);
        setPending(false);
        return;
      }
      if (result?.ok) {
        if (!isEdit && "propertyId" in result && result.propertyId) {
          router.push(`/owner/edit/${result.propertyId}?new=1`);
        } else {
          router.push("/owner/my-properties");
        }
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
      setPending(false);
    }
  }

  const expiresValue = property?.expires_at
    ? property.expires_at.slice(0, 10)
    : undefined;

  const existingUrlsJson = isEdit && property ? JSON.stringify(allImageUrls(property)) : "[]";
  const hasImages = imageCount > 0;

  const inputClass =
    "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 shadow-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-100";
  const labelClass = "text-sm font-medium text-zinc-700 dark:text-zinc-300";

  return (
    <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-6">
      {isEdit && <input type="hidden" name="existing_image_urls" value={existingUrlsJson} readOnly />}

      {showNewListingBanner ? (
        <p className="rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
          Listing published! Generate an AI marketing poster below, then share it on social media.
        </p>
      ) : null}

      {error && (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="deal_type" className={labelClass}>
            Listing for
          </label>
          <select
            id="deal_type"
            name="deal_type"
            value={dealType}
            onChange={(e) => setDealType(parseDealType(e.target.value))}
            className={inputClass}
          >
            <option value="rent">Rent</option>
            <option value="sale">Sale (buy)</option>
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="category" className={labelClass}>
            Category
          </label>
          <select
            id="category"
            name="category"
            value={category}
            onChange={(e) => setCategory(parseListingCategory(e.target.value))}
            className={inputClass}
          >
            <option value="residential">Residential (flats, PG)</option>
            <option value="commercial">Commercial (shop, office)</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="title" className={labelClass}>
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={property?.title}
          className={inputClass}
          placeholder={
            category === "commercial"
              ? "e.g. Ground-floor shop on main road"
              : "e.g. Bright 2BHK with balcony"
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="price" className={labelClass}>
            {priceLabel(dealType)}
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            step={1}
            required
            defaultValue={property?.price}
            className={inputClass}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="property_type" className={labelClass}>
            Property type
          </label>
          <select
            id="property_type"
            name="property_type"
            required
            defaultValue={defaultType}
            key={`${category}-${defaultType}`}
            className={inputClass}
          >
            {typeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="location" className={labelClass}>
          Location <span className="font-normal text-zinc-500 dark:text-zinc-400">(optional)</span>
        </label>
        <input
          id="location"
          name="location"
          defaultValue={property?.location ?? ""}
          className={inputClass}
          placeholder="e.g. Indra Nagar, Nashik"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="map_link" className={labelClass}>
          Google Maps link <span className="font-normal text-zinc-500 dark:text-zinc-400">(optional)</span>
        </label>
        <input
          id="map_link"
          name="map_link"
          type="url"
          inputMode="url"
          defaultValue={property?.map_link ?? ""}
          className={inputClass}
          placeholder="https://maps.google.com/…"
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Paste Google Maps share link</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="address" className={labelClass}>
          Address <span className="font-normal text-zinc-500 dark:text-zinc-400">(optional)</span>
        </label>
        <input
          id="address"
          name="address"
          defaultValue={property?.address ?? ""}
          className={inputClass}
          placeholder="Street, landmark…"
        />
      </div>

      {category === "residential" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="bedrooms" className={labelClass}>
              Bedrooms
            </label>
            <input
              id="bedrooms"
              name="bedrooms"
              type="number"
              min={0}
              step={1}
              defaultValue={property?.bedrooms ?? ""}
              className={inputClass}
              placeholder="—"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="bathrooms" className={labelClass}>
              Bathrooms
            </label>
            <input
              id="bathrooms"
              name="bathrooms"
              type="number"
              min={0}
              step={1}
              defaultValue={property?.bathrooms ?? ""}
              className={inputClass}
              placeholder="—"
            />
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="area_sqft" className={labelClass}>
          Area (sqft) <span className="font-normal text-zinc-500 dark:text-zinc-400">(optional)</span>
        </label>
        <input
          id="area_sqft"
          name="area_sqft"
          type="number"
          min={0}
          step={1}
          defaultValue={property?.area_sqft ?? ""}
          className={inputClass}
          placeholder="e.g. 1200"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="furnishing" className={labelClass}>
            Furnishing
          </label>
          <select
            id="furnishing"
            name="furnishing"
            defaultValue={property?.furnishing ?? ""}
            className={inputClass}
          >
            <option value="">— Select —</option>
            <option value="furnished">Furnished</option>
            <option value="semi-furnished">Semi-furnished</option>
            <option value="unfurnished">Unfurnished</option>
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="available_status" className={labelClass}>
            Status
          </label>
          <select
            id="available_status"
            name="available_status"
            defaultValue={property?.available_status ?? "available"}
            className={inputClass}
          >
            <option value="available">Available</option>
            <option value="occupied">Occupied / rented out</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="contact_phone" className={labelClass}>
          Contact phone <span className="font-normal text-zinc-500 dark:text-zinc-400">(optional)</span>
        </label>
        <input
          id="contact_phone"
          name="contact_phone"
          type="tel"
          defaultValue={property?.contact_phone ?? ""}
          className={inputClass}
          placeholder="+91 …"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="expires_at" className={labelClass}>
          Listing expires
        </label>
        <input
          id="expires_at"
          name="expires_at"
          type="date"
          required
          min={new Date().toISOString().slice(0, 10)}
          defaultValue={expiresValue}
          className={inputClass}
        />
      </div>

      <AIDescriptionGenerator
        formId={FORM_ID}
        description={description}
        onDescriptionChange={setDescription}
        onAiDescriptionChange={setAiDescription}
        defaultAmenities={defaultAmenities}
        defaultFloor={property?.floor ?? ""}
        defaultBalcony={property?.balcony ?? ""}
        defaultParking={property?.parking ?? ""}
      />

      <div className="space-y-2">
        <label htmlFor="images" className={labelClass}>
          {isEdit ? "Replace / add photos" : "Photos"}
        </label>
        <input
          id="images"
          name="images"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            const added = e.target.files?.length ?? 0;
            const base = property?.property_images?.length ?? 0;
            setImageCount(base + added);
          }}
          className="w-full text-sm text-zinc-600 file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-zinc-800 hover:file:bg-zinc-200 dark:text-zinc-400 dark:file:bg-zinc-800 dark:file:text-zinc-100 dark:hover:file:bg-zinc-700"
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {isEdit
            ? "Upload new images to add them. Saving rebuilds the gallery from kept URLs plus new uploads."
            : "Stored in Supabase Storage — required for AI poster generation after publish."}
        </p>
      </div>

      <PosterGenerator
        propertyId={property?.id}
        propertyTitle={property?.title ?? "Your listing"}
        initialPosterUrl={property?.generated_poster_url}
        hasImages={hasImages}
      />

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex flex-1 items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {pending ? "Saving…" : isEdit ? "Save changes" : "Publish listing"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-zinc-200 px-5 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
