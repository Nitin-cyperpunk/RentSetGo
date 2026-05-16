export function AuthDivider() {
  return (
    <div className="relative flex items-center gap-3 py-1">
      <span className="h-px flex-1 bg-zinc-200/90 dark:bg-zinc-700/80" aria-hidden />
      <span className="shrink-0 text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        or continue with email
      </span>
      <span className="h-px flex-1 bg-zinc-200/90 dark:bg-zinc-700/80" aria-hidden />
    </div>
  );
}
