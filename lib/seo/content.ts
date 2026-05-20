import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo";

/** Future blog / guide pages — extend this list and add routes under `app/blog/`. */
export type ContentArticle = {
  slug: string;
  title: string;
  description: string;
  keywords?: string[];
  publishedAt?: string;
};

export const PLANNED_ARTICLES: ContentArticle[] = [
  {
    slug: "rental-guide-nashik",
    title: "Complete Rental Guide for Nashik Tenants",
    description: "Tips for finding flats, negotiating rent, and avoiding common rental pitfalls in Nashik.",
    keywords: ["rental guide Nashik", "tenant tips India"],
  },
  {
    slug: "ai-real-estate-marketing",
    title: "AI Real-Estate Marketing for Landlords",
    description: "How AI posters and automated social posts help property owners fill vacancies faster.",
    keywords: ["AI real estate marketing", "property poster generator"],
  },
];

export function buildArticleMetadata(article: ContentArticle): Metadata {
  return buildPageMetadata({
    title: article.title,
    description: article.description,
    path: `/blog/${article.slug}`,
    keywords: article.keywords,
    type: "article",
  });
}
