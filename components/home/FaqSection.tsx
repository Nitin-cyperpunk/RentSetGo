"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { SectionTypewriterHeading } from "@/components/SectionTypewriterHeading";

const faqs = [
  {
    q: "Is RentSetGo free for renters?",
    a: "Yes. Browsing listings and reaching out to owners is free. Owners can create an account and publish listings on the platform.",
  },
  {
    q: "How do I contact an owner?",
    a: "Open a listing while signed in. The detail page shows the owner's phone and email when they have added contact details.",
  },
  {
    q: "What's the difference between rent and sale listings?",
    a: 'Use the "Looking for" filter to show rentals, properties for sale, or both. Rent listings show monthly rent; sale listings show an asking price.',
  },
  {
    q: "Can I list a shop or commercial space?",
    a: "Yes. When adding a listing, choose Commercial under category and pick a type such as shop, office, warehouse, or showroom.",
  },
  {
    q: "How long do listings stay active?",
    a: "Each listing has an expiry date set by the owner. Only active (non-expired) listings appear on the public browse feed.",
  },
  {
    q: "Do I need an account to browse?",
    a: "You can scan the home page without signing in. To open full listing details, sign up or log in—this helps keep contact info meaningful for serious enquiries.",
  },
] as const;

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-8 px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <SectionTypewriterHeading
            text="Frequently asked questions"
            className="text-2xl sm:text-3xl"
            startDelay={0.08}
          />
          <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
            Quick answers about browsing, listing, and how RentSetGo works in Nashik.
          </p>
        </div>
        <ul className="mt-8 space-y-3">
          {faqs.map((item, i) => {
            const open = openIndex === i;
            return (
              <li key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  aria-expanded={open}
                  className="flex w-full items-start justify-between gap-4 rounded-2xl border border-zinc-200/80 bg-white/60 px-5 py-4 text-left shadow-sm backdrop-blur-sm transition hover:border-emerald-200/80 dark:border-zinc-700/80 dark:bg-zinc-900/50 dark:hover:border-emerald-500/30"
                >
                  <span className="font-semibold text-zinc-900 dark:text-zinc-50">{item.q}</span>
                  <ChevronDown
                    className={`mt-0.5 size-5 shrink-0 text-emerald-700 transition-transform dark:text-emerald-400 ${open ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </button>
                {open ? (
                  <p className="px-5 pb-1 pt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {item.a}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
