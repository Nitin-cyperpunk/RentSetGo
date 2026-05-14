"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";

import { TypewriterText } from "@/components/TypewriterText";
import { prefersReducedMotion } from "@/lib/motion";

const LINE1 = "Find a home";
const LINE2 = "worth staying in";
const line1Duration = LINE1.length * 0.042;
const line2Delay = line1Duration + 0.25;

export function HeroAnimated() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (prefersReducedMotion()) {
      gsap.set([".hero-badge", ".hero-sub", ".hero-cta"], { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set([".hero-badge", ".hero-sub", ".hero-cta"], { opacity: 0, y: 14 });

      gsap.to(".hero-badge", {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
      });

      const subDelay = line2Delay + LINE2.length * 0.042 + 0.15;
      gsap.to(".hero-sub", {
        opacity: 1,
        y: 0,
        duration: 0.55,
        delay: subDelay,
        ease: "power2.out",
      });
      gsap.to(".hero-cta", {
        opacity: 1,
        y: 0,
        duration: 0.5,
        delay: subDelay + 0.2,
        stagger: 0.1,
        ease: "power2.out",
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="relative mx-auto max-w-5xl text-center">
      <p className="hero-badge mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-800 opacity-0 shadow-sm backdrop-blur-md dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-200">
        Nashik rentals
        <span className="h-1 w-1 rounded-full bg-emerald-500" aria-hidden />
        Direct from owners
      </p>
      <h1
        aria-label={`${LINE1} ${LINE2}`}
        className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl"
      >
        <TypewriterText
          text={LINE1}
          className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-emerald-900 bg-clip-text text-transparent dark:from-zinc-100 dark:via-zinc-200 dark:to-emerald-200"
        />
        <br />
        <TypewriterText
          text={LINE2}
          startDelay={line2Delay}
          className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 bg-clip-text text-transparent dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400"
        />
      </h1>
      <p className="hero-sub mx-auto mt-5 max-w-2xl text-base text-zinc-600 opacity-0 sm:text-lg dark:text-zinc-400">
        Browse curated listings, filter by budget and neighbourhood, then connect with owners in a few taps.
      </p>
      <div className="hero-cta mt-8 flex flex-wrap items-center justify-center gap-3 opacity-0">
        <a
          href="#browse"
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:brightness-110 active:scale-[0.98]"
        >
          Explore listings
        </a>
        <Link
          href="/signup"
          className="inline-flex items-center justify-center rounded-full border border-zinc-200/90 bg-white/80 px-7 py-3 text-sm font-semibold text-zinc-800 shadow-sm backdrop-blur-sm transition hover:bg-white dark:border-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          List your property
        </Link>
      </div>
    </div>
  );
}
