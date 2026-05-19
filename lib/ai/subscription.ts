import {
  type PlanId,
  posterLimitForPlan,
} from "@/lib/subscription/plans";

export const FREE_POSTER_GENERATION_LIMIT = 2;

export type SubscriptionStatus = "free" | "active" | "canceled" | "past_due";

export type ProfileSubscription = {
  poster_generation_count: number;
  subscription_status: string | null;
  subscription_plan: string | null;
  subscription_expiry: string | null;
};

function isSubscriptionActive(profile: ProfileSubscription): boolean {
  if (profile.subscription_status !== "active") return false;
  if (!profile.subscription_expiry) return true;
  return new Date(profile.subscription_expiry).getTime() > Date.now();
}

export function getActivePlan(profile: ProfileSubscription): PlanId {
  if (!isSubscriptionActive(profile)) return "free";
  const plan = profile.subscription_plan;
  if (plan === "pro" || plan === "business") return plan;
  return "free";
}

export function isProSubscriber(profile: ProfileSubscription): boolean {
  const plan = getActivePlan(profile);
  return plan === "pro" || plan === "business";
}

export function isBusinessSubscriber(profile: ProfileSubscription): boolean {
  return getActivePlan(profile) === "business";
}

export function canGeneratePoster(profile: ProfileSubscription): boolean {
  const plan = getActivePlan(profile);
  const limit = posterLimitForPlan(plan);
  if (limit === null) return true;
  return (profile.poster_generation_count ?? 0) < limit;
}

export function remainingPosters(profile: ProfileSubscription): number {
  const plan = getActivePlan(profile);
  const limit = posterLimitForPlan(plan);
  if (limit === null) return Infinity;
  return Math.max(0, limit - (profile.poster_generation_count ?? 0));
}

/** @deprecated use remainingPosters */
export function remainingFreePosters(profile: ProfileSubscription): number {
  return remainingPosters(profile);
}
