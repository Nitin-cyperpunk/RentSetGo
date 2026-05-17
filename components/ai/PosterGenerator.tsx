"use client";

import { useCallback, useEffect, useState } from "react";

import { generatePropertyPoster, getPosterQuota } from "@/app/actions/ai";
import { AISectionCard } from "@/components/ai/AISectionCard";
import { GenerateButton } from "@/components/ai/GenerateButton";
import { PosterPreview } from "@/components/ai/PosterPreview";
import { UpgradeModal } from "@/components/ai/UpgradeModal";

type Props = {
  propertyId?: string;
  propertyTitle: string;
  initialPosterUrl?: string | null;
  hasImages?: boolean;
};

export function PosterGenerator({
  propertyId,
  propertyTitle,
  initialPosterUrl,
  hasImages = false,
}: Props) {
  const [posterUrl, setPosterUrl] = useState<string | null>(initialPosterUrl ?? null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    setPosterUrl(initialPosterUrl ?? null);
  }, [initialPosterUrl]);

  useEffect(() => {
    if (!propertyId) return;
    getPosterQuota().then((q) => {
      if (!q.error) setRemaining(q.remaining);
    });
  }, [propertyId, posterUrl]);

  const runGenerate = useCallback(async () => {
    if (!propertyId) return;
    setError(null);
    setPending(true);
    try {
      const result = await generatePropertyPoster(propertyId);
      if (result.code === "UPGRADE") {
        setShowUpgrade(true);
        setError(result.error ?? "Upgrade to generate more posters.");
        return;
      }
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.url) {
        setPosterUrl(result.url);
        if (result.remaining != null) setRemaining(result.remaining);
      }
    } finally {
      setPending(false);
    }
  }, [propertyId]);

  const disabledReason = !propertyId
    ? "Save your listing first, then generate an AI marketing poster."
    : !hasImages
      ? "Upload at least one property photo before generating a poster."
      : null;

  return (
    <>
      <AISectionCard
        icon="🎨"
        title="AI Property Poster Generator"
        subtitle="Instagram & WhatsApp-ready creatives with your photo, rent, and amenities."
      >
        {disabledReason ? (
          <p className="rounded-lg border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
            {disabledReason}
          </p>
        ) : (
          <>
            {remaining != null && remaining < 99 ? (
              <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
                {remaining > 0
                  ? `${remaining} free poster generation${remaining === 1 ? "" : "s"} left`
                  : "No free generations left"}
              </p>
            ) : null}

            {pending ? (
              <div className="aspect-[4/5] max-w-sm mx-auto animate-pulse rounded-xl bg-gradient-to-br from-zinc-200 to-emerald-100 dark:from-zinc-800 dark:to-emerald-950" />
            ) : posterUrl ? (
              <PosterPreview posterUrl={posterUrl} title={propertyTitle} />
            ) : null}

            <div className="mt-4 flex flex-wrap gap-3">
              <GenerateButton
                onClick={runGenerate}
                pending={pending}
                disabled={Boolean(disabledReason)}
                label="Generate AI Poster"
                pendingLabel="Creating poster…"
              />
              {posterUrl ? (
                <GenerateButton
                  onClick={runGenerate}
                  pending={pending}
                  label="Regenerate"
                  pendingLabel="Regenerating…"
                  variant="secondary"
                />
              ) : null}
            </div>
          </>
        )}

        {error ? <p className="mt-2 text-xs text-red-700 dark:text-red-300">{error}</p> : null}
      </AISectionCard>

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </>
  );
}
