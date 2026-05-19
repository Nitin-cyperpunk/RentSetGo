import sharp from "sharp";

import {
  bottomInfoBar,
  brandBlock,
  hookLabel,
  headlineBlock,
  priceCardModern,
} from "@/lib/ai/poster/shared-ui";
import type { PosterComposeContext } from "@/lib/ai/poster/types";
import { exportPng, overlayPng, POSTER_HEIGHT, POSTER_WIDTH } from "@/lib/ai/poster/utils";

export async function renderCinematicLetterbox(ctx: PosterComposeContext): Promise<Buffer> {
  const bar = 160;
  const heroH = POSTER_HEIGHT - bar * 2;

  const hero = await sharp(ctx.buffers[0]!)
    .resize(POSTER_WIDTH, heroH, { fit: "cover" })
    .modulate({ brightness: 0.9, saturation: 1.15 })
    .toBuffer();

  const locality = ctx.meta.location ?? ctx.brief.headline;
  const t = ctx.theme;
  const hook = ctx.brief.hook ?? "LIVE THE LUXURY";

  const overlaySvg = `<svg width="${POSTER_WIDTH}" height="${POSTER_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect y="0" width="${POSTER_WIDTH}" height="${bar}" fill="#0c0a09"/>
  <rect y="${bar + heroH}" width="${POSTER_WIDTH}" height="${bar}" fill="#0c0a09"/>
  <line x1="0" y1="${bar}" x2="${POSTER_WIDTH}" y2="${bar}" stroke="${t.accent}" stroke-width="3"/>
  <line x1="0" y1="${bar + heroH}" x2="${POSTER_WIDTH}" y2="${bar + heroH}" stroke="${t.accent}" stroke-width="3"/>
  ${brandBlock(t, 48, 36, 200)}
  ${hookLabel(t, hook, 48, bar + 24)}
  ${headlineBlock(t, locality, ctx.brief.tagline ?? "", 48, bar + 80, 56)}
  ${priceCardModern(t, ctx.meta, ctx.brief, 640, bar + 16)}
  ${bottomInfoBar(t, ctx.meta, ctx.brief)}
</svg>`;

  const overlay = await overlayPng(overlaySvg);
  return exportPng("#0c0a09", [
    { input: hero, top: bar, left: 0 },
    { input: overlay, top: 0, left: 0 },
  ]);
}
