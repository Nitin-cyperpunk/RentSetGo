"use client";

import { useState } from "react";

import { completeProfile } from "@/app/actions/auth";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { authInputClass, authLabelClass, authPrimaryBtnClass } from "@/components/auth/auth-styles";

type Props = {
  defaultName?: string;
  nextPath?: string;
};

export function CompleteProfileForm({ defaultName = "", nextPath }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const result = await completeProfile(new FormData(e.currentTarget));
      if (result?.error) setError(result.error);
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}
      {error ? <AuthAlert variant="error">{error}</AuthAlert> : null}
      <div className="space-y-2">
        <label htmlFor="complete-name" className={authLabelClass}>
          Name
        </label>
        <input
          id="complete-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          disabled={pending}
          defaultValue={defaultName}
          className={authInputClass}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="complete-phone" className={authLabelClass}>
          Phone
        </label>
        <input
          id="complete-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          disabled={pending}
          className={authInputClass}
          placeholder="10-digit mobile"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="complete-role" className={authLabelClass}>
          I am a
        </label>
        <select
          id="complete-role"
          name="role"
          required
          disabled={pending}
          className={authInputClass}
          defaultValue="user"
        >
          <option value="user">Renter / browser</option>
          <option value="owner">Property owner</option>
        </select>
      </div>
      <button type="submit" disabled={pending} className={authPrimaryBtnClass}>
        {pending ? "Saving…" : "Continue"}
      </button>
    </form>
  );
}
