import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { resolvePostAuthRedirect } from "@/lib/auth/post-auth";
import { safeNextPath } from "@/lib/auth/urls";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const oauthError = url.searchParams.get("error_description") ?? url.searchParams.get("error");
  const nextRaw = url.searchParams.get("next") ?? "/";

  if (oauthError) {
    const login = new URL("/login", url.origin);
    login.searchParams.set("message", "auth-error");
    return NextResponse.redirect(login);
  }

  if (!code) {
    return NextResponse.redirect(new URL(safeNextPath(nextRaw) ?? "/", url.origin));
  }

  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(new URL("/", url.origin));
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          /* Server Component context */
        }
      },
    },
  });

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    const login = new URL("/login", url.origin);
    login.searchParams.set("message", "auth-error");
    return NextResponse.redirect(login);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL(safeNextPath(nextRaw) ?? "/", url.origin));
  }

  const { path } = await resolvePostAuthRedirect(supabase, user.id, user, nextRaw);
  return NextResponse.redirect(new URL(path, url.origin));
}
