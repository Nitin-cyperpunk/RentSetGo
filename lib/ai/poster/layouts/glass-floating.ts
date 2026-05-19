import sharp from "sharp";

import {
  brandBlock,
  featureGrid2x2,
  hookLabel,
  headlineBlock,
  priceCardModern,
} from "@/lib/ai/poster/shared-ui";
import type { PosterComposeContext } from "@/lib/ai/poster/types";
import { exportPng, overlayPng, POSTER_HEIGHT, POSTER_WIDTH, roundedPhoto } from "@/lib/ai/poster/utils";

export async function renderGlassFloating(ctx: PosterComposeContext): Promise<Buffer> {
  const hero = await sharp(ctx.buffers[0]!)
    .resize(POSTER_WIDTH, POSTER_HEIGHT, { fit: "cover" })
    .blur(4)
    .toBuffer();

  const inset = await roundedPhoto(ctx.buffers[1]!, 400, 300, 20);
  const locality = ctx.meta.location ?? ctx.brief.headline;
  const t = ctx.theme;
  const hook = ctx.brief.hook ?? "YOUR NEW HOME";

  const overlaySvg = `<svg width="${POSTER_WIDTH}" height="${POSTER_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${POSTER_WIDTH}" height="${POSTER_HEIGHT}" fill="rgba(10,15,30,0.55)"/>
  <rect x="48" y="120" width="560" height="720" rx="32" fill="${t.panel}" stroke="${t.accent}" stroke-width="2" opacity="0.96"/>
  ${brandBlock(t, 72, 140, 220)}
  ${hookLabel(t, hook, 72, 200)}
  ${headlineBlock(t, locality, ctx.brief.tagline ?? "", 72, 260, 52)}
  ${featureGrid2x2(t, ctx.features, 72, 360)}
  <rect x="640" y="120" width="392" height="720" rx="32" fill="${t.panel}" stroke="${t.panelStroke}" stroke-width="1" opacity="0.9"/>
  ${priceCardModern(t, ctx.meta, ctx.brief, 668, 160)}
</svg>`;

  const overlay = await overlayPng(overlaySvg);
  return exportPng(t.background, [
    { input: hero, top: 0, left: 0 },
    { input: inset, top: 480, left: 640 },
    { input: overlay, top: 0, left: 0 },
  ]);
}
