import type { PosterRenderMeta } from "@/lib/ai/types";
import type { PosterCreativeBrief, PosterTheme } from "@/lib/ai/poster/types";
import { escapeXml, truncate } from "@/lib/ai/poster/utils";
import { POSTER_WIDTH } from "@/lib/ai/poster/constants";

const ICONS = {
  bed: '<rect x="1" y="8" width="18" height="8" rx="2"/><path d="M5 8V5a3 3 0 0 1 6 0v3"/>',
  car: '<path d="M3 14h16l-1-5H4L3 14z"/><circle cx="7" cy="15" r="1.5"/><circle cx="15" cy="15" r="1.5"/>',
  balcony: '<rect x="2" y="4" width="16" height="12" rx="1"/><path d="M6 16v2M14 16v2M2 10h16"/>',
  building: '<rect x="5" y="2" width="10" height="18" rx="1"/>',
  sofa: '<path d="M3 12h16v4H3z"/><path d="M5 12V8a2 2 0 0 1 12 0v4"/>',
};

const CARD_TEXT = "#FFFFFF";
const CARD_MUTED = "rgba(255,255,255,0.88)";

export function displayTitle(meta: PosterRenderMeta, brief: PosterCreativeBrief): string {
  const loc = meta.location ?? brief.headline ?? "Nashik";
  const clean = loc.replace(/^📍\s*/, "").trim();
  if (meta.bedrooms != null && meta.bedrooms > 0) {
    return `${meta.bedrooms}BHK · ${clean}`;
  }
  const type = meta.propertyType?.trim();
  if (type) return `${type} · ${clean}`;
  return clean;
}

export function brandBlock(theme: PosterTheme, x: number, y: number, w = 248): string {
  return `
  <g transform="translate(${x}, ${y})">
    <rect width="${w}" height="76" rx="12" fill="#FFFFFF" fill-opacity="0.96" stroke="${theme.panelStroke}" stroke-width="1"/>
    <text x="18" y="32" font-family="Segoe UI, system-ui, sans-serif" font-size="22" font-weight="800" fill="#18181b">RentSetGo</text>
    <text x="18" y="54" font-family="Segoe UI, system-ui, sans-serif" font-size="10" font-weight="600" fill="#71717a" letter-spacing="1.5">FIND · RENT · RELAX</text>
  </g>`;
}

export function hookLabel(theme: PosterTheme, hook: string, x: number, y: number): string {
  const t = escapeXml(truncate(hook.toUpperCase(), 20));
  const w = Math.min(340, t.length * 10 + 40);
  return `
  <rect x="${x}" y="${y}" width="${w}" height="36" rx="18" fill="${theme.accent}"/>
  <text x="${x + w / 2}" y="${y + 24}" text-anchor="middle" font-family="Segoe UI, system-ui, sans-serif" font-size="12" font-weight="800" letter-spacing="2" fill="#ffffff">${t}</text>`;
}

export function typeBadge(theme: PosterTheme, label: string, x: number, y: number): string {
  const t = escapeXml(truncate(label, 12));
  const w = Math.max(100, t.length * 12 + 40);
  return `
  <rect x="${x}" y="${y}" width="${w}" height="36" rx="18" fill="${theme.priceBg.startsWith("rgba") ? "#0F172A" : theme.priceBg}"/>
  <text x="${x + w / 2}" y="${y + 24}" text-anchor="middle" font-size="15" font-weight="800" fill="${CARD_TEXT}" letter-spacing="0.5">${t}</text>`;
}

/** Stacked header: badge → hook → title → tagline. Returns SVG + next Y. */
export function headerStack(
  theme: PosterTheme,
  opts: {
    x: number;
    y: number;
    hook?: string;
    badge?: string;
    title: string;
    tagline: string;
  },
): { svg: string; endY: number } {
  let cy = opts.y;
  const parts: string[] = [];

  if (opts.badge) {
    parts.push(typeBadge(theme, opts.badge, opts.x, cy));
    cy += 36 + 20;
  }

  if (opts.hook) {
    parts.push(hookLabel(theme, opts.hook, opts.x, cy));
    cy += 36 + 28;
  }

  const title = escapeXml(truncate(opts.title, 32));
  const tag = escapeXml(truncate(opts.tagline, 50));
  const len = title.length;
  const size = len > 22 ? 38 : len > 16 ? 44 : 50;

  parts.push(`
  <text x="${opts.x}" y="${cy + size}" font-family="Segoe UI, system-ui, sans-serif" font-size="${size}" font-weight="800" fill="${theme.text}">${title}</text>
  <text x="${opts.x}" y="${cy + size + 36}" font-family="Segoe UI, system-ui, sans-serif" font-size="20" font-weight="500" fill="${theme.textMuted}">${tag}</text>`);

  cy += size + 36 + 28;

  return { svg: parts.join("\n"), endY: cy };
}

export function headlineBlock(
  theme: PosterTheme,
  locality: string,
  tagline: string,
  x: number,
  y: number,
  maxSize = 56,
): string {
  return headerStack(theme, { x, y, title: locality, tagline }).svg;
}

