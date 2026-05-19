"use client";

import { motion } from "framer-motion";
import { Check, Minus } from "lucide-react";

import { COMPARISON_ROWS } from "@/lib/subscription/plans";

function CellValue({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <motion.span
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        className="inline-flex size-7 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400"
      >
        <Check className="size-4" strokeWidth={2.5} />
      </motion.span>
    ) : (
      <Minus className="mx-auto size-4 text-zinc-600" />
    );
  }
  return <span className="text-sm text-zinc-300">{value}</span>;
}

export function FeatureTable() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="mx-auto w-full max-w-5xl"
    >
      <h2 className="text-center text-2xl font-bold tracking-tight text-[#f5f0e8] sm:text-3xl">
        Compare plans
      </h2>
      <p className="mt-2 text-center text-sm text-zinc-500">
        Everything you need to market properties like a premium brand
      </p>

      <motion.div
        className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl"
        initial={{ y: 24 }}
        whileInView={{ y: 0 }}
        viewport={{ once: true }}
      >
        <motion.div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03]">
                <th className="px-4 py-4 text-xs font-medium uppercase tracking-wider text-zinc-500 sm:px-6">
                  Feature
                </th>
                {["Free", "Pro", "Business"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-4 text-center text-sm font-semibold text-[#f5f0e8] sm:px-6"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <motion.tr
                  key={row.feature}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-white/5 last:border-0"
                >
                  <td className="px-4 py-4 text-sm text-zinc-400 sm:px-6">
                    {row.feature}
                  </td>
                  <td className="px-4 py-4 text-center sm:px-6">
                    <CellValue value={row.free} />
                  </td>
                  <td className="px-4 py-4 text-center sm:px-6">
                    <CellValue value={row.pro} />
                  </td>
                  <td className="px-4 py-4 text-center sm:px-6">
                    <CellValue value={row.business} />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
