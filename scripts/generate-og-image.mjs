/**
 * Writes public/og-image.png (1200×630) for static OG references (WhatsApp, etc.).
 * Run: node scripts/generate-og-image.mjs
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "..", "public", "og-image.png");

const W = 1200;
const H = 630;

const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#09090b"/>
      <stop offset="50%" style="stop-color:#18181b"/>
      <stop offset="100%" style="stop-color:#0f172a"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10b981"/>
      <stop offset="100%" style="stop-color:#06b6d4"/>
    </linearGradient>
    <radialGradient id="glow1" cx="20%" cy="10%" r="50%">
      <stop offset="0%" style="stop-color:#10b981;stop-opacity:0.35"/>
      <stop offset="100%" style="stop-color:#10b981;stop-opacity:0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="90%" cy="80%" r="45%">
      <stop offset="0%" style="stop-color:#06b6d4;stop-opacity:0.2"/>
      <stop offset="100%" style="stop-color:#06b6d4;stop-opacity:0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect width="100%" height="100%" fill="url(#glow1)"/>
  <rect width="100%" height="100%" fill="url(#glow2)"/>
  <rect x="856" y="120" width="280" height="360" rx="24" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
  <rect x="880" y="144" width="232" height="140" rx="12" fill="url(#accent)" opacity="0.85"/>
  <rect x="880" y="300" width="162" height="12" rx="6" fill="rgba(255,255,255,0.2)"/>
  <rect x="880" y="324" width="116" height="12" rx="6" fill="rgba(255,255,255,0.12)"/>
  <rect x="880" y="420" width="232" height="44" rx="10" fill="rgba(16,185,129,0.35)"/>
  <text x="992" y="450" font-family="Segoe UI, system-ui, sans-serif" font-size="16" font-weight="700" fill="#fafafa" text-anchor="middle">AI Poster Ready</text>
  <rect x="64" y="56" width="52" height="52" rx="14" fill="url(#accent)"/>
  <text x="92" y="92" font-family="Segoe UI, system-ui, sans-serif" font-size="26" font-weight="800" fill="#fff" text-anchor="middle">R</text>
  <text x="132" y="92" font-family="Segoe UI, system-ui, sans-serif" font-size="28" font-weight="800" fill="#fafafa">RentSetGo</text>
  <text x="64" y="280" font-family="Segoe UI, system-ui, sans-serif" font-size="52" font-weight="800" fill="#fafafa">AI Powered Property</text>
  <text x="64" y="348" font-family="Segoe UI, system-ui, sans-serif" font-size="52" font-weight="800" fill="#fafafa">Listing &amp; Marketing</text>
  <text x="64" y="420" font-family="Segoe UI, system-ui, sans-serif" font-size="22" fill="rgba(250,250,250,0.78)">List properties, generate AI posters, automate marketing, connect with tenants.</text>
  <text x="64" y="560" font-family="Segoe UI, system-ui, sans-serif" font-size="18" fill="rgba(250,250,250,0.55)">AI Powered Property Listing &amp; Marketing Platform</text>
  <text x="1136" y="560" font-family="Segoe UI, system-ui, sans-serif" font-size="18" fill="rgba(250,250,250,0.55)" text-anchor="end">rentsetgo · India</text>
</svg>
`;

const buffer = await sharp(Buffer.from(svg)).png().toBuffer();
writeFileSync(outPath, buffer);
console.log(`Wrote ${outPath}`);
