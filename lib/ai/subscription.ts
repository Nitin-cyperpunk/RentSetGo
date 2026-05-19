export const FREE_POSTER_GENERATION_LIMIT = 6;

export type SubscriptionStatus = "free" | "active" | "canceled" | "past_due";

export type ProfileSubscription = {
  poster_generation_count: number;
  subscription_status: string | null;
  subscription_expiry: string | null;
};

export function isProSubscriber(profile: ProfileSubscription): boolean {
  if (profile.subscription_status !== "active") return false;
  if (!profile.subscription_expiry) return true;
  return new Date(profile.subscription_expiry).getTime() > Date.now();
}

export function canGeneratePoster(profile: ProfileSubscription): boolean {
  if (isProSubscriber(profile)) return true;
  return (profile.poster_generation_count ?? 0) < FREE_POSTER_GENERATION_LIMIT;
}

export function remainingFreePosters(profile: ProfileSubscription): number {
  if (isProSubscriber(profile)) return Infinity;
  return Math.max(
    0,
    FREE_POSTER_GENERATION_LIMIT - (profile.poster_generation_count ?? 0)
  );
}
