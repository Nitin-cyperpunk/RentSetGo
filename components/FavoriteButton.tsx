"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { togglePropertyFavorite } from "@/app/actions/favorites";
import { notify } from "@/lib/toast";

type Props = {
  propertyId: string;
  initialFavorited?: boolean;
  className?: string;
};

export function FavoriteButton({ propertyId, initialFavorited = false, className = "" }: Props) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, setPending] = useState(false);

  async function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;
    setPending(true);
    try {
      const res = await togglePropertyFavorite(propertyId);
      if (res && "error" in res && res.error) {
        notify.error(res.error);
        return;
      }
      if (res && "favorited" in res) {
        const next = res.favorited === true;
        setFavorited(next);
        if (next) notify.favoriteAdded();
        else notify.favoriteRemoved();
      }
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={favorited}
      aria-label={favorited ? "Remove from favorites" : "Save to favorites"}
      className={`inline-flex items-center justify-center rounded-full border border-white/80 bg-white/90 p-2 text-zinc-500 shadow-sm backdrop-blur-sm transition hover:scale-105 hover:text-rose-600 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-900/90 dark:text-zinc-400 dark:hover:text-rose-400 ${className}`}
    >
      <Heart
        className={`size-4 ${favorited ? "fill-rose-500 text-rose-500" : ""}`}
        strokeWidth={2.25}
      />
    </button>
  );
}
