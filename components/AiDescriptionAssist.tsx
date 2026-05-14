"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

import { generateListingDescription } from "@/app/actions/ai";

type Props = {
  titleId?: string;
  propertyTypeId?: string;
  locationId?: string;
  priceId?: string;
  dealTypeId?: string;
  categoryId?: string;
  descriptionId?: string;
};

export function AiDescriptionAssist({
  titleId = "title",
  propertyTypeId = "property_type",
  locationId = "location",
  priceId = "price",
  dealTypeId = "deal_type",
  categoryId = "category",
  descriptionId = "description",
}: Props) {
  const [bullets, setBullets] = useState("");
  const [pending, setPending] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setError(null);
    setHint(null);
    setPending(true);
    try {
      const fd = new FormData();
      const title = (document.getElementById(titleId) as HTMLInputElement | null)?.value ?? "";
      const property_type =
        (document.getElementById(propertyTypeId) as HTMLSelectElement | null)?.value ?? "";
      const location = (document.getElementById(locationId) as HTMLInputElement | null)?.value ?? "";
      const price = (document.getElementById(priceId) as HTMLInputElement | null)?.value ?? "";
      const deal_type =
        (document.getElementById(dealTypeId) as HTMLSelectElement | null)?.value ?? "rent";
      const category =
        (document.getElementById(categoryId) as HTMLSelectElement | null)?.value ?? "residential";

      fd.set("title", title);
      fd.set("property_type", property_type);
      fd.set("location", location);
      fd.set("price", price);
      fd.set("deal_type", deal_type);
      fd.set("category", category);
      fd.set("bullets", bullets);

      const result = await generateListingDescription(fd);
      if (result.error) {
        setError(result.error);
        return;
      }
      const ta = document.getElementById(descriptionId) as HTMLTextAreaElement | null;
      if (ta && result.text) {
        ta.value = result.text;
        ta.dispatchEvent(new Event("input", { bubbles: true }));
      }
      setHint(
        result.usedAi
          ? "AI draft added — edit before publishing."
          : "Template draft added — set OPENAI_API_KEY for AI.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-xl border border-violet-200/80 bg-violet-50/60 p-4 dark:border-violet-900/50 dark:bg-violet-950/30">
      <div className="flex items-center gap-2 text-sm font-semibold text-violet-900 dark:text-violet-200">
        <Sparkles className="size-4" aria-hidden />
        AI listing helper
      </div>
      <p className="mt-1 text-xs text-violet-800/80 dark:text-violet-300/80">
        Add rough bullet points; we draft the description (OpenAI if configured).
      </p>
      <textarea
        value={bullets}
        onChange={(e) => setBullets(e.target.value)}
        rows={3}
        placeholder="e.g. corner shop, 400 sqft, main road facing, parking nearby…"
        className="mt-3 w-full resize-y rounded-lg border border-violet-200/80 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-violet-500/25 dark:border-violet-800 dark:bg-zinc-900 dark:text-zinc-100"
      />
      <button
        type="button"
        onClick={handleGenerate}
        disabled={pending}
        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-600 disabled:opacity-60"
      >
        {pending ? "Writing…" : "Generate description"}
      </button>
      {hint ? <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-400">{hint}</p> : null}
      {error ? <p className="mt-2 text-xs text-red-700 dark:text-red-300">{error}</p> : null}
    </div>
  );
}
