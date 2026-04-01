import Link from "next/link";
import type { ReactNode } from "react";
import {
  Building2,
  Home,
  KeyRound,
  LayoutDashboard,
  LogIn,
  LogOut,
} from "lucide-react";

import { signOut } from "@/app/actions/auth";
import { getProfileForUser, isOwnerRole } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let showOwnerNav = false;
  if (user) {
    const profile = await getProfileForUser(supabase, user.id);
    showOwnerNav = isOwnerRole(profile?.role);
  }

  return (
    <nav
      className="pointer-events-none fixed bottom-5 left-1/2 z-50 w-[min(92vw,36rem)] max-w-xl -translate-x-1/2"
      aria-label="Main"
    >
      <div className="animate-nav-mount pointer-events-auto relative">
        {/* Ambient glow under the bar */}
        <div
          className="animate-nav-glow pointer-events-none absolute -inset-6 rounded-[3rem] bg-gradient-to-tr from-emerald-400/25 via-teal-300/15 to-transparent blur-2xl"
          aria-hidden
        />

        <div
          className="relative flex h-[4.25rem] items-center justify-between gap-1 rounded-full border border-white/50 bg-white/45 px-2 py-1 shadow-[0_8px_32px_-4px_rgba(15,80,70,0.12),0_4px_16px_-6px_rgba(0,0,0,0.06)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-zinc-900/55 sm:gap-2 sm:px-3"
          style={{
            boxShadow:
              "inset 0 1px 0 0 rgba(255,255,255,0.65), 0 12px 40px -8px rgba(16,100,85,0.18)",
          }}
        >
          {/* Brand chip */}
          <div className="pointer-events-none absolute -top-9 left-1/2 flex -translate-x-1/2 justify-center">
            <span className="animate-float-soft rounded-full border border-white/60 bg-white/60 px-4 py-1 text-[13px] font-bold tracking-tight shadow-sm backdrop-blur-md dark:border-emerald-500/30 dark:bg-zinc-900/60">
              <span className="bg-gradient-to-br from-emerald-700 via-teal-700 to-zinc-800 bg-clip-text text-transparent dark:from-emerald-300 dark:via-teal-300 dark:to-zinc-100">
                RentSetGo
              </span>
            </span>
          </div>

          <NavItem href="/" label="Browse">
            <Home className="size-[1.15rem] shrink-0" strokeWidth={2.25} />
          </NavItem>

          {showOwnerNav ? (
            <>
              <NavItem href="/owner/dashboard" label="Dashboard">
                <LayoutDashboard className="size-[1.15rem] shrink-0" strokeWidth={2.25} />
              </NavItem>
              <NavItem href="/owner/my-properties" label="Listings">
                <Building2 className="size-[1.15rem] shrink-0" strokeWidth={2.25} />
              </NavItem>
            </>
          ) : null}

          {user ? (
            <form action={signOut} className="contents">
              <NavButton type="submit" label="Log out" ariaLabel="Log out">
                <LogOut className="size-[1.15rem] shrink-0" strokeWidth={2.25} />
              </NavButton>
            </form>
          ) : (
            <>
              <NavItem href="/login" label="Log in">
                <LogIn className="size-[1.15rem] shrink-0" strokeWidth={2.25} />
              </NavItem>
              <NavItem href="/signup" label="Sign up" accent>
                <KeyRound className="size-[1.15rem] shrink-0" strokeWidth={2.25} />
              </NavItem>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavItem({
  href,
  label,
  children,
  accent,
}: {
  href: string;
  label: string;
  children: ReactNode;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex min-w-[2.75rem] flex-col items-center justify-center rounded-2xl px-2 py-1.5 text-[11px] font-semibold transition-all duration-200 sm:min-w-[3.25rem] sm:px-3 sm:text-xs ${
        accent
          ? "bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25 hover:brightness-110 active:scale-[0.97]"
          : "text-zinc-600 hover:bg-white/60 hover:text-emerald-800 active:scale-[0.97] dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-emerald-300"
      } `}
      aria-label={label}
    >
      <span className="mb-0.5 transition-transform duration-200 group-hover:scale-110">{children}</span>
      <span className="leading-none">{label}</span>
    </Link>
  );
}

function NavButton({
  type,
  label,
  children,
  ariaLabel,
}: {
  type: "button" | "submit";
  label: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  return (
    <button
      type={type}
      className="group flex min-w-[2.75rem] flex-col items-center justify-center rounded-2xl px-2 py-1.5 text-[11px] font-semibold text-zinc-500 transition-all duration-200 hover:bg-white/55 hover:text-emerald-800 active:scale-[0.97] dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-emerald-300 sm:min-w-[3.25rem] sm:px-3 sm:text-xs"
      aria-label={ariaLabel ?? label}
    >
      <span className="mb-0.5 transition-transform duration-200 group-hover:scale-110">{children}</span>
      <span className="leading-none">{label}</span>
    </button>
  );
}
