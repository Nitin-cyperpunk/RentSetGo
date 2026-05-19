import sharp from "sharp";

export type PhotoTreatment =
  | "natural"
  | "warm_glow"
  | "cinematic"
  | "high_contrast"
  | "duotone"
  | "muted_luxury";

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16) || 0,
    g: parseInt(h.slice(2, 4), 16) || 0,
    b: parseInt(h.slice(4, 6), 16) || 0,
  };
}

export async function applyPhotoTreatment(
  buffer: Buffer,
  treatment: PhotoTreatment,
  accentHex = "#C9A86C",
): Promise<Buffer> {
  const base = sharp(buffer);

  switch (treatment) {
    case "warm_glow":
      return base
        .modulate({ brightness: 1.06, saturation: 1.18, hue: 8 })
        .sharpen({ sigma: 0.8 })
        .toBuffer();
    case "cinematic":
      return base
        .modulate({ brightness: 0.88, saturation: 1.12 })
        .linear(1.08, -(255 * 0.04))
        .toBuffer();
    case "high_contrast":
      return base
        .normalize()
        .modulate({ saturation: 1.25 })
        .sharpen({ sigma: 1.2 })
        .toBuffer();
    case "muted_luxury":
      return base.modulate({ brightness: 1.02, saturation: 0.82 }).toBuffer();
    case "duotone": {
      const { r, g, b } = hexToRgb(accentHex);
      const gray = await base.grayscale().toBuffer();
      return sharp(gray)
        .tint({ r, g, b })
        .modulate({ brightness: 1.05 })
        .toBuffer();
    }
  default:
      return base.modulate({ brightness: 1.03, saturation: 1.06 }).toBuffer();
  }
}

export function treatmentForStyle(
  styleId: string,
  isDark: boolean,
  isWarm: boolean,
): PhotoTreatment {
  const map: Record<string, PhotoTreatment> = {
    luxury_minimal: "muted_luxury",
    warm_modern_interior: "warm_glow",
    dark_premium: "cinematic",
    glassmorphism: "high_contrast",
    magazine_editorial: "warm_glow",
    instagram_story: "high_contrast",
    modern_architectural: "high_contrast",
    bold_promo: "duotone",
    scandinavian: "muted_luxury",
    cinematic: "cinematic",
  };
  if (map[styleId]) return map[styleId]!;
  if (isDark) return "cinematic";
  if (isWarm) return "warm_glow";
  return "natural";
}
