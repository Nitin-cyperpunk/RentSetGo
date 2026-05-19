import sharp from "sharp";

import {
  brandBlock,
  hookLabel,
  headlineBlock,
  priceCardModern,
  typeBadge,
} from "@/lib/ai/poster/shared-ui";
import type { PosterComposeContext } from "@/lib/ai/poster/types";
import { exportPng, overlayPng, POSTER_WIDTH, roundedPhoto } from "@/lib/ai/poster/utils";

export async function renderAsymmetricGrid(ctx: PosterComposeContext): Promise<Buffer> {
  const a = await roundedPhoto(ctx.buffers[0]!, 680, 480, 20);
  const b = await roundedPhoto(ctx.buffers[1]!, 320, 360, 16);
  const c = await roundedPhoto(ctx.buffers[2]!, 320, 280, 16);
  const locality = ctx.meta.location ?? ctx.brief.headline;
  const t = ctx.theme;
  const hook = ctx.brief.hook ?? "MOVE IN NOW";
  const typeLabel = (ctx.meta.propertyType ?? "FLAT").toUpperCase();

  const overlaySvg = `<svg width="${POSTER_WIDTH}" height="1350" xmlns="http://www.w3.org/2000/svg">
  <rect width="${POSTER_WIDTH}" height="1350" fill="${t.background}"/>
  ${brandBlock(t, 48, 40)}
  ${typeBadge(t, typeLabel, 48, 560)}
  ${hookLabel(t, hook, 48, 620)}
  ${headlineBlock(t, locality, ctx.brief.tagline ?? "", 48, 680, 54)}
  ${priceCardModern(t, ctx.meta, ctx.brief, 48, 900)}
</svg>`;

  const overlay = await overlayPng(overlaySvg);
  return exportPng(t.background, [
    { input: a, top: 48, left: 48 },
    { input: b, top: 48, left: 752 },
    { input: c, top: 428, left: 752 },
    { input: overlay, top: 0, left: 0 },
  ]);
}
