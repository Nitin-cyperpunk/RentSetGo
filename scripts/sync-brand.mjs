/**
 * Sync rentsetgo-favicon.ico → app + public favicon.
 */
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const source = join(root, "rentsetgo-favicon.ico");

const targets = [
  join(root, "app", "favicon.ico"),
  join(root, "public", "favicon.ico"),
];

for (const dest of targets) {
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(source, dest);
  console.log(`Synced ${source} → ${dest}`);
}
