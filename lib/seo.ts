import type { Metadata } from "next";

import type { PropertyWithImages } from "@/types/property";
import { coverImageUrl } from "@/types/property";

/** Public site URL — set NEXT_PUBLIC_SITE_URL in Vercel (e.g. https://rentsetgo.in). */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return "http://localhost:3000";
}

export const SITE_NAME = "RentSetGo";

export const SITE_TAGLINE = "AI Powered Property Listing & Marketing Platform";

export const DEFAULT_TITLE =
  "RentSetGo — AI Powered Property Listing & Marketing Platform";

export const DEFAULT_DESCRIPTION =
  "List properties, generate AI-powered real-estate posters, automate Instagram marketing, and connect directly with tenants using RentSetGo.";

export const DEFAULT_KEYWORDS = [
  "property rental platform",
  "AI real estate posters",
  "apartment listings",
  "rental properties India",
  "house rent AI marketing",
  "property automation platform",
  "flats for rent",
  "property listings Mumbai",
  "apartment rental platform",
  "house rent website India",
  "rental marketplace",
  "flats for rent Nashik",
  "AI real-estate marketing",
];

/** Social profiles — update when live accounts exist. */
export const SOCIAL_LINKS = {
  website: getSiteUrl(),
  // twitter: "https://twitter.com/rentsetgo",
  // instagram: "https://instagram.com/rentsetgo",
  // linkedin: "https://linkedin.com/company/rentsetgo",
} as const;

export const OG_IMAGE_PATH = "/og-image.png";
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

