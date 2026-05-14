import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const root = process.cwd();
const src = join(root, "QR", "kotakqr.jpeg");
const dest = join(root, "public", "qr", "kotakqr.jpeg");

if (!existsSync(src)) {
  console.error("Missing QR/kotakqr.jpeg — add your UPI QR there first.");
  process.exit(1);
}

mkdirSync(dirname(dest), { recursive: true });
copyFileSync(src, dest);
console.log("Synced QR/kotakqr.jpeg → public/qr/kotakqr.jpeg");
