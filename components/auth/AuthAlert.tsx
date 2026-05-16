type Variant = "error" | "success" | "info";

const styles: Record<Variant, string> = {
  error:
    "border-red-200/90 bg-red-50/95 text-red-900 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-100",
  success:
    "border-emerald-200/90 bg-emerald-50/95 text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-100",
  info: "border-zinc-200/90 bg-zinc-50/95 text-zinc-800 dark:border-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-200",
};

type Props = {
  variant?: Variant;
  children: React.ReactNode;
};

export function AuthAlert({ variant = "error", children }: Props) {
  return (
    <p
      className={`rounded-xl border px-4 py-3 text-sm ${styles[variant]}`}
      role={variant === "error" ? "alert" : "status"}
    >
      {children}
    </p>
  );
}
