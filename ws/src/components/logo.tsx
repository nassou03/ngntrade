import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-8", className)}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="var(--color-elevated)" />
      <rect x="10.5" y="6" width="1.4" height="20" fill="var(--color-bull)" />
      <rect x="8" y="12" width="6.4" height="11" rx="1" fill="var(--color-bull)" />
      <rect x="20.1" y="7" width="1.4" height="18" fill="var(--color-accent)" />
      <rect x="17.6" y="10" width="6.4" height="9" rx="1" fill="var(--color-accent)" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      <span className="font-display text-lg font-semibold tracking-tight">
        Ngn<span className="text-accent">trade</span>
      </span>
    </span>
  );
}
