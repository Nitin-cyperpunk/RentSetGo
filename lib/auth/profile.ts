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

/** DB or metadata may return phone as string or number — normalize before .trim(). */
export function normalizePhoneString(phone: unknown): string | null {
  if (phone == null) return null;
  if (typeof phone === "string") {
    const t = phone.trim();
    return t || null;
  }
  if (typeof phone === "number" && Number.isFinite(phone)) {
    const t = String(Math.trunc(phone)).trim();
    return t || null;
  }
  return null;
}

export function hasProfilePhone(phone: unknown): boolean {
  return Boolean(normalizePhoneString(phone));
}

export async function getProfileForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<ProfileRow | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error || !data) return null;
  const row = data as ProfileRow;
  return { ...row, phone: normalizePhoneString(row.phone) };
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
  const phone = normalizePhoneString(meta?.phone);

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
