"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

type Props = {
  currencyToggle?: React.ReactNode;
};

export function PricingHero({ currencyToggle }: Props) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="relative mx-auto max-w-4xl text-center"
    >
      <motion.div
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-1.5 text-xs font-medium text-amber-200/90 backdrop-blur-md"
        animate={{ boxShadow: ["0 0 20px rgba(251,191,36,0.1)", "0 0 40px rgba(251,191,36,0.2)", "0 0 20px rgba(251,191,36,0.1)"] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <Sparkles className="size-3.5 text-amber-400" />
        RentSetGo Pro · AI for property owners
      </motion.div>

      <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-tight text-[#faf7f2] sm:text-5xl md:text-6xl">
        Turn Your Property Into A{" "}
        <span className="bg-gradient-to-r from-[#f5e6d3] via-[#d4a574] to-[#c9956a] bg-clip-text text-transparent">
          Viral Real-Estate Brand
        </span>
      </h1>

      <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-zinc-400 sm:text-lg">
        Generate premium AI posters, automate Instagram marketing, and grow faster
        with RentSetGo Pro.
      </p>

      {currencyToggle && (
        <motion.div
          className="mt-8 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {currencyToggle}
        </motion.div>
      )}
    </motion.header>
  );
}
