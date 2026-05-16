/** Auth routes share a focused layout; URLs stay /login, /signup, etc. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
