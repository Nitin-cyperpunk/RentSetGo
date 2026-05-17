"use client";

import { useCallback, useState } from "react";

import { generateListingDescription } from "@/app/actions/ai";
import { AISectionCard } from "@/components/ai/AISectionCard";
import { GenerateButton } from "@/components/ai/GenerateButton";

const AMENITY_OPTIONS = [
  "Lift",
  "Power backup",
  "Security",
  "Gym",
  "Garden",
  "Clubhouse",
  "WiFi",
  "AC",
  "Water supply",
  "Pet friendly",
] as const;

type Props = {
  description: string;
  onDescriptionChange: (value: string) => void;
  onAiDescriptionChange?: (value: string) => void;
  formId?: string;
  defaultAmenities?: string[];
  defaultFloor?: string;
  defaultBalcony?: string;
  defaultParking?: string;
};

function collectFormData(formId?: string): FormData {
  const form = formId
    ? (document.getElementById(formId) as HTMLFormElement | null)
    : null;
  const fd = form ? new FormData(form) : new FormData();

  if (!form) {
    const ids = [
      "title",
      "property_type",
      "location",
      "price",
      "deal_type",
      "category",
      "bedrooms",
      "bathrooms",
      "area_sqft",
      "furnishing",
      "address",
      "floor",
      "balcony",
      "parking",
    ] as const;
    for (const id of ids) {
      const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
      if (el) fd.set(id, el.value);
    }
    document.querySelectorAll<HTMLInputElement>('input[name="amenities"]:checked').forEach((el) => {
      fd.append("amenities", el.value);
    });
  }

  const bulletsEl = document.getElementById("ai-bullets") as HTMLTextAreaElement | null;
  if (bulletsEl) fd.set("bullets", bulletsEl.value);

  return fd;
}

export function AIDescriptionGenerator({
  description,
  onDescriptionChange,
  onAiDescriptionChange,
  formId = "property-listing-form",
  defaultAmenities = [],
  defaultFloor = "",
  defaultBalcony = "",
  defaultParking = "",
}: Props) {
  const [bullets, setBullets] = useState("");
  const [pending, setPending] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<Set<string>>(
    () => new Set(defaultAmenities),
  );

  const toggleAmenity = (name: string) => {
    setSelectedAmenities((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const runGenerate = useCallback(async () => {
    setError(null);
    setHint(null);
    setPending(true);
    try {
      const fd = collectFormData(formId);
      fd.set("bullets", bullets);
      for (const a of selectedAmenities) {
        if (!fd.getAll("amenities").includes(a)) fd.append("amenities", a);
      }

      const result = await generateListingDescription(fd);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.text) {
        onDescriptionChange(result.text);
        onAiDescriptionChange?.(result.text);
        setHint(
          result.usedAi
            ? "AI description ready — edit before publishing."
            : "Template draft added — set OPENAI_API_KEY for full AI.",
        );
      }
    } finally {
      setPending(false);
    }
  }, [bullets, formId, onAiDescriptionChange, onDescriptionChange, selectedAmenities]);

  return (
    <AISectionCard
      icon="✨"
      title="AI Description Generator"
      subtitle="Generate a professional listing description from your property details."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5 sm:col-span-1">
          <label htmlFor="floor" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Floor
          </label>
          <input
            id="floor"
            name="floor"
            form={formId}
            defaultValue={defaultFloor}
            placeholder="e.g. 10th floor"
            className="w-full rounded-lg border border-zinc-200/90 bg-white/90 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950/60"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="balcony" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Balcony
          </label>
          <select
            id="balcony"
            name="balcony"
            form={formId}
            defaultValue={defaultBalcony || ""}
            className="w-full rounded-lg border border-zinc-200/90 bg-white/90 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950/60"
          >
            <option value="">—</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="parking" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Parking
          </label>
          <select
            id="parking"
            name="parking"
            form={formId}
            defaultValue={defaultParking || ""}
            className="w-full rounded-lg border border-zinc-200/90 bg-white/90 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950/60"
          >
            <option value="">—</option>
            <option value="yes">Dedicated</option>
            <option value="street">Street</option>
            <option value="no">None</option>
          </select>
        </div>
      </div>

      <fieldset className="mt-4">
        <legend className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Amenities</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {AMENITY_OPTIONS.map((name) => {
            const checked = selectedAmenities.has(name);
            return (
              <label
                key={name}
                className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition ${
                  checked
                    ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
                    : "border-zinc-200 bg-white/70 text-zinc-600 dark:border-zinc-600 dark:bg-zinc-900/50 dark:text-zinc-400"
                }`}
              >
                <input
                  type="checkbox"
                  name="amenities"
                  form={formId}
                  value={name}
                  checked={checked}
                  onChange={() => toggleAmenity(name)}
                  className="sr-only"
                />
                {name}
              </label>
            );
          })}
        </div>
      </fieldset>

      <label htmlFor="ai-bullets" className="mt-4 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
        Extra notes for AI (optional)
      </label>
      <textarea
        id="ai-bullets"
        value={bullets}
        onChange={(e) => setBullets(e.target.value)}
        rows={2}
        placeholder="e.g. corner unit, peaceful society, near college…"
        className="mt-1 w-full resize-y rounded-xl border border-zinc-200/90 bg-white/90 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500/25 dark:border-zinc-600 dark:bg-zinc-950/60"
      />

      {pending ? (
        <div className="mt-4 space-y-2" aria-busy="true">
          <div className="h-24 animate-pulse rounded-xl bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-800" />
          <p className="text-xs text-zinc-500">Crafting your description…</p>
        </div>
      ) : (
        <textarea
          id="description"
          name="description"
          form={formId}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={5}
          placeholder="Your listing description will appear here…"
          className="mt-4 w-full resize-y rounded-xl border border-zinc-200/90 bg-white/90 px-4 py-3 text-sm leading-relaxed text-zinc-900 shadow-inner outline-none transition focus:ring-2 focus:ring-emerald-500/25 dark:border-zinc-600 dark:bg-zinc-950/60 dark:text-zinc-100"
        />
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <GenerateButton
          onClick={runGenerate}
          pending={pending}
          label="Generate Description"
          pendingLabel="Generating…"
        />
        {description ? (
          <GenerateButton
            onClick={runGenerate}
            pending={pending}
            label="Retry"
            pendingLabel="Retrying…"
            variant="secondary"
          />
        ) : null}
      </div>

      {hint ? <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-400">{hint}</p> : null}
      {error ? <p className="mt-2 text-xs text-red-700 dark:text-red-300">{error}</p> : null}
    </AISectionCard>
  );
}
