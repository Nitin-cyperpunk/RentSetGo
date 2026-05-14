"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

import { prefersReducedMotion } from "@/lib/motion";

type Props = {
  text: string;
  className?: string;
  as?: "span" | "h1" | "h2" | "h3";
  speed?: number;
  startDelay?: number;
  showCursor?: boolean;
  onComplete?: () => void;
};

export function TypewriterText({
  text,
  className,
  as: Tag = "span",
  speed = 0.042,
  startDelay = 0,
  showCursor = true,
  onComplete,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.textContent = text;
      setTyping(false);
      onComplete?.();
      return;
    }

    el.textContent = "";
    setTyping(true);
    const state = { i: 0 };

    const tween = gsap.to(state, {
      i: text.length,
      duration: Math.max(text.length * speed, 0.2),
      delay: startDelay,
      ease: "none",
      onUpdate: () => {
        el.textContent = text.slice(0, Math.round(state.i));
      },
      onComplete: () => {
        setTyping(false);
        onComplete?.();
      },
    });

    return () => {
      tween.kill();
    };
  }, [text, speed, startDelay, onComplete]);

  return (
    <Tag>
      <span ref={ref} className={className} />
      {showCursor && typing ? (
        <span
          className="ml-0.5 inline-block font-light text-emerald-600 opacity-80 animate-pulse dark:text-emerald-400"
          aria-hidden
        >
          |
        </span>
      ) : null}
    </Tag>
  );
}
