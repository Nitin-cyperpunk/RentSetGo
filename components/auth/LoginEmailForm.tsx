"use client";

import Link from "next/link";
import { useState } from "react";

import { signInWithPassword } from "@/app/actions/auth";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { authInputClass, authLabelClass, authPrimaryBtnClass } from "@/components/auth/auth-styles";

type Props = {
  nextPath?: string;
  disabled?: boolean;
};

export function LoginEmailForm({ nextPath, disabled }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const result = await signInWithPassword(new FormData(e.currentTarget));
      if (result?.error) setError(result.error);
    } finally {
      setPending(false);
    }
  }

  const isDisabled = pending || disabled;

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}
      {error ? <AuthAlert variant="error">{error}</AuthAlert> : null}
      <div className="space-y-2">
        <label htmlFor="login-email" className={authLabelClass}>
          Email
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={isDisabled}
          className={authInputClass}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="login-password" className={authLabelClass}>
          Password
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={isDisabled}
          className={authInputClass}
        />
        <p className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            Forgot password?
          </Link>
        </p>
      </div>
      <button type="submit" disabled={isDisabled} className={authPrimaryBtnClass}>
        {pending ? "Signing in…" : "Sign in with email"}
      </button>
    </form>
  );
}
