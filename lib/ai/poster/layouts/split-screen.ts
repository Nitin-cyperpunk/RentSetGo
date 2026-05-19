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

export async function renderSplitScreen(ctx: PosterComposeContext): Promise<Buffer> {
  const left = await sharp(ctx.buffers[0]!)
    .resize(500, POSTER_HEIGHT, { fit: "cover", position: "centre" })
    .toBuffer();

  const rightTop = await roundedPhoto(ctx.buffers[1]!, 580, 420, 16);
  const rightBot = await roundedPhoto(ctx.buffers[2]!, 580, 420, 16);
  const locality = ctx.meta.location ?? ctx.brief.headline;
  const t = ctx.theme;
  const hook = ctx.brief.hook ?? "YOUR DREAM HOME";

  const overlaySvg = `<svg width="${POSTER_WIDTH}" height="${POSTER_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect x="500" y="0" width="580" height="${POSTER_HEIGHT}" fill="${t.background}"/>
  ${brandBlock(t, 520, 32, 220)}
  ${hookLabel(t, hook, 520, 130)}
  ${headlineBlock(t, locality, ctx.brief.tagline ?? "", 520, 190, 52)}
  ${featureGrid2x2(t, ctx.features, 520, 300)}
  ${priceCardModern(t, ctx.meta, ctx.brief, 520, 880)}
</svg>`;

  const overlay = await overlayPng(overlaySvg);
  return exportPng(t.background, [
    { input: left, top: 0, left: 0 },
    { input: rightTop, top: 32, left: 500 },
    { input: rightBot, top: 472, left: 500 },
    { input: overlay, top: 0, left: 0 },
  ]);
}
