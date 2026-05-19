"use client";

import { motion } from "framer-motion";

type Props = {
  onUpgrade: () => void;
  visible: boolean;
};

export function MobileStickyCta({ onUpgrade, visible }: Props) {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-zinc-950/90 p-4 backdrop-blur-xl md:hidden"
    >
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={onUpgrade}
        className="w-full rounded-2xl bg-gradient-to-r from-[#d4a574] to-[#b8864a] py-3.5 text-sm font-semibold text-zinc-900 shadow-lg"
      >
        Upgrade to Pro — ₹299/mo
      </motion.button>
    </motion.div>
  );
}
