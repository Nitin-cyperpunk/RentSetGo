"use client";

import { useState } from "react";

import { signUpWithPassword } from "@/app/actions/auth";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { authInputClass, authLabelClass, authPrimaryBtnClass } from "@/components/auth/auth-styles";

type Props = {
  disabled?: boolean;
};

export function SignupEmailForm({ disabled }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const result = await signUpWithPassword(new FormData(e.currentTarget));
      if (result?.error) setError(result.error);
    } finally {
      setPending(false);
    }
  }

  const isDisabled = pending || disabled;

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error ? <AuthAlert variant="error">{error}</AuthAlert> : null}
      <div className="space-y-2">
        <label htmlFor="signup-name" className={authLabelClass}>
          Name
        </label>
        <input
          id="signup-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          disabled={isDisabled}
          className={authInputClass}
          placeholder="Your name"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="signup-email" className={authLabelClass}>
          Email
        </label>
        <input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={isDisabled}
          className={authInputClass}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="signup-phone" className={authLabelClass}>
          Phone
        </label>
        <input
          id="signup-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          disabled={isDisabled}
          className={authInputClass}
          placeholder="10-digit mobile"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="signup-role" className={authLabelClass}>
          I am a
        </label>
        <select
          id="signup-role"
          name="role"
          required
          disabled={isDisabled}
          className={authInputClass}
        >
          <option value="user">Renter / browser</option>
          <option value="owner">Property owner</option>
        </select>
      </div>
      <div className="space-y-2">
        <label htmlFor="signup-password" className={authLabelClass}>
          Password
        </label>
        <input
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          disabled={isDisabled}
          className={authInputClass}
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">At least 6 characters.</p>
      </div>
      <button type="submit" disabled={isDisabled} className={authPrimaryBtnClass}>
        {pending ? "Creating account…" : "Create account with email"}
      </button>
    </form>
  );
}
