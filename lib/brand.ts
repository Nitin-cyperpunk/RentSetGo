export const BRAND_FAVICON = "/favicon.ico";
export const BRAND_NAME = "RentSetGo";

/** Razorpay checkout logo (favicon on white background). */
export function getBrandLogoAbsoluteUrl(): string {
  const base =
    typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ??
        "http://localhost:3000");
  return `${base}${BRAND_FAVICON}`;
}
