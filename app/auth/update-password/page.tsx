import Link from "next/link";
import { redirect } from "next/navigation";

import { UpdatePasswordForm } from "@/components/UpdatePasswordForm";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Set new password · RentSetGo",
};

export default async function UpdatePasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?message=reset-session");
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-4 py-16">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Set a new password</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Choose a new password for your account.
        </p>
      </div>

      <UpdatePasswordForm />

      <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        <Link href="/" className="font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400">
          Cancel and go home
        </Link>
      </p>
    </main>
  );
}
