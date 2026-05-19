import { buildDescriptionUserMessage } from "@/lib/ai/description-prompt";
import { chatCompletion, getGeminiConfig } from "@/lib/ai/gemini";
import {
  POSTER_LAYOUT_IDS,
  POSTER_STYLE_IDS,
  type PosterLayoutId,
  type PosterStyleId,
} from "@/lib/ai/poster/constants";
import { routePosterDesign } from "@/lib/ai/poster/router";
import type { ImageAnalysis, PosterCreativeBrief } from "@/lib/ai/poster/types";
import type { PosterTaglines, PropertyDescriptionInput } from "@/lib/ai/types";

export const CREATIVE_BRIEF_SYSTEM_PROMPT =
  "You are an award-winning creative director for premium Indian real-estate Instagram ads (Behance / Canva quality). " +
  "Be BOLD and varied — never generic. Pick unexpected style+layout combos that feel fresh. " +
  `Styles: ${POSTER_STYLE_IDS.join(", ")}. Layouts: ${POSTER_LAYOUT_IDS.join(", ")}. ` +
  "Prefer: bold_promo, dark_premium, glassmorphism, cinematic, instagram_story over boring templates. " +
  "Never use editorial_collage. Prefer dark_hero, bold_promo, glass_floating, cinematic_letterbox. " +
  'JSON only: {"styleId":"...","layoutId":"...","hook":"...","headline":"...","tagline":"...","bullets":["","","",""],"locationLine":"...","priceLine":"...","cta":"..."}. ' +
  "hook: 2-4 words ALL CAPS energy (e.g. LIVE THE LUXURY, MOVE IN NOW, YOUR NEW HOME). " +
  "headline: locality max 3 words. tagline: emotional max 10 words. bullets: 4 punchy perks max 26 chars. " +
  "cta: action verb (BOOK A VISIT, CALL NOW, GRAB THIS DEAL). locationLine with 📍. priceLine with ₹.";

function parseBriefJson(text: string): Partial<PosterCreativeBrief> | null {
  try {
    const parsed = JSON.parse(text) as Partial<PosterCreativeBrief>;
    if (parsed.headline && parsed.bullets?.length) return parsed;
  } catch {
    // ignore
  }
  return null;
}

export function mergeCreativeBrief(
  taglines: PosterTaglines,
  analysis: ImageAnalysis,
  geminiPartial: Partial<PosterCreativeBrief> | null,
  lastStyleId?: string | null,
  lastLayoutId?: string | null,
): PosterCreativeBrief {
  const routed = routePosterDesign(
    analysis,
    geminiPartial?.styleId,
    geminiPartial?.layoutId,
    lastStyleId,
    lastLayoutId,
  );

  const hooks = ["YOUR DREAM HOME", "MOVE IN NOW", "LIVE THE LUXURY", "PRIME ADDRESS", "READY TO MOVE"];
  const hook =
    geminiPartial?.hook?.trim().toUpperCase() ??
    hooks[Math.floor(Math.random() * hooks.length)]!;

  return {
    headline: geminiPartial?.headline ?? taglines.headline,
    tagline: geminiPartial?.tagline ?? taglines.tagline,
    bullets: geminiPartial?.bullets?.length ? geminiPartial.bullets : taglines.bullets,
    locationLine: geminiPartial?.locationLine ?? taglines.locationLine,
    priceLine: geminiPartial?.priceLine ?? taglines.priceLine,
    cta: geminiPartial?.cta ?? "BOOK A VISIT",
    hook,
    palette: geminiPartial?.palette,
    styleId: routed.styleId,
    layoutId: routed.layoutId,
  };
}

export async function generateCreativeBrief(
  input: PropertyDescriptionInput,
  analysis: ImageAnalysis,
  taglines: PosterTaglines,
  lastStyleId?: string | null,
  lastLayoutId?: string | null,
): Promise<PosterCreativeBrief> {
  const { key } = getGeminiConfig();
  if (!key) {
    return mergeCreativeBrief(taglines, analysis, null, lastStyleId, lastLayoutId);
  }

  const analysisHint = [
    `Image count: ${analysis.imageCount}`,
    `Warm tones: ${analysis.isWarm}`,
    `Dark photos: ${analysis.isDark}`,
    `Avg luminance: ${analysis.avgLuminance.toFixed(2)}`,
    lastStyleId ? `Avoid repeating style: ${lastStyleId}` : "",
    lastLayoutId ? `Avoid repeating layout: ${lastLayoutId}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const result = await chatCompletion(
    CREATIVE_BRIEF_SYSTEM_PROMPT,
    `${buildDescriptionUserMessage(input)}\n\nImage analysis:\n${analysisHint}`,
    { maxTokens: 400, temperature: 1.0 },
  );

  const partial = result.text ? parseBriefJson(result.text) : null;
  return mergeCreativeBrief(taglines, analysis, partial, lastStyleId, lastLayoutId);
}

export function briefStyleLayout(brief: PosterCreativeBrief): {
  styleId: PosterStyleId;
  layoutId: PosterLayoutId;
} {
  return { styleId: brief.styleId, layoutId: brief.layoutId };
}
