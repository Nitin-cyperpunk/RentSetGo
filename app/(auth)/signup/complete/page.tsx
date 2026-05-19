import { redirect } from "next/navigation";

import { CompleteProfileForm } from "@/components/auth/CompleteProfileForm";
import { AuthShell } from "@/components/auth/AuthShell";
import { getProfileForUser, hasProfilePhone, isOwnerRole } from "@/lib/auth/profile";
import { safeNextPath } from "@/lib/auth/urls";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Complete profile · RentSetGo",
};

type PageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function SignupCompletePage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfileForUser(supabase, user.id);
  const sp = await searchParams;
  const nextPath = safeNextPath(sp.next);

  const profileWithPhone =
    profile && hasProfilePhone(profile.phone) ? profile : null;
  if (profileWithPhone) {
    if (nextPath) redirect(nextPath);
    redirect(
      isOwnerRole(profileWithPhone.role) ? "/owner/dashboard" : "/",
    );
  }

  const defaultName =
    profile?.name?.trim() ||
    (typeof user.user_metadata?.name === "string" ? user.user_metadata.name : "") ||
    user.email?.split("@")[0] ||
    "";

  return (
    <AuthShell>
      <div className="rounded-3xl border border-white/60 bg-white/75 p-6 shadow-2xl shadow-zinc-900/10 ring-1 ring-zinc-900/5 backdrop-blur-xl dark:border-zinc-700/60 dark:bg-zinc-900/55 dark:shadow-black/40 dark:ring-white/10 sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            One more step
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Add your phone and role so we can connect you with the right experience.
          </p>
        </div>
        <CompleteProfileForm defaultName={defaultName} nextPath={nextPath} />
      </div>
    </AuthShell>
  );
}
