"use client";

import { usePathname } from "next/navigation";

import { isAuthPath } from "@/lib/auth/routes";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  footer: React.ReactNode;
  navbar: React.ReactNode;
};

export function AppShell({ children, footer, navbar }: Props) {
  const pathname = usePathname();
  const authPage = isAuthPath(pathname);

  return (
    <>
      <div
        className={cn("flex min-h-full flex-1 flex-col", !authPage && "pb-24 sm:pb-28")}
      >
        {children}
        {!authPage ? footer : null}
      </div>
      {!authPage ? navbar : null}
    </>
  );
}
