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
import { exportPng, overlayPng, POSTER_HEIGHT, POSTER_WIDTH } from "@/lib/ai/poster/utils";

export async function renderMinimalHero(ctx: PosterComposeContext): Promise<Buffer> {
  const hero = await sharp(ctx.buffers[0]!)
    .resize(POSTER_WIDTH, 720, { fit: "cover" })
    .toBuffer();

  const locality = ctx.meta.location ?? ctx.brief.headline;
  const t = ctx.theme;
  const hook = ctx.brief.hook ?? "LIVE THE LUXURY";

  const overlaySvg = `<svg width="${POSTER_WIDTH}" height="${POSTER_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fadeUp" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${t.background}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${t.background}" stop-opacity="1"/>
    </linearGradient>
  </defs>
  <rect y="600" width="${POSTER_WIDTH}" height="750" fill="url(#fadeUp)"/>
  <rect y="720" width="${POSTER_WIDTH}" height="630" fill="${t.background}"/>
  ${brandBlock(t, 48, 48, 220)}
  ${hookLabel(t, hook, 48, 760)}
  ${headlineBlock(t, locality, ctx.brief.tagline ?? "", 48, 820, 58)}
  ${featureGrid2x2(t, ctx.features, 48, 920)}
  ${priceCardModern(t, ctx.meta, ctx.brief, 620, 760)}
  ${bottomInfoBar(t, ctx.meta, ctx.brief)}
</svg>`;

  const overlay = await overlayPng(overlaySvg);
  return exportPng(t.background, [
    { input: hero, top: 0, left: 0 },
    { input: overlay, top: 0, left: 0 },
  ]);
}
