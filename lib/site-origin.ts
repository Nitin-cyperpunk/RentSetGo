import { headers } from "next/headers";

/**
 * Absolute origin for auth redirect URLs (e.g. password reset).
 * Prefer NEXT_PUBLIC_SITE_URL in production so redirects match your public URL behind proxies.
 */
export async function getSiteOrigin(): Promise<string> {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (!host) return "http://localhost:3000";
  return `${proto}://${host}`;
}
