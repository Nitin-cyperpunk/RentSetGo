import type { Metadata } from "next";

import { SupportSection } from "@/components/SupportSection";

export const metadata: Metadata = {
  title: "Support RentSetGo",
  description:
    "Optional support for RentSetGo — help keep Nashik's owner-first rental platform running.",
};

export default function SupportPage() {
  return (
    <div className="flex flex-1 flex-col px-4 py-10 sm:px-6 sm:py-14">
      <SupportSection variant="page" />
    </div>
  );
}
