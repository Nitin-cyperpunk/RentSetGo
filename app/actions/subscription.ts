"use server";

import { revalidatePath } from "next/cache";

import {
  getActivePlan,
  type ProfileSubscription,
  remainingPosters,
} from "@/lib/ai/subscription";
import { ensureProfileIfMissing, normalizePhoneString } from "@/lib/auth/profile";
import { activatePlanForUser } from "@/lib/subscription/activate-plan";
import {
  type PlanId,
  PLANS,
} from "@/lib/subscription/plans";
import {
  assertRazorpayMode,
  getPublicKeyId,
  getRazorpayClient,
  isRazorpayTestMode,
  planAmountPaise,
  razorpayConfigured,
  validateRazorpayOrder,
  validateRazorpayPayment,
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
  paymentsConfigured: boolean;
  razorpayTestMode: boolean;
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
      paymentsConfigured: razorpayConfigured(),
      razorpayTestMode: isRazorpayTestMode(),
    },
  };
}

export async function createRazorpayOrder(planId: Exclude<PlanId, "free">): Promise<{
  orderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  planName?: string;
  testMode?: boolean;
  prefill?: { email?: string; contact?: string; name?: string };
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
    return {
      error: "Payments are not configured yet. Use demo activation in development.",
    };
  }

  await ensureProfileIfMissing(supabase, user);

  const { data: profile } = await supabase
    .from("profiles")
    .select("phone, name")
    .eq("id", user.id)
    .maybeSingle();

  const phoneDigits = normalizePhoneString(profile?.phone)?.replace(/\D/g, "");
  const prefill = {
    email: user.email ?? undefined,
    contact: phoneDigits && phoneDigits.length >= 10 ? phoneDigits : undefined,
    name: profile?.name ?? undefined,
  };

  assertRazorpayMode();

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

    const keyId = getPublicKeyId();
    if (!keyId) {
      return { error: "Razorpay public key is missing." };
    }

    console.info("[createRazorpayOrder] ok", {
      orderId: order.id,
      planId,
      amount,
      testMode: isRazorpayTestMode(),
    });

    return {
      orderId: order.id,
      amount: order.amount as number,
      currency: order.currency,
      keyId,
      planName: PLANS[planId].name,
      testMode: isRazorpayTestMode(),
      prefill,
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

  if (!razorpayConfigured()) {
    return { success: false, error: "Payments are not configured." };
  }

  if (
    !verifyRazorpaySignature(
      input.razorpayOrderId,
      input.razorpayPaymentId,
      input.razorpaySignature,
    )
  ) {
    console.error("[verifyAndActivateSubscription] invalid signature", {
      orderId: input.razorpayOrderId,
      userId: user.id,
    });
    return { success: false, error: "Payment verification failed." };
  }

  const paymentCheck = await validateRazorpayPayment(
    input.razorpayOrderId,
    input.razorpayPaymentId,
  );
  if (!paymentCheck.ok) {
    return { success: false, error: paymentCheck.error };
  }

  const orderCheck = await validateRazorpayOrder(
    input.razorpayOrderId,
    user.id,
    input.planId,
  );
  if (!orderCheck.ok) {
    return { success: false, error: orderCheck.error };
  }

  const result = await activatePlanForUser(user.id, input.planId);
  if (result.success) {
    revalidatePath("/owner");
    revalidatePath("/pricing");
    console.info("[verifyAndActivateSubscription] activated", {
      userId: user.id,
      planId: input.planId,
    });
  }
  return result;
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

  const result = await activatePlanForUser(user.id, planId);
  if (result.success) {
    revalidatePath("/owner");
    revalidatePath("/pricing");
  }
  return result;
}
