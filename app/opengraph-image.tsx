import { renderOgImage } from "@/lib/seo/og-image";

export const runtime = "edge";
export const alt = "RentSetGo — AI property listings and marketing";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage();
}
