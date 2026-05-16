"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

import { requestPasswordReset } from "@/app/actions/auth";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { authInputClass, authLabelClass, authPrimaryBtnClass } from "@/components/auth/auth-styles";
import { prefersReducedMotion } from "@/lib/motion";

export function ForgotPasswordCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }
    gsap.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setOk(false);
    setPending(true);
    try {
      const result = await requestPasswordReset(new FormData(e.currentTarget));
      if (result?.error) setError(result.error);
      else if (result?.ok) setOk(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      ref={cardRef}
      className="rounded-3xl border border-white/60 bg-white/75 p-6 shadow-2xl shadow-zinc-900/10 ring-1 ring-zinc-900/5 backdrop-blur-xl dark:border-zinc-700/60 dark:bg-zinc-900/55 dark:shadow-black/40 dark:ring-white/10 sm:p-8"
    >
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Reset password
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          We&apos;ll email you a link to choose a new password.
        </p>
      </div>

      {ok ? (
        <AuthAlert variant="success">
          <span className="font-medium">Check your email</span>
          <span className="mt-1 block text-emerald-800/90 dark:text-emerald-200/90">
            If an account exists for that address, a reset link is on its way. It may take a minute.
          </span>
        </AuthAlert>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error ? <AuthAlert variant="error">{error}</AuthAlert> : null}
          <div className="space-y-2">
            <label htmlFor="forgot-email" className={authLabelClass}>
              Email
            </label>
            <input
              id="forgot-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={pending}
              className={authInputClass}
            />
          </div>
          <button type="submit" disabled={pending} className={authPrimaryBtnClass}>
            {pending ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        <Link
          href="/login"
          className="font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          Back to log in
        </Link>
      </p>
    </div>
  );
}
