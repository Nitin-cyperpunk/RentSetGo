import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/LoginForm";
import { ensureProfileIfMissing, getProfileForUser, isOwnerRole } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Login · RentSetGo",
};

type PageProps = {
  searchParams: Promise<{ message?: string; next?: string }>;
};

function loginBannerMessage(messageKey: string | undefined): string | null {
  if (messageKey === "check-email") {
    return "Check your email to confirm your account, then sign in.";
  }
  if (messageKey === "reset-session") {
    return "Your password reset session expired or is missing. Request a new link from Forgot password.";
  }
  return null;
}

function safeNextPath(raw: string | undefined): string | undefined {
  const t = raw?.trim() ?? "";
  if (t.startsWith("/") && !t.startsWith("//")) return t;
  return undefined;
}

export default async function LoginPage({ searchParams }: PageProps) {
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

  const sp = await searchParams;
  const nextAfterLogin = safeNextPath(sp.next);
  const message = loginBannerMessage(sp.message);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-4 py-16">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Log in</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Use your email and password to continue.</p>
      </div>

      {message && (
        <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-100">
          {message}
        </p>
      )}

      <LoginForm nextPath={nextAfterLogin} />

      <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        No account?{" "}
        <Link href="/signup" className="font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300">
          Sign up
        </Link>
      </p>
    </main>
  );
}
