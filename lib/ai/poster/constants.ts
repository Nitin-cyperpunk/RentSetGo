export const POSTER_WIDTH = 1080;
export const POSTER_HEIGHT = 1350;

export const POSTER_STYLE_IDS = [
  "luxury_minimal",
  "warm_modern_interior",
  "dark_premium",
  "glassmorphism",
  "magazine_editorial",
  "instagram_story",
  "modern_architectural",
  "bold_promo",
  "scandinavian",
  "cinematic",
] as const;

export const POSTER_LAYOUT_IDS = [
  "editorial_collage",
  "split_screen",
  "dark_hero",
  "glass_floating",
  "bold_promo",
  "minimal_hero",
  "asymmetric_grid",
  "cinematic_letterbox",
] as const;

export type PosterStyleId = (typeof POSTER_STYLE_IDS)[number];
export type PosterLayoutId = (typeof POSTER_LAYOUT_IDS)[number];

export const STYLE_LABELS: Record<PosterStyleId, string> = {
  luxury_minimal: "Luxury Minimal",
  warm_modern_interior: "Warm Modern Interior",
  dark_premium: "Dark Premium",
  glassmorphism: "Glassmorphism",
  magazine_editorial: "Magazine Editorial",
  instagram_story: "Instagram Story",
  modern_architectural: "Modern Architectural",
  bold_promo: "Bold Promo",
  scandinavian: "Scandinavian",
  cinematic: "Cinematic Lifestyle",
};

export const LAYOUT_LABELS: Record<PosterLayoutId, string> = {
  editorial_collage: "Editorial Collage",
  split_screen: "Split Screen",
  dark_hero: "Dark Hero",
  glass_floating: "Glass Floating",
  bold_promo: "Bold Promo Layout",
  minimal_hero: "Premium Listing",
  asymmetric_grid: "Asymmetric Grid",
  cinematic_letterbox: "Cinematic Letterbox",
};
