import sharp from "sharp";

import { POSTER_LAYOUT } from "@/lib/ai/poster/layout-metrics";
import {
  bottomInfoBar,
  brandBlock,
  displayTitle,
  featureGrid2x2,
  headerStack,
  priceCardModern,
} from "@/lib/ai/poster/shared-ui";
import type { PosterComposeContext } from "@/lib/ai/poster/types";
import {
  exportPng,
  overlayPng,
  POSTER_HEIGHT,
  POSTER_WIDTH,
} from "@/lib/ai/poster/utils";

const { heroH, contentTop, pad, gutter, priceCardW, leftColW } = POSTER_LAYOUT;

/** Single polished layout — used as default for most styles */
export async function renderListingShowcase(ctx: PosterComposeContext): Promise<Buffer> {
  const { buffers, brief, meta, theme, features } = ctx;
  const t = theme;

  const hero = await sharp(buffers[0]!)
    .resize(POSTER_WIDTH, heroH, { fit: "cover", position: "centre" })
    .toBuffer();

  const title = displayTitle(meta, brief);
  const typeLabel = (meta.propertyType ?? "FLAT").toUpperCase().replace(/\s+/g, " ");
  const hook = brief.hook ?? "Ready to move in";

  const contentY = contentTop + pad;
  const header = headerStack(t, {
    x: pad,
    y: contentY,
    badge: typeLabel,
    hook,
    title,
    tagline: brief.tagline ?? "Comfort · Convenience · Family living",
  });

  const gridY = header.endY + gutter;
  const priceX = POSTER_WIDTH - pad - priceCardW;
  const priceY = contentY;

  const overlaySvg = `<svg width="${POSTER_WIDTH}" height="${POSTER_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="heroShade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="55%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.35"/>
    </linearGradient>
  </defs>

  <rect x="0" y="${contentTop}" width="${POSTER_WIDTH}" height="${POSTER_HEIGHT - contentTop}" fill="${t.background}"/>
  <rect x="0" y="${heroH - 100}" width="${POSTER_WIDTH}" height="120" fill="url(#heroShade)"/>

  ${brandBlock(t, POSTER_WIDTH - pad - 248, heroH - 96)}
  ${header.svg}
  ${featureGrid2x2(t, features, pad, gridY)}
  ${priceCardModern(t, meta, brief, priceX, priceY)}
  ${bottomInfoBar(t, meta, brief)}
</svg>`;

  const overlay = await overlayPng(overlaySvg);

  return exportPng(t.background, [
    { input: hero, top: 0, left: 0 },
    { input: overlay, top: 0, left: 0 },
  ]);
}
