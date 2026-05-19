"use client";

import { motion } from "framer-motion";
import { Camera, ImageIcon, PenLine, Share2, Wand2 } from "lucide-react";

const ITEMS = [
  {
    icon: ImageIcon,
    title: "AI poster generation",
    desc: "Cinematic layouts from your listing photos — ready to share in seconds.",
    gradient: "from-amber-500/20 to-orange-600/5",
  },
  {
    icon: PenLine,
    title: "AI description generator",
    desc: "SEO-friendly copy that sells the lifestyle, not just the square feet.",
    gradient: "from-teal-500/15 to-emerald-600/5",
  },
  {
    icon: Camera,
    title: "Instagram automation",
    desc: "Schedule posts and stories — keep your brand visible without the grind.",
    gradient: "from-pink-500/15 to-purple-600/5",
  },
  {
    icon: Wand2,
    title: "AI branding engine",
    desc: "Consistent typography, colors, and layouts across every listing.",
    gradient: "from-amber-400/15 to-yellow-600/5",
  },
  {
    icon: Share2,
    title: "Social media automation",
    desc: "WhatsApp-ready assets and one-tap sharing for faster leads.",
    gradient: "from-blue-500/10 to-cyan-600/5",
  },
];

export function FeatureShowcase() {
  return (
    <section className="mx-auto w-full max-w-6xl">
      <motion.h2
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center text-2xl font-bold text-[#f5f0e8] sm:text-3xl"
      >
        AI that works while you close deals
      </motion.h2>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${item.gradient} p-6 backdrop-blur-xl`}
            >
              <motion.div className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-amber-300/90 transition group-hover:scale-105">
                <Icon className="size-5" />
              </motion.div>
              <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{item.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
