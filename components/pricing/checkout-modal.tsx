"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Sparkles, X } from "lucide-react";

import { BRAND_FAVICON, BRAND_NAME, getBrandLogoAbsoluteUrl } from "@/lib/brand";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  activatePlanDemo,
  createRazorpayOrder,
  verifyAndActivateSubscription,
} from "@/app/actions/subscription";
import { notify } from "@/lib/toast";
import { RAZORPAY_CHECKOUT_CONFIG } from "@/lib/subscription/razorpay-checkout-config";
import type { PlanId } from "@/lib/subscription/plans";
import { PLANS } from "@/lib/subscription/plans";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

type Props = {
  open: boolean;
  planId: Exclude<PlanId, "free"> | null;
  onClose: () => void;
  onSuccess: () => void;
};

type Step = "idle" | "processing" | "success" | "error";

const SCRIPT_TIMEOUT_MS = 15_000;
const ORDER_TIMEOUT_MS = 30_000;

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);
}

function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);

  return withTimeout(
    new Promise<boolean>((resolve) => {
      const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
      if (existing) {
        existing.addEventListener("load", () => resolve(Boolean(window.Razorpay)));
        existing.addEventListener("error", () => resolve(false));
        if (window.Razorpay) resolve(true);
        return;
      }

      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.async = true;
      s.onload = () => resolve(Boolean(window.Razorpay));
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    }),
    SCRIPT_TIMEOUT_MS,
    "Razorpay script load timed out",
  ).catch(() => false);
}

