import sharp from "sharp";

import type { ExtractedPalette, ImageAnalysis } from "@/lib/ai/poster/types";
import { fetchImage } from "@/lib/ai/poster/utils";

function rgbToHex(r: number, g: number, b: number): string {
  const h = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

function mix(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1, 3), 16);
  const ra = parseInt(a.slice(3, 5), 16);
  const ga = parseInt(a.slice(5, 7), 16);
  const pb = parseInt(b.slice(1, 3), 16);
  const rb = parseInt(b.slice(3, 5), 16);
  const gb = parseInt(b.slice(5, 7), 16);
  return rgbToHex(pa + (pb - pa) * t, ra + (rb - ra) * t, ga + (gb - ga) * t);
}

function paletteFromRgb(r: number, g: number, b: number, luminance: number): ExtractedPalette {
  if (luminance < 0.35) {
    return {
      primary: "#1a1a1a",
      secondary: "#2d2d2d",
      accent: "#C9A86C",
      background: "#121212",
      text: "#f5f5f4",
      muted: "#a8a29e",
    };
  }
  if (r > g && r > b && r - b > 25) {
    return {
      primary: "#3D2C24",
      secondary: "#5C4033",
      accent: "#C9A86C",
      background: "#F2EBE1",
      text: "#1a1a1a",
      muted: "#6B5348",
    };
  }
  if (g > r && b > r) {
    return {
      primary: "#1e3a5f",
      secondary: "#334155",
      accent: "#38bdf8",
      background: "#f1f5f9",
      text: "#0f172a",
      muted: "#64748b",
    };
  }
  return {
    primary: "#27272a",
    secondary: "#52525b",
    accent: "#10b981",
    background: "#fafaf9",
    text: "#18181b",
    muted: "#71717a",
  };
}

export async function analyzePropertyImages(urls: string[]): Promise<ImageAnalysis> {
  const list = urls.filter(Boolean).slice(0, 3);
  const imageCount = list.length || 1;

  if (!list.length) {
    const palette = paletteFromRgb(200, 190, 180, 0.7);
    return { imageCount: 0, avgLuminance: 0.7, isWarm: true, isDark: false, palette };
  }

  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let n = 0;

  for (const url of list) {
    const buf = await fetchImage(url);
    const { data, info } = await sharp(buf)
      .resize(80, 80, { fit: "cover" })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const channels = info.channels;
    for (let i = 0; i < data.length; i += channels) {
      sumR += data[i] ?? 0;
      sumG += data[i + 1] ?? 0;
      sumB += data[i + 2] ?? 0;
      n++;
    }
  }

  const r = sumR / n;
  const g = sumG / n;
  const b = sumB / n;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const isWarm = r > b && r > g * 0.95;
  const isDark = luminance < 0.4;

  let palette = paletteFromRgb(r, g, b, luminance);
  palette = {
    ...palette,
    accent: mix(palette.accent, rgbToHex(r, g, b), 0.35),
    background: mix(palette.background, rgbToHex(r * 0.4 + 255 * 0.6, g * 0.4 + 255 * 0.6, b * 0.4 + 255 * 0.6), 0.15),
  };

  return { imageCount, avgLuminance: luminance, isWarm, isDark, palette };
}
