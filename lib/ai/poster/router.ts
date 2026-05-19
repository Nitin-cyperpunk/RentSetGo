import {
  POSTER_LAYOUT_IDS,
  POSTER_STYLE_IDS,
  type PosterLayoutId,
  type PosterStyleId,
} from "@/lib/ai/poster/constants";
import type { ImageAnalysis } from "@/lib/ai/poster/types";

function isStyleId(v: string | undefined | null): v is PosterStyleId {
  return Boolean(v && (POSTER_STYLE_IDS as readonly string[]).includes(v));
}

function isLayoutId(v: string | undefined | null): v is PosterLayoutId {
  return Boolean(v && (POSTER_LAYOUT_IDS as readonly string[]).includes(v));
}

function pickWeighted<T extends string>(
  items: { id: T; weight: number }[],
  avoid?: T | null,
): T {
  const pool = avoid ? items.filter((i) => i.id !== avoid) : items;
  const total = pool.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of pool) {
    r -= item.weight;
    if (r <= 0) return item.id;
  }
  return pool[pool.length - 1]!.id;
}

/** Favor bold, modern layouts — editorial collage is rare by default. */
const LAYOUT_WEIGHTS: { id: PosterLayoutId; weight: number }[] = [
  { id: "minimal_hero", weight: 45 },
  { id: "bold_promo", weight: 25 },
  { id: "glass_floating", weight: 15 },
  { id: "dark_hero", weight: 10 },
  { id: "cinematic_letterbox", weight: 5 },
  { id: "asymmetric_grid", weight: 0 },
  { id: "split_screen", weight: 0 },
  { id: "editorial_collage", weight: 0 },
];

const STYLE_WEIGHTS: { id: PosterStyleId; weight: number }[] = [
  { id: "bold_promo", weight: 14 },
  { id: "dark_premium", weight: 14 },
  { id: "glassmorphism", weight: 14 },
  { id: "cinematic", weight: 12 },
  { id: "instagram_story", weight: 12 },
  { id: "modern_architectural", weight: 10 },
  { id: "luxury_minimal", weight: 8 },
  { id: "magazine_editorial", weight: 6 },
  { id: "warm_modern_interior", weight: 2 },
  { id: "scandinavian", weight: 5 },
];

const STYLE_LAYOUT_AFFINITY: Partial<Record<PosterStyleId, PosterLayoutId[]>> = {
  luxury_minimal: ["minimal_hero", "asymmetric_grid", "glass_floating"],
  warm_modern_interior: ["split_screen", "asymmetric_grid"],
  dark_premium: ["dark_hero", "cinematic_letterbox", "bold_promo"],
  glassmorphism: ["glass_floating", "minimal_hero", "asymmetric_grid"],
  magazine_editorial: ["asymmetric_grid", "split_screen"],
  instagram_story: ["bold_promo", "minimal_hero", "glass_floating"],
  modern_architectural: ["asymmetric_grid", "split_screen", "dark_hero"],
  bold_promo: ["bold_promo", "glass_floating", "cinematic_letterbox"],
  scandinavian: ["minimal_hero", "asymmetric_grid"],
  cinematic: ["cinematic_letterbox", "dark_hero", "bold_promo"],
};

function layoutWeightsForImages(imageCount: number): typeof LAYOUT_WEIGHTS {
  if (imageCount <= 1) {
    return LAYOUT_WEIGHTS.map((l) => ({
      ...l,
      weight:
        l.id === "minimal_hero" || l.id === "bold_promo" || l.id === "dark_hero"
          ? l.weight * 2.5
          : l.id === "editorial_collage" || l.id === "split_screen"
            ? l.weight * 0.2
            : l.weight,
    }));
  }
  if (imageCount === 2) {
    return LAYOUT_WEIGHTS.map((l) => ({
      ...l,
      weight: l.id === "split_screen" ? l.weight * 2 : l.weight,
    }));
  }
  return LAYOUT_WEIGHTS;
}

export function pickCreativeCombo(
  analysis: ImageAnalysis,
  lastStyleId?: string | null,
  lastLayoutId?: string | null,
): { styleId: PosterStyleId; layoutId: PosterLayoutId } {
  let styleId = pickWeighted(STYLE_WEIGHTS, lastStyleId as PosterStyleId);

  if (analysis.isDark && Math.random() > 0.35) {
    styleId = pickWeighted(
      [
        { id: "dark_premium" as PosterStyleId, weight: 40 },
        { id: "cinematic" as PosterStyleId, weight: 35 },
        { id: "glassmorphism" as PosterStyleId, weight: 25 },
      ],
      lastStyleId as PosterStyleId,
    );
  } else if (analysis.avgLuminance > 0.75 && Math.random() > 0.4) {
    styleId = pickWeighted(
      [
        { id: "instagram_story" as PosterStyleId, weight: 35 },
        { id: "bold_promo" as PosterStyleId, weight: 35 },
        { id: "luxury_minimal" as PosterStyleId, weight: 30 },
      ],
      lastStyleId as PosterStyleId,
    );
  }

  const affinity = STYLE_LAYOUT_AFFINITY[styleId];
  let layoutId: PosterLayoutId;
  if (affinity && Math.random() > 0.25) {
    layoutId = affinity[Math.floor(Math.random() * affinity.length)]!;
    if (layoutId === lastLayoutId && affinity.length > 1) {
      layoutId = affinity.find((l) => l !== lastLayoutId) ?? layoutId;
    }
  } else {
    layoutId = pickWeighted(layoutWeightsForImages(analysis.imageCount), lastLayoutId as PosterLayoutId);
  }

  if (lastLayoutId && layoutId === lastLayoutId) {
    layoutId = pickWeighted(layoutWeightsForImages(analysis.imageCount), lastLayoutId as PosterLayoutId);
  }

  return { styleId, layoutId };
}

export function routePosterDesign(
  analysis: ImageAnalysis,
  geminiStyle?: string | null,
  geminiLayout?: string | null,
  lastStyleId?: string | null,
  lastLayoutId?: string | null,
): { styleId: PosterStyleId; layoutId: PosterLayoutId } {
  const creative = pickCreativeCombo(analysis, lastStyleId, lastLayoutId);

  let styleId = isStyleId(geminiStyle) ? geminiStyle : creative.styleId;
  let layoutId = isLayoutId(geminiLayout) ? geminiLayout : creative.layoutId;

  const affinity = STYLE_LAYOUT_AFFINITY[styleId];
  if (affinity && !affinity.includes(layoutId) && Math.random() > 0.5) {
    layoutId = affinity[Math.floor(Math.random() * affinity.length)]!;
  }

  if (lastStyleId && styleId === lastStyleId) {
    const alt = pickCreativeCombo(analysis, lastStyleId, lastLayoutId);
    styleId = alt.styleId;
    layoutId = alt.layoutId;
  }

  if (lastLayoutId && layoutId === lastLayoutId) {
    layoutId = pickWeighted(layoutWeightsForImages(analysis.imageCount), lastLayoutId as PosterLayoutId);
  }

  if (layoutId === "editorial_collage") {
    layoutId = pickWeighted(
      LAYOUT_WEIGHTS.filter((l) => l.id !== "editorial_collage" && l.weight > 0),
      lastLayoutId as PosterLayoutId,
    );
  }

  return { styleId, layoutId };
}
