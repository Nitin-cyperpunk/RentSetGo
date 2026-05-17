import sharp from "sharp";

import type { PosterTaglines } from "@/lib/ai/types";

const WIDTH = 1080;
const HEIGHT = 1350;

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildOverlaySvg(taglines: PosterTaglines): string {
  const headline = escapeXml(taglines.headline);
  const location = escapeXml(taglines.locationLine);
  const price = escapeXml(taglines.priceLine);
  const bullets = taglines.bullets.slice(0, 4).map((b) => escapeXml(b));

  const bulletY = [720, 790, 860, 930];
  const bulletTexts = bullets
    .map(
      (b, i) =>
        `<text x="72" y="${bulletY[i]}" font-family="system-ui,Segoe UI,sans-serif" font-size="34" font-weight="500" fill="#f4f4f5">${b}</text>`,
    )
    .join("\n");

  return `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.15"/>
      <stop offset="45%" stop-color="#000000" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.88"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#059669"/>
      <stop offset="100%" stop-color="#0d9488"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect x="0" y="0" width="100%" height="8" fill="url(#accent)"/>
  <text x="72" y="1020" font-family="system-ui,Segoe UI,sans-serif" font-size="52" font-weight="700" fill="#ffffff">${headline}</text>
  ${bulletTexts}
  <text x="72" y="1120" font-family="system-ui,Segoe UI,sans-serif" font-size="36" font-weight="600" fill="#6ee7b7">${location}</text>
  <text x="72" y="1190" font-family="system-ui,Segoe UI,sans-serif" font-size="44" font-weight="700" fill="#ffffff">${price}</text>
  <text x="72" y="1280" font-family="system-ui,Segoe UI,sans-serif" font-size="28" font-weight="600" fill="#a7f3d0" letter-spacing="2">ONLY ON RENTSETGO</text>
  <text x="72" y="1318" font-family="system-ui,Segoe UI,sans-serif" font-size="22" fill="#d4d4d8">rentsetgo.in</text>
</svg>`;
}

export async function renderPropertyPoster(
  coverImageUrl: string,
  taglines: PosterTaglines,
): Promise<Buffer> {
  const res = await fetch(coverImageUrl, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Could not fetch property image (${res.status})`);
  }
  const imageBuffer = Buffer.from(await res.arrayBuffer());

  const base = await sharp(imageBuffer)
    .resize(WIDTH, HEIGHT, { fit: "cover", position: "centre" })
    .jpeg({ quality: 88 })
    .toBuffer();

  const overlay = Buffer.from(buildOverlaySvg(taglines));

  return sharp(base)
    .composite([{ input: overlay, top: 0, left: 0 }])
    .png()
    .toBuffer();
}

export function fallbackPosterTaglines(
  title: string,
  location: string | null,
  priceLine: string,
  furnishing?: string | null,
): PosterTaglines {
  return {
    headline: title.slice(0, 40) || "Premium Listing",
    bullets: [
      furnishing ? `🛋️ ${furnishing}` : "✨ Premium home",
      "🌿 Balcony & comfort",
      "🏙️ Great location",
      "👨‍👩‍👧 Ideal for families",
    ],
    locationLine: location ? `📍 ${location}` : "📍 Nashik",
    priceLine: priceLine,
  };
}
