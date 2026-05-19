import { analyzePropertyImages } from "@/lib/ai/poster/analyze-images";
import { applyPhotoTreatment, treatmentForStyle } from "@/lib/ai/poster/effects";
import type { PosterCreativeBrief, PosterComposeResult } from "@/lib/ai/poster/types";
import { resolveTheme } from "@/lib/ai/poster/themes";
import { renderPosterLayout } from "@/lib/ai/poster/layouts";
import { buildFeatures, loadImageBuffers } from "@/lib/ai/poster/utils";
import type { PosterRenderMeta } from "@/lib/ai/types";

export async function composePropertyPoster(
  imageUrls: string[],
  brief: PosterCreativeBrief,
  meta: PosterRenderMeta,
): Promise<PosterComposeResult> {
  const rawBuffers = await loadImageBuffers(imageUrls);
  const analysis = await analyzePropertyImages(imageUrls);
  const theme = resolveTheme(brief.styleId, {
    ...analysis.palette,
    ...brief.palette,
  });
  const treatment = treatmentForStyle(brief.styleId, analysis.isDark, analysis.isWarm);
  const buffers = await Promise.all(
    rawBuffers.map((buf, i) =>
      applyPhotoTreatment(buf, treatment, theme.accent).then((b) =>
        i === 0 && brief.styleId === "cinematic"
          ? applyPhotoTreatment(b, "cinematic", theme.accent)
          : b,
      ),
    ),
  );
  const features = buildFeatures(meta, brief.bullets);

  const buffer = await renderPosterLayout({
    buffers,
    brief,
    meta,
    theme,
    features,
  });

  return { buffer, styleId: brief.styleId, layoutId: brief.layoutId };
}
