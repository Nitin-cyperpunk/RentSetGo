import { getSiteUrl } from "@/lib/seo";

/** Plain-text summary for AI crawlers (`/llms.txt`). */
export function getLlmsTxt(): string {
  const site = getSiteUrl();
  return `# RentSetGo

> AI-powered property listing and marketing platform for India.

- List rental and sale properties
- Generate AI real-estate posters and descriptions
- Connect tenants with owners directly (no broker layer)
- Pro plans: social marketing automation for landlords

Public site: ${site}
`;
}
