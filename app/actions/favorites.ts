"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function togglePropertyFavorite(propertyId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sign in to save listings." as const };
  }

  const { data: existing, error: readErr } = await supabase
    .from("property_favorites")
    .select("property_id")
    .eq("user_id", user.id)
    .eq("property_id", propertyId)
    .maybeSingle();

  if (readErr) {
    return { error: readErr.message };
  }

  if (existing) {
    const { error } = await supabase
      .from("property_favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("property_id", propertyId);
    if (error) return { error: error.message };
    revalidatePath("/");
    revalidatePath("/favorites");
    return { favorited: false as const };
  }

  const { error } = await supabase.from("property_favorites").insert({
    user_id: user.id,
    property_id: propertyId,
  });
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/favorites");
  return { favorited: true as const };
}
