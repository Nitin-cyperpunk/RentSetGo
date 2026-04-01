import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SignupForm } from "@/components/SignupForm";
import { ensureProfileIfMissing, getProfileForUser, isOwnerRole } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Sign up · RentSetGo",
};

export default async function SignupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    let profile = await getProfileForUser(supabase, user.id);
    if (!profile) {
      profile = await ensureProfileIfMissing(supabase, user);
    }
    redirect(isOwnerRole(profile?.role) ? "/owner/dashboard" : "/");
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-4 py-16">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Create account</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Join RentSetGo to list and manage properties.</p>
      </div>

      <Suspense fallback={<p className="text-center text-sm text-zinc-500">Loading…</p>}>
        <SignupForm />
      </Suspense>

      <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300">
          Log in
        </Link>
      </p>
    </main>
  );
}
