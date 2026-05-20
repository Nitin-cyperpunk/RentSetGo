import { PricingPage } from "@/components/pricing/pricing-page";
import { createClient } from "@/lib/supabase/server";

import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Pricing — RentSetGo Pro AI Marketing",
  description:
    "Upgrade to RentSetGo Pro — premium AI posters, descriptions, and social automation for property owners in India.",
  path: "/pricing",
  keywords: [
    "AI real estate marketing",
    "property poster generator",
    "RentSetGo Pro",
    "landlord marketing automation",
  ],
});

export default async function PricingRoute() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <PricingPage isAuthenticated={Boolean(user)} />;
}
