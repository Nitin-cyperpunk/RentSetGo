const AUTH_PREFIXES = ["/login", "/signup", "/forgot-password"] as const;

/** True for login, signup, forgot-password, and signup/complete. */
export function isAuthPath(pathname: string): boolean {
  return AUTH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
