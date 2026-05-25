import crypto from "crypto";
import Razorpay from "razorpay";

import { type PlanId, PLANS } from "@/lib/subscription/plans";

const LOG_PREFIX = "[razorpay]";

export function getPublicKeyId(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() ||
    process.env.RAZORPAY_KEY_ID?.trim()
  );
}

export function razorpayConfigured(): boolean {
  return Boolean(getPublicKeyId() && process.env.RAZORPAY_KEY_SECRET?.trim());
}

export function isRazorpayTestMode(): boolean {
  const key = getPublicKeyId() ?? "";
  return key.startsWith("rzp_test_");
}

export function assertRazorpayMode(): void {
  if (!razorpayConfigured()) return;
  const test = isRazorpayTestMode();
  if (process.env.NODE_ENV === "production" && test) {
    console.warn(
      `${LOG_PREFIX} Test keys detected in production — switch to rzp_live_ before going live.`,
    );
  } else if (process.env.NODE_ENV !== "production") {
    console.info(
      `${LOG_PREFIX} Mode: ${test ? "TEST (rzp_test_*)" : "LIVE (rzp_live_*)"}`,
    );
  }
}

export function getRazorpayClient(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim() || getPublicKeyId();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured.");
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export function planAmountPaise(planId: Exclude<PlanId, "free">): number {
  return PLANS[planId].priceInr * 100;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

/** Checkout payment signature: HMAC-SHA256(order_id|payment_id). */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!secret || !orderId || !paymentId || !signature) return false;
  const body = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return timingSafeEqual(expected, signature);
}

/** Webhook signature: HMAC-SHA256(raw body) with webhook secret. */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return timingSafeEqual(expected, signature);
}

export function subscriptionExpiryFromNow(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString();
}

export type OrderValidationResult =
  | { ok: true; userId: string; planId: Exclude<PlanId, "free"> }
  | { ok: false; error: string };

/** Server-side: order amount + notes must match the plan and paying user. */
export async function validateRazorpayOrder(
  orderId: string,
  userId: string,
  planId: Exclude<PlanId, "free">,
): Promise<OrderValidationResult> {
  try {
    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.fetch(orderId);
    const amount = Number(order.amount);
    const expected = planAmountPaise(planId);

    if (amount !== expected) {
      console.error(`${LOG_PREFIX} amount mismatch`, { amount, expected, planId });
      return { ok: false, error: "Order amount does not match plan price." };
    }

    const notes = (order.notes ?? {}) as Record<string, string>;
    if (notes.user_id !== userId) {
      console.error(`${LOG_PREFIX} user mismatch`, { expected: userId, got: notes.user_id });
      return { ok: false, error: "Order does not belong to this account." };
    }
    if (notes.plan_id !== planId) {
      console.error(`${LOG_PREFIX} plan mismatch`, { expected: planId, got: notes.plan_id });
      return { ok: false, error: "Order plan does not match checkout." };
    }

    return { ok: true, userId, planId };
  } catch (e) {
    console.error(`${LOG_PREFIX} validateRazorpayOrder`, e);
    return { ok: false, error: "Could not verify payment order." };
  }
}

export type PaymentValidationResult =
  | { ok: true }
  | { ok: false; error: string };

export async function validateRazorpayPayment(
  orderId: string,
  paymentId: string,
): Promise<PaymentValidationResult> {
  try {
    const razorpay = getRazorpayClient();
    const payment = await razorpay.payments.fetch(paymentId);

    if (payment.order_id !== orderId) {
      return { ok: false, error: "Payment does not match order." };
    }
    if (payment.status !== "captured" && payment.status !== "authorized") {
      return { ok: false, error: `Payment not completed (status: ${payment.status}).` };
    }
    return { ok: true };
  } catch (e) {
    console.error(`${LOG_PREFIX} validateRazorpayPayment`, e);
    return { ok: false, error: "Could not verify payment." };
  }
}
