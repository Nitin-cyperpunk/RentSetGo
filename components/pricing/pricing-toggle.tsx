"use client";

import { motion } from "framer-motion";

type Currency = "inr" | "usd";

type Props = {
  value: Currency;
  onChange: (v: Currency) => void;
};

export function PricingToggle({ value, onChange }: Props) {
  return (
    <motion.div
      layout
      className="relative inline-flex rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur-xl"
      role="group"
      aria-label="Currency"
    >
      {(["inr", "usd"] as const).map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={`relative z-10 rounded-xl px-5 py-2 text-sm font-medium transition-colors ${
            value === c ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          {value === c && (
            <motion.span
              layoutId="currency-pill"
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#f5e6d3] to-[#d4a574]"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative">{c === "inr" ? "₹ INR" : "$ USD"}</span>
        </button>
      ))}
    </motion.div>
  );
}
