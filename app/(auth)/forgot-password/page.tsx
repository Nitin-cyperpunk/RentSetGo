import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordCard } from "@/components/auth/ForgotPasswordCard";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Forgot password · RentSetGo",
};

export default async function ForgotPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect("/");
  }

  return (
    <AuthShell>
      <ForgotPasswordCard />
    </AuthShell>
  );
}
