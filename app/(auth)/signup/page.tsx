import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth/AuthCard";
import { AuthShell } from "@/components/auth/AuthShell";
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
    if (profile && !profile.phone?.trim()) {
      redirect("/signup/complete");
    }
    redirect(isOwnerRole(profile?.role) ? "/owner/dashboard" : "/");
  }

  return (
    <AuthShell>
      <AuthCard mode="signup" />
    </AuthShell>
  );
}
