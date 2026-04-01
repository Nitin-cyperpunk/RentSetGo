"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { deleteProperty } from "@/app/actions/properties";

type Props = {
  listingId: string;
};

export function DeleteListingButton({ listingId }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (!confirm("Remove this listing? It cannot be undone.")) return;
    setPending(true);
    const res = await deleteProperty(listingId);
    setPending(false);
    if (res?.error) {
      alert(res.error);
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
    >
      {pending ? "Removing…" : "Remove"}
    </button>
  );
}
