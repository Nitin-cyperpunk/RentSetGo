/** Relative in-app path only — blocks open redirects. */
export function safeNextPath(raw: string | undefined | null): string | undefined {
  const t = (raw ?? "").trim();
  if (t.startsWith("/") && !t.startsWith("//")) return t;
  return undefined;
}

export function getAuthOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin.replace(/\/$/, "");
  }
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (env) return env.replace(/\/$/, "");
  return "http://localhost:3000";
}

export function buildOAuthRedirectUrl(nextPath?: string): string {
  const origin = getAuthOrigin();
  const next = safeNextPath(nextPath) ?? "/";
  return `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
}
