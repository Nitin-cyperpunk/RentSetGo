import type { PosterLayoutId, PosterStyleId } from "@/lib/ai/poster/constants";
import type { PosterRenderMeta, PosterTaglines } from "@/lib/ai/types";

export type ExtractedPalette = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  muted: string;
};

export type ImageAnalysis = {
  imageCount: number;
  avgLuminance: number;
  isWarm: boolean;
  isDark: boolean;
  palette: ExtractedPalette;
};

export type PosterCreativeBrief = PosterTaglines & {
  styleId: PosterStyleId;
  layoutId: PosterLayoutId;
  cta?: string;
  /** Short punchy hook above headline, e.g. "LIVE THE LUXURY" */
  hook?: string;
  palette?: Partial<ExtractedPalette>;
};

export type PosterTheme = {
  background: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  textMuted: string;
  panel: string;
  panelStroke: string;
  onPrimary: string;
  priceBg: string;
  serifHeadline: boolean;
};

export type PosterComposeContext = {
  buffers: Buffer[];
  brief: PosterCreativeBrief;
  meta: PosterRenderMeta;
  theme: PosterTheme;
  features: string[];
};

export type PosterComposeResult = {
  buffer: Buffer;
  styleId: PosterStyleId;
  layoutId: PosterLayoutId;
};
