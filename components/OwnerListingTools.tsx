"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { extendListingExpiry, setListingAvailability } from "@/app/actions/properties";

type Props = {
  listingId: string;
  availableStatus?: string | null;
};

export function OwnerListingTools({ listingId, availableStatus }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const occupied = availableStatus === "occupied";

  async function run(action: "extend" | "available" | "occupied") {
    setPending(action);
    try {
      const res =
        action === "extend"
          ? await extendListingExpiry(listingId)
          : await setListingAvailability(listingId, action === "occupied" ? "occupied" : "available");
      if (res && "error" in res && res.error) {
        alert(res.error);
        return;
      }
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-700">
      <button
        type="button"
        disabled={pending !== null}
        onClick={() => run("extend")}
        className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
      >
        {pending === "extend" ? "…" : "+30 days"}
      </button>
      <button
        type="button"
        disabled={pending !== null}
        onClick={() => run(occupied ? "available" : "occupied")}
        className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
      >
        {pending === "available" || pending === "occupied"
          ? "…"
          : occupied
            ? "Mark available"
            : "Mark occupied"}
      </button>
    </div>
  );
}
