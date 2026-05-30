export const BRAND_FAVICON = "/favicon.ico";
export const BRAND_NAME = "RentSetGo";

/** Footer wordmark — `public/brand/fotter logo.png` */
export const BRAND_FOOTER_LOGO = "/brand/fotter logo.png";

/** Razorpay checkout logo (favicon on white background). */
export function getBrandLogoAbsoluteUrl(): string {
  const base =
    typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ??
        "http://localhost:3000");
  return `${base}${BRAND_FAVICON}`;
}
