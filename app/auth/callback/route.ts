import { NextResponse } from "next/server";

import { resolvePostAuthRedirect } from "@/lib/auth/post-auth";
import { safeNextPath } from "@/lib/auth/urls";
import { pathWithToast } from "@/lib/toast";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;

  try {
    const code = url.searchParams.get("code");
    const oauthError =
      url.searchParams.get("error_description") ?? url.searchParams.get("error");
    const nextRaw = url.searchParams.get("next") ?? "/";

    if (oauthError) {
      const login = new URL("/login", origin);
      login.searchParams.set("message", "auth-error");
      return NextResponse.redirect(login);
    }

    if (!code) {
      return NextResponse.redirect(new URL(safeNextPath(nextRaw) ?? "/", origin));
    }

    const supabase = await createClient();

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("Exchange session error:", exchangeError);
      const login = new URL("/login", origin);
      login.searchParams.set("message", "auth-error");
      return NextResponse.redirect(login);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("No user after session exchange");
      return NextResponse.redirect(new URL(safeNextPath(nextRaw) ?? "/", origin));
    }

    const { path } = await resolvePostAuthRedirect(supabase, user.id, user, nextRaw);

    return NextResponse.redirect(
      new URL(pathWithToast(path, "welcome-back"), origin),
    );
  } catch (err) {
    console.error("OAuth callback crash:", err);
    return NextResponse.redirect(new URL("/login?message=server-error", origin));
  }
}
