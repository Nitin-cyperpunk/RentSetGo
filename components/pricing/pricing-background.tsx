"use client";

import { motion } from "framer-motion";

export function PricingBackground() {
  return (
    <motion.div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#0a0a0a]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <motion.div
        className="absolute -left-1/4 top-0 h-[70vh] w-[70vh] rounded-full bg-[radial-gradient(circle,rgba(212,165,116,0.18)_0%,transparent_70%)] blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-1/4 top-1/4 h-[60vh] w-[60vh] rounded-full bg-[radial-gradient(circle,rgba(180,120,80,0.12)_0%,transparent_70%)] blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, 50, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-[50vh] w-[50vh] rounded-full bg-[radial-gradient(circle,rgba(245,235,220,0.06)_0%,transparent_70%)] blur-3xl"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
        animate={{ opacity: [0.02, 0.05, 0.02] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
    </motion.div>
  );
}
