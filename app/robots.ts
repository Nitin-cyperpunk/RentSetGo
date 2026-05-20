import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/seo";

const PRIVATE_PREFIXES = [
  "/owner",
  "/api",
  "/auth",
  "/login",
  "/signup",
  "/forgot-password",
  "/favorites",
];

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: PRIVATE_PREFIXES,
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: PRIVATE_PREFIXES,
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE_PREFIXES,
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