export function featureGrid2x2(
  theme: PosterTheme,
  features: string[],
  x: number,
  y: number,
): string {
  const cols = 2;
  const cellW = 262;
  const cellH = 48;
  const gap = 10;
  const iconKeys = ["bed", "car", "balcony", "building"] as const;

  return features
    .slice(0, 4)
    .map((f, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = x + col * (cellW + gap);
      const cy = y + row * (cellH + gap);
      const t = escapeXml(truncate(f, 22));
      return `
  <g transform="translate(${cx}, ${cy})">
    <rect width="${cellW}" height="${cellH}" rx="10" fill="${theme.panel}" stroke="${theme.panelStroke}" stroke-width="1"/>
    <g transform="translate(14, 14)" fill="none" stroke="${theme.accent}" stroke-width="1.8" stroke-linecap="round">
      ${ICONS[iconKeys[i] ?? "sofa"]}
    </g>
    <text x="46" y="30" font-family="Segoe UI, system-ui, sans-serif" font-size="15" font-weight="700" fill="${theme.text}">${t}</text>
  </g>`;
    })
    .join("");
}

export function priceCardModern(
  theme: PosterTheme,
  meta: PosterRenderMeta,
  brief: PosterCreativeBrief,
  x: number,
  y: number,
): string {
  const price = escapeXml(truncate(meta.priceDisplay ?? brief.priceLine, 14));
  const label = meta.dealType === "sale" ? "Price" : "Monthly rent";
  const suffix = meta.dealType === "sale" ? "" : "/ month";
  const cta = escapeXml(truncate(brief.cta ?? "Book a visit", 18));
  const phone = escapeXml(truncate(meta.contactPhone ?? "", 14));
  const cardFill = theme.priceBg.startsWith("rgba") ? "#0F172A" : theme.priceBg;

  return `
  <rect x="${x}" y="${y}" width="392" height="268" rx="20" fill="${cardFill}"/>
  <text x="${x + 24}" y="${y + 44}" font-family="Segoe UI, system-ui, sans-serif" font-size="14" font-weight="600" fill="${CARD_MUTED}" letter-spacing="0.5">${label}</text>
  <text x="${x + 24}" y="${y + 108}" font-family="Segoe UI, system-ui, sans-serif" font-size="48" font-weight="900" fill="${CARD_TEXT}" letter-spacing="-1">${price}</text>
  <text x="${x + 24}" y="${y + 136}" font-family="Segoe UI, system-ui, sans-serif" font-size="16" font-weight="500" fill="${CARD_MUTED}">${escapeXml(suffix)}</text>
  <rect x="${x + 24}" y="${y + 158}" width="200" height="44" rx="22" fill="${theme.accent}"/>
  <text x="${x + 124}" y="${y + 187}" text-anchor="middle" font-family="Segoe UI, system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff">${cta}</text>
  ${phone ? `<text x="${x + 24}" y="${y + 238}" font-family="Segoe UI, system-ui, sans-serif" font-size="15" font-weight="600" fill="${CARD_TEXT}">${phone}</text>` : ""}`;
}

export function bottomInfoBar(
  theme: PosterTheme,
  meta: PosterRenderMeta,
  brief: PosterCreativeBrief,
): string {
  const floor = escapeXml(truncate(meta.floor ?? "—", 12));
  const type = escapeXml(truncate((meta.propertyType ?? "—").toUpperCase(), 12));
  const area = meta.bedrooms != null ? `${meta.bedrooms} BHK` : "—";
  const park =
    meta.parking === "yes" || meta.parking === "street"
      ? "Yes"
      : meta.parking === "no"
        ? "No"
        : "—";

  return `
  <rect x="0" y="1188" width="${POSTER_WIDTH}" height="162" fill="${theme.panel}"/>
  <rect x="0" y="1188" width="${POSTER_WIDTH}" height="3" fill="${theme.accent}"/>
  <text x="72" y="1236" font-size="11" font-weight="700" fill="${theme.textMuted}" letter-spacing="1.2">CONFIG</text>
  <text x="72" y="1264" font-size="17" font-weight="700" fill="${theme.text}">${escapeXml(area)}</text>
  <text x="320" y="1236" font-size="11" font-weight="700" fill="${theme.textMuted}" letter-spacing="1.2">FLOOR</text>
  <text x="320" y="1264" font-size="17" font-weight="700" fill="${theme.text}">${floor}</text>
  <text x="560" y="1236" font-size="11" font-weight="700" fill="${theme.textMuted}" letter-spacing="1.2">TYPE</text>
  <text x="560" y="1264" font-size="17" font-weight="700" fill="${theme.text}">${type}</text>
  <text x="800" y="1236" font-size="11" font-weight="700" fill="${theme.textMuted}" letter-spacing="1.2">PARKING</text>
  <text x="800" y="1264" font-size="17" font-weight="700" fill="${theme.text}">${escapeXml(park)}</text>`;
}

export function featurePills(theme: PosterTheme, features: string[], x: number, y: number): string {
  return featureGrid2x2(theme, features, x, y);
}

export function megaHeadline(theme: PosterTheme, locality: string, tagline: string, x: number, y: number): string {
  return headerStack(theme, { x, y, title: locality, tagline }).svg;
}

export function megaPriceBlock(
  theme: PosterTheme,
  meta: PosterRenderMeta,
  brief: PosterCreativeBrief,
  x: number,
  y: number,
): string {
  return priceCardModern(theme, meta, brief, x, y);
}

export function priceCtaBlock(
  theme: PosterTheme,
  meta: PosterRenderMeta,
  brief: PosterCreativeBrief,
  x: number,
  y: number,
): string {
  return priceCardModern(theme, meta, brief, x, y);
}

export function accentBlobs(): string {
  return "";
}

export function diagonalBand(): string {
  return "";
}

export function featureRowsSvg(
  theme: PosterTheme,
  features: string[],
  startY: number,
  startX = 56,
): string {
  return featureGrid2x2(theme, features, startX, startY);
}
