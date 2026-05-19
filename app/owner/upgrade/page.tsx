import Link from "next/link";

import { PricingPage } from "@/components/pricing/pricing-page";

export const metadata = {
  title: "Upgrade · RentSetGo",
  description: "Unlock Pro AI posters and marketing automation.",
};

export default function OwnerUpgradePage() {
  return (
    <div className="relative">
      <div className="absolute left-4 top-4 z-10 sm:left-6 sm:top-6">
        <Link
          href="/owner/dashboard"
          className="inline-flex items-center rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs font-medium text-zinc-300 backdrop-blur-md transition hover:text-white"
        >
          ← Dashboard
        </Link>
      </div>
      <PricingPage isAuthenticated />
    </div>
  );
}
