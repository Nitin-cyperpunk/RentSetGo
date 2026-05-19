"use server";

import { revalidatePath } from "next/cache";

import {
  getActivePlan,
  type ProfileSubscription,
  remainingPosters,
} from "@/lib/ai/subscription";
import { ensureProfileIfMissing } from "@/lib/auth/profile";
import {
  type PlanId,
  PLANS,
} from "@/lib/subscription/plans";
import {
  getRazorpayClient,
  planAmountPaise,
  razorpayConfigured,
  subscriptionExpiryFromNow,
  verifyRazorpaySignature,
} from "@/lib/subscription/razorpay-server";
import { createClient } from "@/lib/supabase/server";

export type SubscriptionState = {
  plan: PlanId;
  status: string;
  posterCount: number;
  remaining: number;
  expiry: string | null;
  isActive: boolean;
};

export async function getSubscriptionState(): Promise<{
  state: SubscriptionState | null;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { state: null, error: "Sign in required." };
  }

  await ensureProfileIfMissing(supabase, user);

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      "poster_generation_count, subscription_status, subscription_plan, subscription_expiry",
    )
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return { state: null, error: "Could not load subscription." };
  }

  const sub = profile as ProfileSubscription;
  const plan = getActivePlan(sub);
  const remaining = remainingPosters(sub);

  return {
    state: {
      plan,
      status: profile.subscription_status ?? "free",
      posterCount: profile.poster_generation_count ?? 0,
      remaining: remaining === Infinity ? 999 : remaining,
      expiry: profile.subscription_expiry,
      isActive: plan !== "free",
    },
  };
}

export async function createRazorpayOrder(planId: Exclude<PlanId, "free">): Promise<{
  orderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  planName?: string;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sign in to upgrade." };
  }

  if (!razorpayConfigured()) {
    return { error: "Payments are not configured yet. Use demo activation in development." };
  }

  try {
    const razorpay = getRazorpayClient();
    const amount = planAmountPaise(planId);
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `rsg_${planId}_${user.id.slice(0, 8)}_${Date.now()}`,
      notes: {
        user_id: user.id,
        plan_id: planId,
      },
    });

    return {
      orderId: order.id,
      amount: order.amount as number,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? process.env.RAZORPAY_KEY_ID,
      planName: PLANS[planId].name,
    };
  } catch (e) {
    console.error("[createRazorpayOrder]", e);
    return { error: "Could not create payment order. Try again." };
  }
}

export async function verifyAndActivateSubscription(input: {
  planId: Exclude<PlanId, "free">;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Sign in required." };
  }

  if (!verifyRazorpaySignature(
    input.razorpayOrderId,
    input.razorpayPaymentId,
    input.razorpaySignature,
  )) {
    return { success: false, error: "Payment verification failed." };
  }

  return activatePlanForUser(user.id, input.planId);
}

/** Dev/demo activation when Razorpay keys are not set */
export async function activatePlanDemo(
  planId: Exclude<PlanId, "free">,
): Promise<{ success: boolean; error?: string }> {
  if (process.env.NODE_ENV === "production" && razorpayConfigured()) {
    return { success: false, error: "Demo activation is disabled in production." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Sign in required." };
  }

  return activatePlanForUser(user.id, planId);
}

async function activatePlanForUser(
  userId: string,
  planId: Exclude<PlanId, "free">,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
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

  revalidatePath("/owner");
  revalidatePath("/pricing");
  return { success: true };
}
