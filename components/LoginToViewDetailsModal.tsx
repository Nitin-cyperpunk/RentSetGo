"use client";

import Link from "next/link";
import { useEffect } from "react";

import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { AuthDivider } from "@/components/auth/AuthDivider";

type Props = {
  open: boolean;
  onClose: () => void;
  loginHref: string;
  /** Shown in the modal when viewing a specific listing */
  listingTitle?: string;
  nextPath?: string;
};

export function LoginToViewDetailsModal({
  open,
  onClose,
  loginHref,
  listingTitle,
  nextPath,
}: Props) {
  const signupHref = nextPath
    ? `/signup?next=${encodeURIComponent(nextPath)}`
    : "/signup";

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-to-view-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div className="relative z-[1] w-full max-w-md rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
        <h2
          id="login-to-view-title"
          className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
        >
          Sign in to view this listing
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {listingTitle ? (
            <>
              Create a free account or sign in to see photos, contact details, and full
              information for <span className="font-medium text-zinc-800 dark:text-zinc-200">{listingTitle}</span>.
            </>
          ) : (
            <>Create a free account or sign in to see full property details and contact the owner.</>
          )}
        </p>

        <div className="mt-6 space-y-4">
          <GoogleSignInButton nextPath={nextPath} />
          <AuthDivider />
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href={loginHref}
              className="inline-flex flex-1 items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              Sign in with email
            </Link>
            <Link
              href={signupHref}
              className="inline-flex flex-1 items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              Create account
            </Link>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full text-center text-sm font-medium text-zinc-500 transition hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          Keep browsing listings
        </button>
      </div>
    </div>
  );
}
