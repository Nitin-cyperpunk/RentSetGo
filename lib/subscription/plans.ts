export type PlanId = "free" | "pro" | "business";

export type PlanFeature = {
  label: string;
  included: boolean;
};

export type SubscriptionPlan = {
  id: PlanId;
  name: string;
  tagline: string;
  priceInr: number;
  priceUsd: number;
  posterLimit: number | null;
  badge?: string;
  highlighted?: boolean;
  features: string[];
  cta: string;
};

export const PLANS: Record<PlanId, SubscriptionPlan> = {
  free: {
    id: "free",
    name: "Free",
    tagline: "Start listing with AI",
    priceInr: 0,
    priceUsd: 0,
    posterLimit: 2,
    features: [
      "2 AI poster generations",
      "Basic property listing",
      "Standard support",
      "Watermarked posters",
    ],
    cta: "Current Plan",
  },
  pro: {
    id: "pro",
    name: "Pro",
    tagline: "Grow your brand with AI",
    priceInr: 299,
    priceUsd: 5,
    posterLimit: 100,
    badge: "Most Popular",
    highlighted: true,
    features: [
      "100 AI poster generations / month",
      "Premium HD posters",
      "No watermark",
      "AI description generation",
      "Instagram-ready exports",
      "WhatsApp sharing",
      "SEO optimized listings",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
  },
  business: {
    id: "business",
    name: "Business",
    tagline: "Scale your real-estate portfolio",
    priceInr: 999,
    priceUsd: 15,
    posterLimit: null,
    features: [
      "Unlimited poster generations",
      "Multiple property management",
      "AI social media automation",
      "Scheduled Instagram posting",
      "Team access",
      "Analytics dashboard",
      "Premium templates",
      "API access",
      "Dedicated support",
    ],
    cta: "Get Business",
  },
};

export const PLAN_ORDER: PlanId[] = ["free", "pro", "business"];

export type ComparisonRow = {
  feature: string;
  free: string | boolean;
  pro: string | boolean;
  business: string | boolean;
};

export const COMPARISON_ROWS: ComparisonRow[] = [
  { feature: "AI poster generations", free: "2", pro: "100 / mo", business: "Unlimited" },
  { feature: "HD poster quality", free: false, pro: true, business: true },
  { feature: "Watermark removal", free: false, pro: true, business: true },
  { feature: "AI descriptions", free: false, pro: true, business: true },
  { feature: "Instagram auto-posting", free: false, pro: true, business: true },
  { feature: "Social automation", free: false, pro: false, business: true },
  { feature: "Analytics dashboard", free: false, pro: false, business: true },
  { feature: "Team access", free: false, pro: false, business: true },
  { feature: "Support", free: "Standard", pro: "Priority", business: "Dedicated" },
];

export function getPlan(id: PlanId): SubscriptionPlan {
  return PLANS[id];
}

export function posterLimitForPlan(planId: PlanId): number | null {
  return PLANS[planId].posterLimit;
}
