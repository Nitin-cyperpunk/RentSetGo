import type { MetadataRoute } from "next";

import { listActivePropertiesForSitemap } from "@/lib/queries/properties";
import { CONTENT_ROUTES, getSiteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/support`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    ...CONTENT_ROUTES.map((route) => ({
      url: `${base}${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
  ];

  let listings: Awaited<ReturnType<typeof listActivePropertiesForSitemap>> = [];
  try {
    listings = await listActivePropertiesForSitemap();
  } catch (err) {
    console.error("[sitemap] listings", err);
  }

  const propertyRoutes: MetadataRoute.Sitemap = listings.map((p) => ({
    url: `${base}/property/${p.id}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : p.created_at ? new Date(p.created_at) : now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...propertyRoutes];
}
