import type { PosterComposeContext } from "@/lib/ai/poster/types";
import type { PosterLayoutId } from "@/lib/ai/poster/constants";
import { renderCinematicLetterbox } from "@/lib/ai/poster/layouts/cinematic-letterbox";
import { renderDarkHero } from "@/lib/ai/poster/layouts/dark-hero";
import { renderListingShowcase } from "@/lib/ai/poster/layouts/listing-showcase";

/** Polished default — most layouts route here for consistent quality */
const LAYOUT_RENDERERS: Record<
  PosterLayoutId,
  (ctx: PosterComposeContext) => Promise<Buffer>
> = {
  editorial_collage: renderListingShowcase,
  split_screen: renderListingShowcase,
  dark_hero: renderDarkHero,
  glass_floating: renderListingShowcase,
  bold_promo: renderListingShowcase,
  minimal_hero: renderListingShowcase,
  asymmetric_grid: renderListingShowcase,
  cinematic_letterbox: renderCinematicLetterbox,
};

export async function renderPosterLayout(ctx: PosterComposeContext): Promise<Buffer> {
  const render = LAYOUT_RENDERERS[ctx.brief.layoutId] ?? renderListingShowcase;
  return render(ctx);
}
