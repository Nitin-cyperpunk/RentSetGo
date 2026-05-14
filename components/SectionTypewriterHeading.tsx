"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

import { TypewriterText } from "@/components/TypewriterText";
import { prefersReducedMotion } from "@/lib/motion";

type Props = {
  text: string;
  className?: string;
  as?: "h2" | "h3";
  startDelay?: number;
  speed?: number;
};

/** Section heading with typewriter on load. */
export function SectionTypewriterHeading({
  text,
  className = "",
  as: Tag = "h2",
  startDelay = 0,
  speed = 0.035,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }

    gsap.fromTo(
      el,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.45, delay: startDelay, ease: "power2.out" },
    );
  }, [startDelay]);

  return (
    <div ref={ref} className="opacity-0">
      <TypewriterText
        text={text}
        as={Tag}
        className={`font-bold tracking-tight text-zinc-900 dark:text-zinc-50 ${className}`.trim()}
        startDelay={startDelay}
        speed={speed}
        showCursor={text.length < 42}
      />
    </div>
  );
}
