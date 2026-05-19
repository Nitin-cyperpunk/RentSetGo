"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const QUOTES = [
  {
    quote:
      "My listings started getting 3× more WhatsApp inquiries after switching to Pro posters.",
    name: "Priya S.",
    role: "Owner · 12 listings",
  },
  {
    quote:
      "Feels like having a design agency on retainer. The AI posters look genuinely premium.",
    name: "Rahul M.",
    role: "Broker · Nashik",
  },
  {
    quote:
      "Worth every rupee. I post to Instagram in one click and focus on site visits.",
    name: "Anita K.",
    role: "Property manager",
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto w-full max-w-6xl">
      <h2 className="text-center text-2xl font-bold text-[#f5f0e8]">
        Loved by property owners
      </h2>
      <motion.div
        className="mt-10 flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-3 md:overflow-visible"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        {QUOTES.map((t, i) => (
          <motion.blockquote
            key={t.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="min-w-[85vw] shrink-0 snap-center rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl sm:min-w-[320px] md:min-w-0"
          >
            <motion.div className="flex gap-0.5 text-amber-400">
              {Array.from({ length: 5 }).map((_, j) => (
                <Star key={j} className="size-4 fill-current" />
              ))}
            </motion.div>
            <p className="mt-4 text-sm leading-relaxed text-zinc-300">
              &ldquo;{t.quote}&rdquo;
            </p>
            <footer className="mt-4">
              <p className="text-sm font-semibold text-[#f5f0e8]">{t.name}</p>
              <p className="text-xs text-zinc-500">{t.role}</p>
            </footer>
          </motion.blockquote>
        ))}
      </motion.div>
    </section>
  );
}
