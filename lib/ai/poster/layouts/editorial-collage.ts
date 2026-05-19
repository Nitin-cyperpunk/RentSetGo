import sharp from "sharp";

import {
  bottomInfoBar,
  brandBlock,
  featureGrid2x2,
  headlineBlock,
  hookLabel,
  priceCardModern,
  typeBadge,
} from "@/lib/ai/poster/shared-ui";
import type { PosterComposeContext } from "@/lib/ai/poster/types";
import {
  exportPng,
  overlayPng,
  POSTER_HEIGHT,
  POSTER_WIDTH,
  roundedPhoto,
} from "@/lib/ai/poster/utils";

/** Fixed magazine layout — strict zones, no text/photo overlap */
const HERO_H = 500;
const CONTENT_TOP = 500;
const GALLERY_Y = 868;
const GALLERY_H = 288;

export async function renderEditorialCollage(ctx: PosterComposeContext): Promise<Buffer> {
  const { buffers, brief, meta, theme, features } = ctx;
  const [heroBuf, leftBuf, rightBuf] = buffers;

  const locality = meta.location ?? brief.headline ?? meta.title ?? "Prime Location";
  const typeLabel = (meta.propertyType ?? "FLAT").toUpperCase().replace(/\s+/g, " ");
  const hook = brief.hook ?? "MOVE IN NOW";

  const hero = await sharp(heroBuf)
    .resize(POSTER_WIDTH, HERO_H, { fit: "cover", position: "centre" })
    .toBuffer();

  const thumbW = 488;
  const thumbLeft = await roundedPhoto(leftBuf, thumbW, GALLERY_H, 24);
  const thumbRight = await roundedPhoto(rightBuf, thumbW, GALLERY_H, 24);

  const overlaySvg = `<svg width="${POSTER_WIDTH}" height="${POSTER_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="heroFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${theme.background}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${theme.background}" stop-opacity="1"/>
    </linearGradient>
  </defs>

  <!-- solid content panel (all typography lives here) -->
  <rect x="0" y="${CONTENT_TOP}" width="${POSTER_WIDTH}" height="${GALLERY_Y - CONTENT_TOP}" fill="${theme.background}"/>
  <rect x="0" y="${HERO_H - 80}" width="${POSTER_WIDTH}" height="120" fill="url(#heroFade)"/>

  ${brandBlock(theme, 792, 24, 248)}
  ${typeBadge(theme, typeLabel, 48, CONTENT_TOP + 28)}
  ${hookLabel(theme, hook, 48, CONTENT_TOP + 88)}
  ${headlineBlock(theme, locality, brief.tagline ?? "", 48, CONTENT_TOP + 148, 56)}
  ${featureGrid2x2(theme, features, 48, CONTENT_TOP + 248)}
  ${priceCardModern(theme, meta, brief, 620, CONTENT_TOP + 28)}

  <!-- gallery slot guides (behind photos) -->
  <rect x="48" y="${GALLERY_Y}" width="${thumbW}" height="${GALLERY_H}" rx="24" fill="${theme.panel}" stroke="${theme.panelStroke}" stroke-width="2"/>
  <rect x="544" y="${GALLERY_Y}" width="${thumbW}" height="${GALLERY_H}" rx="24" fill="${theme.panel}" stroke="${theme.panelStroke}" stroke-width="2"/>

  ${bottomInfoBar(theme, meta, brief)}
</svg>`;

  const overlay = await overlayPng(overlaySvg);

  return exportPng(theme.background, [
    { input: hero, top: 0, left: 0 },
    { input: thumbLeft, top: GALLERY_Y, left: 48 },
    { input: thumbRight, top: GALLERY_Y, left: 544 },
    { input: overlay, top: 0, left: 0 },
  ]);
}
