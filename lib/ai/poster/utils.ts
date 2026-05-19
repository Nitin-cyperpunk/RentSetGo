import sharp from "sharp";

import type { PosterRenderMeta } from "@/lib/ai/types";
import { POSTER_HEIGHT, POSTER_WIDTH } from "@/lib/ai/poster/constants";

export { POSTER_WIDTH, POSTER_HEIGHT };

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export async function fetchImage(url: string): Promise<Buffer> {
  const res = await fetch(url, {
    cache: "no-store",
    headers: { Accept: "image/*" },
  });
  if (!res.ok) {
    throw new Error(`Image fetch failed (${res.status}) for ${url.slice(0, 80)}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

export async function loadImageBuffers(urls: string[]): Promise<Buffer[]> {
  const list = [...urls].filter(Boolean).slice(0, 3);
  if (!list.length) throw new Error("At least one property image is required");
  while (list.length < 3) list.push(list[0]!);
  return Promise.all(list.map((u) => fetchImage(u)));
}

export async function roundedPhoto(
  buffer: Buffer,
  w: number,
  h: number,
  radius: number,
): Promise<Buffer> {
  const resized = await sharp(buffer)
    .resize(w, h, { fit: "cover", position: "centre" })
    .toBuffer();

  const mask = Buffer.from(
    `<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${radius}" ry="${radius}" fill="white"/></svg>`,
  );

  return sharp(resized)
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
}

export async function overlayPng(svg: string): Promise<Buffer> {
  return sharp(Buffer.from(svg)).png().toBuffer();
}

export async function exportPng(
  background: string,
  layers: { input: Buffer; top: number; left: number }[],
): Promise<Buffer> {
  return sharp({
    create: {
      width: POSTER_WIDTH,
      height: POSTER_HEIGHT,
      channels: 3,
      background,
    },
  })
    .composite(layers)
    .png({ compressionLevel: 8 })
    .toBuffer();
}

export function buildFeatures(meta: PosterRenderMeta, bullets: string[]): string[] {
  const fromBullets = bullets.slice(0, 4).filter(Boolean);
  if (fromBullets.length >= 4) return fromBullets;

  const auto: string[] = [];
  if (meta.bedrooms != null) {
    auto.push(`${meta.bedrooms} Spacious Bedroom${meta.bedrooms > 1 ? "s" : ""}`);
  }
  if (meta.parking && meta.parking !== "no") auto.push("Parking Included");
  if (meta.balcony && meta.balcony !== "no") auto.push("Balcony with View");
  if (meta.floor) {
    auto.push(meta.floor.match(/floor/i) ? meta.floor : `${meta.floor} Floor`);
  }
  if (meta.furnishing) {
    const f = meta.furnishing.replace(/-/g, " ");
    auto.push(f.charAt(0).toUpperCase() + f.slice(1));
  }
  auto.push("Good for Family");

  const merged = [...fromBullets];
  for (const line of auto) {
    if (merged.length >= 4) break;
    if (!merged.some((m) => m.toLowerCase().includes(line.slice(0, 8).toLowerCase()))) {
      merged.push(line);
    }
  }
  return merged.slice(0, 4);
}

export function parkingLabel(meta: PosterRenderMeta): string {
  if (meta.parking === "yes" || meta.parking === "street") return "Available";
  if (meta.parking === "no") return "No";
  return "—";
}
