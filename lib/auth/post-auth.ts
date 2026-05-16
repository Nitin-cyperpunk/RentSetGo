import type { SupabaseClient } from "@supabase/supabase-js";

import {
  ensureProfileIfMissing,
  getProfileForUser,
  isOwnerRole,
  type ProfileRow,
} from "@/lib/auth/profile";
import { safeNextPath } from "@/lib/auth/urls";

export type PostAuthResult = {
  path: string;
};

/**
 * After OAuth or session exchange: ensure profile exists and pick redirect.
 * New Google users without phone go to profile completion.
 */
export async function resolvePostAuthRedirect(
  supabase: SupabaseClient,
  userId: string,
  user: Parameters<typeof ensureProfileIfMissing>[1],
  nextRaw?: string | null,
): Promise<PostAuthResult> {
  let profile: ProfileRow | null = await getProfileForUser(supabase, userId);
  if (!profile) {
    profile = await ensureProfileIfMissing(supabase, user);
  }

  const safeNext = safeNextPath(nextRaw ?? undefined);

  if (profile && !profile.phone?.trim()) {
    const complete = safeNext
      ? `/signup/complete?next=${encodeURIComponent(safeNext)}`
      : "/signup/complete";
    return { path: complete };
  }

  if (safeNext) {
    return { path: safeNext };
  }

  return {
    path: isOwnerRole(profile?.role) ? "/owner/dashboard" : "/",
  };
}
