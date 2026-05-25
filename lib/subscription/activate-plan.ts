import type { PlanId } from "@/lib/subscription/plans";
import { subscriptionExpiryFromNow } from "@/lib/subscription/razorpay-server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type PaidPlanId = Exclude<PlanId, "free">;

async function getDb(useAdmin: boolean) {
  return useAdmin ? createAdminClient() : await createClient();
}

/** Activate subscription on profiles (session client or service role for webhooks). */
export async function activatePlanForUser(
  userId: string,
  planId: PaidPlanId,
  options?: { useAdmin?: boolean },
): Promise<{ success: boolean; error?: string }> {
  const supabase = await getDb(Boolean(options?.useAdmin));
  const expiry = subscriptionExpiryFromNow();

  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_status: "active",
      subscription_plan: planId,
      subscription_expiry: expiry,
    })
    .eq("id", userId);

  if (error) {
    console.error("[activatePlanForUser]", error);
    return { success: false, error: "Could not activate subscription." };
  }

  return { success: true };
}
