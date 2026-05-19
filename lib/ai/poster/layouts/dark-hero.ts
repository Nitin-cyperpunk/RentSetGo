import sharp from "sharp";

import {
  bottomInfoBar,
  brandBlock,
  featureGrid2x2,
  hookLabel,
  headlineBlock,
  priceCardModern,
} from "@/lib/ai/poster/shared-ui";
import type { PosterComposeContext } from "@/lib/ai/poster/types";
import { exportPng, overlayPng, POSTER_HEIGHT, POSTER_WIDTH, roundedPhoto } from "@/lib/ai/poster/utils";

export async function renderDarkHero(ctx: PosterComposeContext): Promise<Buffer> {
  const hero = await sharp(ctx.buffers[0]!)
    .resize(POSTER_WIDTH, 620, { fit: "cover" })
    .modulate({ brightness: 0.78, saturation: 1.1 })
    .toBuffer();

  const thumb = await roundedPhoto(ctx.buffers[1]!, 300, 220, 16);
  const locality = ctx.meta.location ?? ctx.brief.headline;
  const t = ctx.theme;
  const hook = ctx.brief.hook ?? "PRIME ADDRESS";

  const overlaySvg = `<svg width="${POSTER_WIDTH}" height="${POSTER_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="vignette" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000" stop-opacity="0.45"/>
      <stop offset="50%" stop-color="#000" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#0a0a0a" stop-opacity="0.95"/>
    </linearGradient>
  </defs>
  <rect width="${POSTER_WIDTH}" height="${POSTER_HEIGHT}" fill="url(#vignette)"/>
  <rect x="0" y="600" width="${POSTER_WIDTH}" height="750" fill="#0a0a0a" opacity="0.92"/>
  ${brandBlock(t, 48, 40, 220)}
  ${hookLabel(t, hook, 48, 640)}
  ${headlineBlock(t, locality, ctx.brief.tagline ?? "", 48, 700, 58)}
  ${featureGrid2x2(t, ctx.features, 48, 800)}
  ${priceCardModern(t, ctx.meta, ctx.brief, 620, 640)}
  ${bottomInfoBar(t, ctx.meta, ctx.brief)}
</svg>`;

  const overlay = await overlayPng(overlaySvg);
  return exportPng("#050505", [
    { input: hero, top: 0, left: 0 },
    { input: thumb, top: 420, left: 720 },
    { input: overlay, top: 0, left: 0 },
  ]);
}
