import { PricingPage } from "@/components/pricing/pricing-page";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Pricing · RentSetGo",
  description:
    "Upgrade to RentSetGo Pro — premium AI posters, descriptions, and social automation for property owners.",
};

export default async function PricingRoute() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <PricingPage isAuthenticated={Boolean(user)} />;
}
