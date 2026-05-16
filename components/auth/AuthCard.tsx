"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

import { AuthAlert } from "@/components/auth/AuthAlert";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { LoginEmailForm } from "@/components/auth/LoginEmailForm";
import { SignupEmailForm } from "@/components/auth/SignupEmailForm";
import { prefersReducedMotion } from "@/lib/motion";

type Mode = "login" | "signup";

type Props = {
  mode: Mode;
  nextPath?: string;
  bannerMessage?: string | null;
  bannerVariant?: "success" | "info" | "error";
};

export function AuthCard({
  mode,
  nextPath,
  bannerMessage,
  bannerVariant = "success",
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [emailOpen, setEmailOpen] = useState(mode === "login");

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }
    gsap.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" });
  }, []);

  const title = mode === "login" ? "Welcome back" : "Create your account";
  const subtitle =
    mode === "login"
      ? "Sign in to save listings and manage properties."
      : "Join RentSetGo to browse and list rentals in Nashik.";

  const switchHref =
    mode === "login"
      ? nextPath
        ? `/signup?next=${encodeURIComponent(nextPath)}`
        : "/signup"
      : "/login";
  const switchLabel = mode === "login" ? "Sign up" : "Log in";
  const switchPrompt = mode === "login" ? "Don't have an account?" : "Already have an account?";

  return (
    <div
      ref={cardRef}
      className="rounded-3xl border border-white/60 bg-white/75 p-6 shadow-2xl shadow-zinc-900/10 ring-1 ring-zinc-900/5 backdrop-blur-xl dark:border-zinc-700/60 dark:bg-zinc-900/55 dark:shadow-black/40 dark:ring-white/10 sm:p-8"
    >
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{subtitle}</p>
      </div>

      {bannerMessage ? (
        <div className="mb-5">
          <AuthAlert variant={bannerVariant}>{bannerMessage}</AuthAlert>
        </div>
      ) : null}

      <GoogleSignInButton nextPath={nextPath} />

      <div className="my-6">
        <AuthDivider />
      </div>

      {mode === "signup" && !emailOpen ? (
        <button
          type="button"
          onClick={() => setEmailOpen(true)}
          className="w-full rounded-xl border border-dashed border-zinc-300/90 bg-zinc-50/80 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:border-emerald-400/60 hover:bg-emerald-50/50 dark:border-zinc-600 dark:bg-zinc-950/40 dark:text-zinc-300 dark:hover:border-emerald-600/50 dark:hover:bg-emerald-950/30"
        >
          Sign up with email instead
        </button>
      ) : (
        <>
          {mode === "signup" && emailOpen ? (
            <button
              type="button"
              onClick={() => setEmailOpen(false)}
              className="mb-3 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              ← Back to Google sign up
            </button>
          ) : null}
          {mode === "login" ? (
            <LoginEmailForm nextPath={nextPath} />
          ) : (
            <SignupEmailForm />
          )}
        </>
      )}

      <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        {switchPrompt}{" "}
        <Link
          href={switchHref}
          className="font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          {switchLabel}
        </Link>
      </p>
    </div>
  );
}