export function CheckoutModal({ open, planId, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState<string | null>(null);
  const [demoAvailable, setDemoAvailable] = useState(false);
  const [razorpayOpen, setRazorpayOpen] = useState(false);
  const planIdRef = useRef(planId);

  const plan = planId ? PLANS[planId] : null;

  useEffect(() => {
    planIdRef.current = planId;
  }, [planId]);

  useEffect(() => {
    if (!open) {
      setStep("idle");
      setError(null);
      setRazorpayOpen(false);
    }
  }, [open]);

  useEffect(() => {
    setDemoAvailable(process.env.NODE_ENV !== "production");
  }, []);

  const handleSuccess = useCallback(() => {
    setStep("success");
    setRazorpayOpen(false);
    notify.subscriptionActivated(plan?.name);
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 1800);
  }, [onClose, onSuccess, plan?.name]);

  const startCheckout = useCallback(async () => {
    const activePlanId = planIdRef.current;
    if (!activePlanId) return;

    setStep("processing");
    setError(null);
    setRazorpayOpen(false);

    try {
      const order = await withTimeout(
        createRazorpayOrder(activePlanId),
        ORDER_TIMEOUT_MS,
        "Order creation timed out. Check your connection and Razorpay keys.",
      );

      if (order.error) {
        setError(order.error);
        setStep("error");
        return;
      }

      if (!order.orderId || !order.keyId) {
        setError("Payment gateway unavailable.");
        setStep("error");
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        setError(
          "Could not load Razorpay checkout. Disable ad blockers or try another browser.",
        );
        setStep("error");
        return;
      }

      const prefill: Record<string, string> = {};
      if (order.prefill?.email) prefill.email = order.prefill.email;
      if (order.prefill?.name) prefill.name = order.prefill.name;
      if (order.prefill?.contact && order.prefill.contact.length >= 10) {
        prefill.contact = order.prefill.contact;
      }

      const rzp = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        name: BRAND_NAME,
        image: getBrandLogoAbsoluteUrl(),
        description: `${plan?.name ?? "Pro"} subscription`,
        currency: order.currency ?? "INR",
        config: RAZORPAY_CHECKOUT_CONFIG,
        ...(Object.keys(prefill).length > 0 ? { prefill } : {}),
        theme: { color: "#10b981" },
        handler: async (response: Record<string, string>) => {
          setRazorpayOpen(false);
          setStep("processing");
          try {
            const result = await verifyAndActivateSubscription({
              planId: activePlanId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            if (result.success) {
              handleSuccess();
            } else {
              setError(result.error ?? "Activation failed.");
              setStep("error");
            }
          } catch (err) {
            console.error("[checkout] verify failed", err);
            setError("Could not confirm payment. Contact support if you were charged.");
            setStep("error");
          }
        },
        modal: {
          ondismiss: () => {
            setRazorpayOpen(false);
            setStep("idle");
          },
          escape: true,
          backdropclose: true,
        },
      });

      rzp.on("payment.failed", (res: unknown) => {
        setRazorpayOpen(false);
        const payload = res as { error?: { description?: string } };
        setError(payload.error?.description ?? "Payment failed. Try again.");
        setStep("error");
      });

      setRazorpayOpen(true);
      setStep("idle");
      rzp.open();
    } catch (err) {
      console.error("[checkout] startCheckout", err);
      setRazorpayOpen(false);
      setError(err instanceof Error ? err.message : "Could not start checkout.");
      setStep("error");
    }
  }, [plan?.name, handleSuccess]);

  const startDemo = useCallback(async () => {
    if (!planId) return;
    setStep("processing");
    const result = await activatePlanDemo(planId);
    if (result.success) {
      handleSuccess();
    } else {
      setError(result.error ?? "Demo activation failed.");
      setStep("error");
    }
  }, [planId, handleSuccess]);

  if (!open || !plan) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4 ${
          razorpayOpen ? "pointer-events-none invisible" : ""
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: razorpayOpen ? 0 : 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-hidden={razorpayOpen}
      >
        <motion.button
          type="button"
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
          aria-label="Close"
          onClick={onClose}
          tabIndex={razorpayOpen ? -1 : 0}
        />

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="relative z-[1] w-full max-w-md overflow-hidden rounded-t-3xl border border-white/15 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black p-6 shadow-2xl sm:rounded-3xl"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-zinc-500 transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>

          {step === "success" ? (
            <motion.div
              className="flex flex-col items-center py-8 text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <motion.div
                className="flex size-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5 }}
              >
                <Check className="size-7" strokeWidth={2.5} />
              </motion.div>
              <p className="mt-4 text-xl font-bold text-white">You&apos;re Pro!</p>
              <p className="mt-2 text-sm text-zinc-400">
                Premium AI posters and automation are now unlocked.
              </p>
            </motion.div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={BRAND_FAVICON}
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 shrink-0 rounded-xl object-contain"
                />
                <div>
                  <p className="text-sm font-bold text-white">{BRAND_NAME}</p>
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400/90">
                    <Sparkles className="size-3.5" />
                    Secure checkout
                  </p>
                </div>
              </div>
              <h3 className="mt-3 text-2xl font-bold text-white">
                Upgrade to {plan.name}
              </h3>
              <p className="mt-1 text-sm text-zinc-400">
                ₹{plan.priceInr}/month · Cancel anytime
              </p>

              <ul className="mt-6 space-y-2 border-t border-white/10 pt-4">
                {plan.features.slice(0, 4).map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                    <Check className="size-4 text-amber-400" />
                    {f}
                  </li>
                ))}
              </ul>

              {error && (
                <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {error}
                </p>
              )}

              <motion.button
                type="button"
                disabled={step === "processing"}
                whileTap={{ scale: 0.98 }}
                onClick={startCheckout}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#d4a574] to-[#b8864a] py-3.5 text-sm font-semibold text-zinc-900 shadow-lg disabled:opacity-70"
              >
                {step === "processing" ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Opening Razorpay…
                  </>
                ) : (
                  `Pay ₹${plan.priceInr} — Upgrade now`
                )}
              </motion.button>

              {demoAvailable && (
                <button
                  type="button"
                  onClick={startDemo}
                  disabled={step === "processing"}
                  className="mt-3 w-full rounded-2xl border border-dashed border-white/20 py-2.5 text-xs text-zinc-500 transition hover:border-amber-400/40 hover:text-amber-200/80"
                >
                  Dev: activate without payment
                </button>
              )}

              <p className="mt-4 text-center text-[11px] text-zinc-600">
                Secured by Razorpay · UPI, QR, cards, netbanking & wallets
                {process.env.NODE_ENV !== "production" ? (
                  <span className="mt-1 block text-amber-600/80">
                    Test: card 4111… or UPI success@razorpay
                  </span>
                ) : null}
              </p>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
