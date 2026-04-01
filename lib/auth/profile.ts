import type { SupabaseClient, User } from "@supabase/supabase-js";

import { sendWelcomeEmail } from "@/lib/email/send-welcome-email";

export type ProfileRole = "user" | "owner";

export type ProfileRow = {
  id: string;
  name: string | null;
  role: ProfileRole | string;
  phone: string | null;
  created_at: string;
};

export async function getProfileForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<ProfileRow | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error || !data) return null;
  return data as ProfileRow;
}

/**
 * Creates a `profiles` row from `user.user_metadata` when missing (e.g. email-confirm flow
 * had no session at signup, so insert could not run).
 */
export async function ensureProfileIfMissing(
  supabase: SupabaseClient,
  user: User
): Promise<ProfileRow | null> {
  const existing = await getProfileForUser(supabase, user.id);
  if (existing) return existing;

  const meta = user.user_metadata as Record<string, unknown> | null;
  const name =
    typeof meta?.name === "string" && meta.name.trim()
      ? meta.name.trim()
      : (user.email?.split("@")[0] ?? "User");
  const roleRaw = typeof meta?.role === "string" ? meta.role : "user";
  const role = roleRaw === "owner" ? "owner" : "user";
  const phoneRaw = typeof meta?.phone === "string" ? meta.phone.trim() : "";
  const phone = phoneRaw || null;

  const { error } = await supabase.from("profiles").insert({
    id: user.id,
    name,
    role,
    phone,
  });
  if (error) {
    console.error("[ensureProfileIfMissing]", error);
    return null;
  }

  const addr = user.email?.trim();
  if (addr) {
    try {
      await sendWelcomeEmail({ to: addr, name });
    } catch (e) {
      console.error("[ensureProfileIfMissing] welcome email", e);
    }
  }

  return getProfileForUser(supabase, user.id);
}

export function isOwnerRole(role: string | null | undefined): boolean {
  return role === "owner";
}
