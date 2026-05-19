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

export async function renderBoldPromo(ctx: PosterComposeContext): Promise<Buffer> {
  const photo = await sharp(ctx.buffers[0]!)
    .resize(POSTER_WIDTH, 560, { fit: "cover", position: "centre" })
    .toBuffer();

  const inset = await roundedPhoto(ctx.buffers[1]!, 360, 280, 20);
  const locality = ctx.meta.location ?? ctx.brief.headline;
  const t = ctx.theme;
  const hook = ctx.brief.hook ?? "MOVE IN NOW";

  const overlaySvg = `<svg width="${POSTER_WIDTH}" height="${POSTER_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${t.background}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${t.background}" stop-opacity="1"/>
    </linearGradient>
  </defs>
  <rect width="${POSTER_WIDTH}" height="${POSTER_HEIGHT}" fill="${t.background}"/>
  <rect x="0" y="440" width="${POSTER_WIDTH}" height="160" fill="url(#fade)"/>
  <rect x="0" y="560" width="${POSTER_WIDTH}" height="790" fill="${t.background}"/>
  ${brandBlock(t, 48, 48, 220)}
  ${hookLabel(t, hook, 48, 592)}
  ${headlineBlock(t, locality, ctx.brief.tagline ?? "", 48, 660, 64)}
  ${featureGrid2x2(t, ctx.features, 48, 760)}
  ${priceCardModern(t, ctx.meta, ctx.brief, 620, 592)}
</svg>`;

  const overlay = await overlayPng(overlaySvg);
  return exportPng(t.background, [
    { input: photo, top: 0, left: 0 },
    { input: inset, top: 600, left: 680 },
    { input: overlay, top: 0, left: 0 },
  ]);
}
