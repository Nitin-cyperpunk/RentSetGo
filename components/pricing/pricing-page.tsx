"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

import { getSubscriptionState } from "@/app/actions/subscription";
import type { PlanId } from "@/lib/subscription/plans";
import { PLAN_ORDER, PLANS } from "@/lib/subscription/plans";

import { CheckoutModal } from "./checkout-modal";
import { FeatureShowcase } from "./feature-showcase";
import { FeatureTable } from "./feature-table";
import { MobileStickyCta } from "./mobile-sticky-cta";
import { PricingBackground } from "./pricing-background";
import { PricingCard } from "./pricing-card";
import { PricingHero } from "./pricing-hero";
import { PricingToggle } from "./pricing-toggle";
import { Testimonials } from "./testimonials";

type Props = {
  /** When false, free plan CTA still shows but paid plans require sign-in via checkout error */
  isAuthenticated?: boolean;
};

export function PricingPage({ isAuthenticated = false }: Props) {
  const [currency, setCurrency] = useState<"inr" | "usd">("inr");
  const [currentPlan, setCurrentPlan] = useState<PlanId>("free");
  const [checkoutPlan, setCheckoutPlan] = useState<Exclude<PlanId, "free"> | null>(
    null,
  );
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const refreshState = useCallback(async () => {
    if (!isAuthenticated) return;
    const { state } = await getSubscriptionState();
    if (state) setCurrentPlan(state.plan);
  }, [isAuthenticated]);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  const handleSelect = (planId: PlanId) => {
    if (planId === "free") return;
    setCheckoutPlan(planId);
    setCheckoutOpen(true);
  };

  const handleCheckoutSuccess = () => {
    refreshState();
    setCheckoutOpen(false);
    setCheckoutPlan(null);
  };

  return (
    <div className="relative min-h-screen text-[#f5f0e8]">
      <PricingBackground />

      <div className="relative mx-auto max-w-6xl px-4 pb-32 pt-16 sm:px-6 sm:pb-24 sm:pt-24">
        <PricingHero
          currencyToggle={
            <PricingToggle value={currency} onChange={setCurrency} />
          }
        />

        <motion.div
          className="mt-14 grid gap-6 md:grid-cols-3 md:gap-5 lg:mt-16"
          initial="hidden"
          animate="visible"
        >
          {PLAN_ORDER.map((id, i) => (
            <PricingCard
              key={id}
              plan={PLANS[id]}
              currency={currency}
              currentPlan={currentPlan}
              onSelect={handleSelect}
              index={i}
            />
          ))}
        </motion.div>

        <div className="mt-24 space-y-24">
          <FeatureTable />
          <FeatureShowcase />
          <Testimonials />
        </div>
      </div>

      <MobileStickyCta
        visible={currentPlan === "free"}
        onUpgrade={() => handleSelect("pro")}
      />

      <CheckoutModal
        open={checkoutOpen}
        planId={checkoutPlan}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={handleCheckoutSuccess}
      />
    </div>
  );
}

