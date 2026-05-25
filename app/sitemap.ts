import type { MetadataRoute } from "next";

import { listActivePropertySlugsForSitemap } from "@/lib/queries/properties";
import { propertyPath } from "@/lib/property-slug";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/support`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  let listings: Awaited<ReturnType<typeof listActivePropertySlugsForSitemap>> = [];
  try {
    listings = await listActivePropertySlugsForSitemap();
  } catch (err) {
    console.error("[sitemap] listings", err);
  }

  const propertyRoutes: MetadataRoute.Sitemap = listings.map((p) => ({
    url: `${base}${propertyPath(p.slug)}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : now,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [...staticRoutes, ...propertyRoutes];
}
