"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { submitListing, updateListing } from "@/app/actions/properties";
import { allImageUrls, type PropertyWithImages } from "@/types/property";

type Props = {
  property?: PropertyWithImages;
};

export function PropertyForm({ property }: Props) {
  const router = useRouter();
  const isEdit = Boolean(property);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);

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
        router.push("/owner/my-properties");
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isEdit && <input type="hidden" name="existing_image_urls" value={existingUrlsJson} readOnly />}

      {error && (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={property?.title}
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 shadow-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-100"
          placeholder="e.g. Bright 2BHK with balcony"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={property?.description ?? ""}
          className="w-full resize-y rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 shadow-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-100"
          placeholder="Details renters should know…"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="price" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Monthly rent (₹)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            step={1}
            required
            defaultValue={property?.price}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 shadow-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-100"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="property_type" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Property type
          </label>
          <select
            id="property_type"
            name="property_type"
            required
            defaultValue={property?.property_type ?? "2BHK"}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 shadow-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-100"
          >
            <option value="1BHK">1BHK</option>
            <option value="2BHK">2BHK</option>
            <option value="3BHK">3BHK</option>
            <option value="shop">Shop</option>
            <option value="pg">PG</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="location" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Location <span className="font-normal text-zinc-500 dark:text-zinc-400">(optional)</span>
        </label>
        <input
          id="location"
          name="location"
          defaultValue={property?.location ?? ""}
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 shadow-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-100"
          placeholder="e.g. Indra Nagar, Nashik"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="map_link" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Google Maps link <span className="font-normal text-zinc-500 dark:text-zinc-400">(optional)</span>
        </label>
        <input
          id="map_link"
          name="map_link"
          type="url"
          inputMode="url"
          defaultValue={property?.map_link ?? ""}
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 shadow-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-100"
          placeholder="https://maps.google.com/…"
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Paste Google Maps share link</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="address" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Address <span className="font-normal text-zinc-500 dark:text-zinc-400">(optional)</span>
        </label>
        <input
          id="address"
          name="address"
          defaultValue={property?.address ?? ""}
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 shadow-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-100"
          placeholder="Street, landmark…"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="bedrooms" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Bedrooms
          </label>
          <input
            id="bedrooms"
            name="bedrooms"
            type="number"
            min={0}
            step={1}
            defaultValue={property?.bedrooms ?? ""}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 shadow-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-100"
            placeholder="—"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="bathrooms" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Bathrooms
          </label>
          <input
            id="bathrooms"
            name="bathrooms"
            type="number"
            min={0}
            step={1}
            defaultValue={property?.bathrooms ?? ""}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 shadow-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-100"
            placeholder="—"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="area_sqft" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Area (sqft) <span className="font-normal text-zinc-500 dark:text-zinc-400">(optional)</span>
        </label>
        <input
          id="area_sqft"
          name="area_sqft"
          type="number"
          min={0}
          step={1}
          defaultValue={property?.area_sqft ?? ""}
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 shadow-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-100"
          placeholder="e.g. 1200"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="furnishing" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Furnishing
          </label>
          <select
            id="furnishing"
            name="furnishing"
            defaultValue={property?.furnishing ?? ""}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 shadow-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-100"
          >
            <option value="">— Select —</option>
            <option value="furnished">Furnished</option>
            <option value="semi-furnished">Semi-furnished</option>
            <option value="unfurnished">Unfurnished</option>
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="available_status" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Status
          </label>
          <select
            id="available_status"
            name="available_status"
            defaultValue={property?.available_status ?? "available"}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 shadow-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-100"
          >
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="contact_phone" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Contact phone <span className="font-normal text-zinc-500 dark:text-zinc-400">(optional)</span>
        </label>
        <input
          id="contact_phone"
          name="contact_phone"
          type="tel"
          defaultValue={property?.contact_phone ?? ""}
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 shadow-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-100"
          placeholder="+91 …"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="expires_at" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Listing expires
        </label>
        <input
          id="expires_at"
          name="expires_at"
          type="date"
          required
          min={new Date().toISOString().slice(0, 10)}
          defaultValue={expiresValue}
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 shadow-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-100"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="images" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {isEdit ? "Replace / add photos" : "Photos"}
        </label>
        <input
          id="images"
          name="images"
          type="file"
          accept="image/*"
          multiple
          className="w-full text-sm text-zinc-600 file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-zinc-800 hover:file:bg-zinc-200 dark:text-zinc-400 dark:file:bg-zinc-800 dark:file:text-zinc-100 dark:hover:file:bg-zinc-700"
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {isEdit
            ? "Upload new images to add them. Saving rebuilds the gallery from kept URLs plus new uploads."
            : "Stored in Supabase Storage and linked in property_images."}
        </p>
      </div>

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
