import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import type { PlanId } from "@/lib/subscription/plans";
import { activatePlanForUser } from "@/lib/subscription/activate-plan";
import {
  getRazorpayClient,
  validateRazorpayOrder,
  validateRazorpayPayment,
  verifyWebhookSignature,
} from "@/lib/subscription/razorpay-server";
import { adminClientConfigured } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type WebhookPayload = {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        status?: string;
      };
    };
  };
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    console.error("[razorpay/webhook] invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (!adminClientConfigured()) {
    console.error("[razorpay/webhook] SUPABASE_SERVICE_ROLE_KEY not set");
    return NextResponse.json({ error: "Server not configured for webhooks" }, { status: 503 });
  }

  let body: WebhookPayload;
  try {
    body = JSON.parse(rawBody) as WebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = body.event;
  if (event !== "payment.captured" && event !== "order.paid") {
    return NextResponse.json({ received: true, skipped: event });
  }

  const payment = body.payload?.payment?.entity;
  const orderId = payment?.order_id;
  const paymentId = payment?.id;

  if (!orderId || !paymentId) {
    return NextResponse.json({ error: "Missing payment data" }, { status: 400 });
  }

  const paymentCheck = await validateRazorpayPayment(orderId, paymentId);
  if (!paymentCheck.ok) {
    console.error("[razorpay/webhook] payment check failed", paymentCheck.error);
    return NextResponse.json({ error: paymentCheck.error }, { status: 400 });
  }

  const order = await getRazorpayClient().orders.fetch(orderId);
  const notes = (order.notes ?? {}) as Record<string, string>;
  const userId = notes.user_id;
  const planId = notes.plan_id as Exclude<PlanId, "free"> | undefined;

  if (!userId || (planId !== "pro" && planId !== "business")) {
    console.error("[razorpay/webhook] invalid order notes", notes);
    return NextResponse.json({ error: "Invalid order metadata" }, { status: 400 });
  }

  const orderCheck = await validateRazorpayOrder(orderId, userId, planId);
  if (!orderCheck.ok) {
    console.error("[razorpay/webhook] order validation failed", orderCheck.error);
    return NextResponse.json({ error: orderCheck.error }, { status: 400 });
  }

  const result = await activatePlanForUser(userId, planId, { useAdmin: true });
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  revalidatePath("/owner");
  revalidatePath("/pricing");
  console.info("[razorpay/webhook] subscription activated", { userId, planId, orderId });

  return NextResponse.json({ received: true, activated: true });
}
