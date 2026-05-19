"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

import type { PlanId, SubscriptionPlan } from "@/lib/subscription/plans";
import { cn } from "@/lib/utils";

import { PlanBadge } from "./plan-badge";

type Props = {
  plan: SubscriptionPlan;
  currency: "inr" | "usd";
  currentPlan?: PlanId;
  onSelect: (planId: PlanId) => void;
  index?: number;
};

export function PricingCard({
  plan,
  currency,
  currentPlan,
  onSelect,
  index = 0,
}: Props) {
  const isCurrent = currentPlan === plan.id;
  const isFree = plan.id === "free";
  const price =
    currency === "inr"
      ? plan.priceInr
      : plan.priceUsd;
  const priceLabel =
    currency === "inr" ? `₹${price}` : `$${price}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: plan.highlighted ? -6 : -4, scale: plan.highlighted ? 1.02 : 1.01 }}
      className={cn(
        "relative flex min-h-[420px] flex-col rounded-3xl border p-6 backdrop-blur-xl transition-shadow sm:p-8",
        plan.highlighted
          ? "border-amber-400/50 bg-gradient-to-b from-amber-950/40 via-zinc-900/80 to-zinc-950/90 shadow-[0_0_60px_rgba(212,165,116,0.15),inset_0_1px_0_rgba(255,255,255,0.08)]"
          : "border-white/10 bg-white/[0.03] shadow-xl hover:border-white/20 hover:shadow-2xl",
      )}
    >
      {plan.highlighted && (
        <div
          className="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-b from-amber-400/20 via-transparent to-transparent opacity-60"
          aria-hidden
        />
      )}

      <motion.div
        className="absolute -right-8 -top-8 text-amber-400/20"
        animate={{ rotate: [0, 8, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 6, repeat: Infinity }}
        aria-hidden
      >
        <Sparkles className="size-24" />
      </motion.div>

      <motion.div className="relative flex flex-1 flex-col">
        {plan.badge ? <PlanBadge label={plan.badge} /> : <div className="h-7" />}

        <h3 className="mt-4 text-2xl font-bold tracking-tight text-[#f5f0e8]">
          {plan.name}
        </h3>
        <p className="mt-1 text-sm text-zinc-400">{plan.tagline}</p>

        <motion.div
          className="mt-6 flex items-baseline gap-1"
          key={priceLabel}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {priceLabel}
          </span>
          <span className="text-sm text-zinc-500">/month</span>
        </motion.div>

        <ul className="mt-8 flex-1 space-y-3">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-300">
              <Check
                className={cn(
                  "mt-0.5 size-4 shrink-0",
                  plan.highlighted ? "text-amber-400" : "text-emerald-500/80",
                )}
                strokeWidth={2.5}
              />
              {f}
            </li>
          ))}
        </ul>

        <motion.button
          type="button"
          disabled={isCurrent || isFree}
          whileTap={{ scale: 0.98 }}
          onClick={() => !isFree && onSelect(plan.id)}
          className={cn(
            "mt-8 w-full rounded-2xl py-3.5 text-sm font-semibold transition-all",
            isCurrent || isFree
              ? "cursor-default border border-white/10 bg-white/5 text-zinc-500"
              : plan.highlighted
                ? "bg-gradient-to-r from-[#d4a574] via-[#c9956a] to-[#b8864a] text-zinc-900 shadow-[0_8px_32px_rgba(212,165,116,0.35)] hover:brightness-110"
                : "border border-white/15 bg-white/10 text-white hover:bg-white/15",
          )}
        >
          {isCurrent ? "Current Plan" : plan.cta}
        </motion.button>
      </motion.div>
    </motion.article>
  );
}
