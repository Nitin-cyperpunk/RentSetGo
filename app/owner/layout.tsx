import { redirect } from "next/navigation";

import { ensureProfileIfMissing, getProfileForUser, isOwnerRole } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=%2Fowner%2Fdashboard");
  }

  let profile = await getProfileForUser(supabase, user.id);
  if (!profile) {
    profile = await ensureProfileIfMissing(supabase, user);
  }
  if (!isOwnerRole(profile?.role)) {
    redirect("/");
  }

  return <>{children}</>;
}
