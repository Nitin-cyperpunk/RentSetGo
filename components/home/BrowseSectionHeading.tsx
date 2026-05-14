"use client";

import { SectionTypewriterHeading } from "@/components/SectionTypewriterHeading";

type Props = {
  startDelay?: number;
};

export function BrowseSectionHeading({ startDelay = 0.15 }: Props) {
  return (
    <SectionTypewriterHeading
      text="Browse listings"
      className="text-xl sm:text-2xl"
      startDelay={startDelay}
    />
  );
}
