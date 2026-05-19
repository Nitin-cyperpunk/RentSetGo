"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { safeNextPath } from "@/lib/auth/urls";
import { pathWithToast } from "@/lib/toast";
import {
  ensureProfileIfMissing,
  getProfileForUser,
  isOwnerRole,
} from "@/lib/auth/profile";
import { sendWelcomeEmail } from "@/lib/email/send-welcome-email";
import { getSiteOrigin } from "@/lib/site-origin";
import { createClient } from "@/lib/supabase/server";

export async function signInWithPassword(
  formData: FormData
): Promise<{ error?: string } | void> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: error.message };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Could not establish a session." };
  }

  let profile = await getProfileForUser(supabase, user.id);
  if (!profile) {
    profile = await ensureProfileIfMissing(supabase, user);
  }

  revalidatePath("/", "layout");

  const safeNext = safeNextPath(String(formData.get("next") ?? ""));
  if (safeNext) {
    redirect(pathWithToast(safeNext, "welcome-back"));
  }

  redirect(
    pathWithToast(isOwnerRole(profile?.role) ? "/owner/dashboard" : "/", "welcome-back"),
  );
}

export async function completeProfile(
  formData: FormData,
): Promise<{ error?: string } | void> {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const roleRaw = String(formData.get("role") ?? "").trim();
  const selectedRole = roleRaw === "owner" ? "owner" : "user";

  if (!name || !phone) {
    return { error: "Name and phone are required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Your session expired. Please sign in again." };
  }

  await supabase.auth.updateUser({
    data: { name, phone, role: selectedRole },
  });

  const existing = await getProfileForUser(supabase, user.id);
  if (existing) {
    const { error } = await supabase
      .from("profiles")
      .update({ name, phone, role: selectedRole })
      .eq("id", user.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("profiles").insert({
      id: user.id,
      name,
      role: selectedRole,
      phone,
    });
    if (error) return { error: error.message };
  }

  revalidatePath("/", "layout");

  const safeNext = safeNextPath(String(formData.get("next") ?? ""));
  if (safeNext) {
    redirect(safeNext);
  }

  redirect(isOwnerRole(selectedRole) ? "/owner/dashboard" : "/");
}

export async function signUpWithPassword(
  formData: FormData
): Promise<{ error?: string } | void> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const phone = String(formData.get("phone") ?? "").trim();
  const roleRaw = String(formData.get("role") ?? "").trim();
  const selectedRole = roleRaw === "owner" ? "owner" : "user";

  if (!name || !email || !password || !phone) {
    return { error: "Name, email, password, and phone are required." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role: selectedRole,
        phone,
      },
    },
  });

  if (error) {
    console.error("[signUpWithPassword]", error);
    return { error: error.message };
  }

  const userId = data.user?.id;
  if (!userId) {
    return { error: "Could not create user." };
  }

  revalidatePath("/", "layout");

  // Immediate session: insert profile while authenticated (RLS allows insert own row).
  if (data.session) {
    const { error: insertErr } = await supabase.from("profiles").insert({
      id: userId,
      name,
      role: selectedRole,
      phone,
    });
    if (insertErr) {
      console.error("[signUpWithPassword] profile insert", insertErr);
      return {
        error: `Account created but profile could not be saved: ${insertErr.message}`,
      };
    }

    try {
      await sendWelcomeEmail({ to: email, name });
    } catch (e) {
      console.error("[signUpWithPassword] welcome email", e);
    }

    const profile = await getProfileForUser(supabase, userId);
    redirect(
      pathWithToast(isOwnerRole(profile?.role) ? "/owner/dashboard" : "/", "welcome"),
    );
  }

  // Email confirmation enabled: no session yet — metadata is stored for ensureProfileIfMissing on first login.
  redirect("/login?message=check-email");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function requestPasswordReset(
  formData: FormData,
): Promise<{ error?: string; ok?: boolean }> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { error: "Email is required." };
  }

  const supabase = await createClient();
  const origin = await getSiteOrigin();
  const next = encodeURIComponent("/auth/update-password");
  const redirectTo = `${origin}/auth/callback?next=${next}`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    return { error: error.message };
  }

  return { ok: true };
}

export async function updatePassword(
  formData: FormData,
): Promise<{ error?: string } | void> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }
  if (password !== confirm) {
    return { error: "Passwords do not match." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Your session expired. Request a new reset link from the login page." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");

  let profile = await getProfileForUser(supabase, user.id);
  if (!profile) {
    profile = await ensureProfileIfMissing(supabase, user);
  }

  redirect(
    pathWithToast(isOwnerRole(profile?.role) ? "/owner/dashboard" : "/", "password-updated"),
  );
}
