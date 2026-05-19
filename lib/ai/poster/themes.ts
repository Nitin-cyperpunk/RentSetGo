import type { PosterStyleId } from "@/lib/ai/poster/constants";
import type { ExtractedPalette, PosterTheme } from "@/lib/ai/poster/types";

const STYLE_PRESETS: Record<PosterStyleId, PosterTheme> = {
  luxury_minimal: {
    background: "#FAFAF9",
    primary: "#18181b",
    secondary: "#52525b",
    accent: "#B45309",
    text: "#18181b",
    textMuted: "#57534e",
    panel: "#FFFFFF",
    panelStroke: "#E7E5E4",
    onPrimary: "#FFFFFF",
    priceBg: "#0F172A",
    serifHeadline: false,
  },
  warm_modern_interior: {
    background: "#F7F3EE",
    primary: "#2C2420",
    secondary: "#5C4A42",
    accent: "#B8956B",
    text: "#1C1917",
    textMuted: "#78716C",
    panel: "#FFFFFF",
    panelStroke: "#E7E0D8",
    onPrimary: "#FFFFFF",
    priceBg: "#2C2420",
    serifHeadline: true,
  },
  dark_premium: {
    background: "#0f0f10",
    primary: "#fafafa",
    secondary: "#a1a1aa",
    accent: "#C9A86C",
    text: "#fafafa",
    textMuted: "#a1a1aa",
    panel: "rgba(24,24,27,0.75)",
    panelStroke: "rgba(255,255,255,0.15)",
    onPrimary: "#0f0f10",
    priceBg: "#C9A86C",
    serifHeadline: false,
  },
  glassmorphism: {
    background: "#F4F6FA",
    primary: "#0f172a",
    secondary: "#64748b",
    accent: "#2563eb",
    text: "#0f172a",
    textMuted: "#64748b",
    panel: "#FFFFFF",
    panelStroke: "#E2E8F0",
    onPrimary: "#FFFFFF",
    priceBg: "#0F172A",
    serifHeadline: false,
  },
  magazine_editorial: {
    background: "#F2EBE1",
    primary: "#3D2C24",
    secondary: "#5C4033",
    accent: "#8B4513",
    text: "#1a1a1a",
    textMuted: "#6B5348",
    panel: "#E8DDD0",
    panelStroke: "#5C4033",
    onPrimary: "#ffffff",
    priceBg: "#3D2C24",
    serifHeadline: true,
  },
  instagram_story: {
    background: "#ffffff",
    primary: "#0f172a",
    secondary: "#475569",
    accent: "#ec4899",
    text: "#0f172a",
    textMuted: "#64748b",
    panel: "#f1f5f9",
    panelStroke: "#e2e8f0",
    onPrimary: "#ffffff",
    priceBg: "#ec4899",
    serifHeadline: false,
  },
  modern_architectural: {
    background: "#e7e5e4",
    primary: "#1c1917",
    secondary: "#57534e",
    accent: "#0d9488",
    text: "#1c1917",
    textMuted: "#78716c",
    panel: "rgba(255,255,255,0.85)",
    panelStroke: "#a8a29e",
    onPrimary: "#ffffff",
    priceBg: "#0d9488",
    serifHeadline: false,
  },
  bold_promo: {
    background: "#059669",
    primary: "#ffffff",
    secondary: "#d1fae5",
    accent: "#fef08a",
    text: "#ffffff",
    textMuted: "#ecfdf5",
    panel: "rgba(0,0,0,0.35)",
    panelStroke: "rgba(255,255,255,0.25)",
    onPrimary: "#065f46",
    priceBg: "#ffffff",
    serifHeadline: false,
  },
  scandinavian: {
    background: "#f5f5f4",
    primary: "#292524",
    secondary: "#78716c",
    accent: "#84cc16",
    text: "#292524",
    textMuted: "#a8a29e",
    panel: "#ffffff",
    panelStroke: "#e7e5e4",
    onPrimary: "#ffffff",
    priceBg: "#292524",
    serifHeadline: true,
  },
  cinematic: {
    background: "#1e1b18",
    primary: "#fafaf9",
    secondary: "#d6d3d1",
    accent: "#f59e0b",
    text: "#fafaf9",
    textMuted: "#d6d3d1",
    panel: "rgba(0,0,0,0.55)",
    panelStroke: "rgba(255,255,255,0.2)",
    onPrimary: "#1c1917",
    priceBg: "#f59e0b",
    serifHeadline: true,
  },
};

export function resolveTheme(
  styleId: PosterStyleId,
  extracted?: Partial<ExtractedPalette>,
): PosterTheme {
  const base = { ...STYLE_PRESETS[styleId] };
  if (!extracted) return base;

  if (extracted.accent) base.accent = extracted.accent;
  if (extracted.background) base.background = extracted.background;
  if (extracted.primary) base.primary = extracted.primary;
  if (extracted.text) base.text = extracted.text;
  if (extracted.muted) base.textMuted = extracted.muted;
  if (extracted.secondary) base.secondary = extracted.secondary;

  return base;
}