export function absoluteUrl(path = ""): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function ogImageUrl(path = OG_IMAGE_PATH): string {
  return absoluteUrl(path);
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function slugifySegment(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

/** SEO-friendly path segment: `1bhk-govind-nagar-mumbai-a1b2c3d4`. */
export function propertySlug(
  property: Pick<PropertyWithImages, "id" | "title" | "location" | "property_type">,
): string {
  const parts = [
    property.property_type,
    property.title,
    property.location ?? "",
  ].filter(Boolean);
  const base = slugifySegment(parts.join(" ")) || "property";
  const shortId = property.id.replace(/-/g, "").slice(0, 8).toLowerCase();
  return `${base}-${shortId}`;
}

export function propertyPath(
  property: Pick<
    PropertyWithImages,
    "id" | "title" | "location" | "property_type" | "slug"
  >,
): string {
  const dbSlug = property.slug?.trim();
  if (dbSlug) return `/property/${dbSlug}`;
  return `/property/${propertySlug(property)}`;
}

/** Resolve route param to a property UUID (full id or 8-char prefix). */
export function resolvePropertyIdFromParam(param: string): {
  mode: "uuid" | "prefix" | "invalid";
  value: string;
} {
  const trimmed = param.trim();
  if (UUID_RE.test(trimmed)) {
    return { mode: "uuid", value: trimmed };
  }
  const suffix = trimmed.split("-").pop() ?? "";
  if (/^[0-9a-f]{8}$/i.test(suffix)) {
    return { mode: "prefix", value: suffix.toLowerCase() };
  }
  return { mode: "invalid", value: trimmed };
}

export function propertyPageTitle(
  property: Pick<PropertyWithImages, "title" | "location" | "property_type" | "furnishing">,
): string {
  const locationPart = property.location ? ` in ${property.location}` : "";
  const furnish =
    property.furnishing && property.furnishing !== "Unfurnished"
      ? ` | ${property.furnishing}`
      : "";
  return `${property.title}${locationPart}${furnish}`;
}

export function propertyMetaDescription(
  property: Pick<
    PropertyWithImages,
    "title" | "location" | "description" | "property_type" | "furnishing" | "deal_type"
  >,
): string {
  const raw = property.description?.trim();
  if (raw && raw.length > 20) {
    return raw.length <= 160 ? raw : `${raw.slice(0, 157)}…`;
  }
  const loc = property.location ? ` in ${property.location}` : "";
  const furnish = property.furnishing ? ` ${property.furnishing.toLowerCase()}` : "";
  const deal = property.deal_type === "sale" ? "for sale" : "for rent";
  return `Explore this${furnish} ${property.property_type}${loc} ${deal}. Contact the owner directly on RentSetGo — AI posters and marketing included.`;
}

export function propertyKeywords(
  property: Pick<
    PropertyWithImages,
    "title" | "location" | "property_type" | "deal_type" | "category"
  >,
): string[] {
  const loc = property.location?.trim();
  return [
    property.title,
    loc ? `${property.property_type} ${loc}` : property.property_type,
    loc ? `property listings ${loc}` : "property listings India",
    property.deal_type === "sale" ? "property for sale" : "flat for rent",
    "RentSetGo",
    "AI real estate posters",
    property.category === "commercial" ? "commercial property rent" : "apartment rental",
  ].filter(Boolean);
}

export function posterImageAlt(
  property: Pick<PropertyWithImages, "title" | "location" | "property_type">,
): string {
  const loc = property.location ? ` in ${property.location}` : "";
  return `${property.property_type} ${property.title}${loc} — AI marketing poster by RentSetGo`;
}

type PageMetadataOptions = {
  title: string;
  description?: string;
  path?: string;
  keywords?: string[];
  ogImage?: string | null;
  noIndex?: boolean;
  type?: "website" | "article";
};

/** Reusable metadata for static and dynamic pages. */
export function buildPageMetadata(options: PageMetadataOptions): Metadata {
  const description = options.description ?? DEFAULT_DESCRIPTION;
  const canonical = options.path ? absoluteUrl(options.path) : undefined;
  const image = options.ogImage ?? ogImageUrl();
  const title = options.title;

  return {
    title,
    description,
    keywords: options.keywords ?? DEFAULT_KEYWORDS,
    alternates: canonical ? { canonical } : undefined,
    robots: options.noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      title,
      description,
      url: canonical ?? absoluteUrl(),
      siteName: SITE_NAME,
      locale: "en_IN",
      type: options.type ?? "website",
      images: [
        {
          url: image,
          width: OG_IMAGE_WIDTH,
          height: OG_IMAGE_HEIGHT,
          alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export function buildPropertyMetadata(property: PropertyWithImages): Metadata {
  const path = propertyPath(property);
  const title = propertyPageTitle(property);
  const description = propertyMetaDescription(property);
  const cover = coverImageUrl(property);
  const image = cover ?? ogImageUrl();

  return buildPageMetadata({
    title,
    description,
    path,
    keywords: propertyKeywords(property),
    ogImage: image,
    type: "article",
  });
}

export function organizationJsonLd() {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url,
    logo: ogImageUrl(),
    description: DEFAULT_DESCRIPTION,
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    sameAs: Object.values(SOCIAL_LINKS).filter(
      (link) => link !== url && typeof link === "string",
    ),
  };
}

export function websiteJsonLd() {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url,
    description: DEFAULT_DESCRIPTION,
    inLanguage: "en-IN",
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function realEstateListingJsonLd(property: PropertyWithImages) {
  const path = propertyPath(property);
  const images = (property.property_images ?? [])
    .map((img) => img.image_url)
    .filter(Boolean);
  const deal = property.deal_type === "sale" ? "ForSale" : "ForRent";

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: propertyMetaDescription(property),
    url: absoluteUrl(path),
    datePosted: property.created_at,
    image: images.length ? images : [ogImageUrl()],
    address: property.location
      ? {
          "@type": "PostalAddress",
          addressLocality: property.location,
          addressCountry: "IN",
        }
      : undefined,
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      businessFunction: `http://purl.org/goodrelations/v1#${deal}`,
    },
    numberOfRooms: property.bedrooms ?? undefined,
    floorSize: property.area_sqft
      ? {
          "@type": "QuantitativeValue",
          value: property.area_sqft,
          unitCode: "FTK",
        }
      : undefined,
  };
}

/** Future blog/content routes — register here for sitemap growth. */
export const CONTENT_ROUTES: { path: string; changeFrequency: "weekly" | "monthly"; priority: number }[] =
  [
    // { path: "/blog/rental-guide", changeFrequency: "monthly", priority: 0.6 },
  ];
