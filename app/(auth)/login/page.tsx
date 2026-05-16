import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth/AuthCard";
import { AuthShell } from "@/components/auth/AuthShell";
import { ensureProfileIfMissing, getProfileForUser, isOwnerRole } from "@/lib/auth/profile";
import { loginBannerMessage } from "@/lib/auth/messages";
import { safeNextPath } from "@/lib/auth/urls";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Login · RentSetGo",
};

type PageProps = {
  searchParams: Promise<{ message?: string; next?: string }>;
};

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
    if (profile && !profile.phone?.trim()) {
      redirect("/signup/complete");
    }
    redirect(isOwnerRole(profile?.role) ? "/owner/dashboard" : "/");
  }

  const sp = await searchParams;
  const nextAfterLogin = safeNextPath(sp.next);
  const banner = loginBannerMessage(sp.message);

  return (
    <AuthShell>
      <AuthCard
        mode="login"
        nextPath={nextAfterLogin}
        bannerMessage={banner.text}
        bannerVariant={banner.variant}
      />
    </AuthShell>
  );
}
