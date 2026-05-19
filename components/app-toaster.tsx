"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Toaster, toast } from "sonner";
import { useTheme } from "next-themes";

import { TOAST_BY_ID } from "@/lib/toast";

function ToastFromUrlInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const shown = useRef<string | null>(null);

  useEffect(() => {
    const id = searchParams.get("toast");
    if (!id || shown.current === id) return;
    shown.current = id;

    const msg = TOAST_BY_ID[id];
    if (msg) {
      toast.success(msg.title, { description: msg.description });
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete("toast");
    const qs = params.toString();
    router.replace(qs ? `${window.location.pathname}?${qs}` : window.location.pathname, {
      scroll: false,
    });
  }, [searchParams, router]);

  return null;
}

export function ToastFromUrl() {
  return (
    <Suspense fallback={null}>
      <ToastFromUrlInner />
    </Suspense>
  );
}

export function AppToaster() {
  const { resolvedTheme } = useTheme();

  return (
    <>
      <Toaster
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        position="top-center"
        richColors
        closeButton
        duration={4500}
        toastOptions={{
          className: "font-sans text-sm",
        }}
      />
      <ToastFromUrl />
    </>
  );
}
