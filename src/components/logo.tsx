import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("size-8", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ngn-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0c0f14" />
          <stop offset="100%" stopColor="#12161e" />
        </linearGradient>
        <linearGradient id="ngn-g" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#3d8b6a" />
          <stop offset="100%" stopColor="#6bc49a" />
        </linearGradient>
        <linearGradient id="ngn-r" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d47878" />
          <stop offset="100%" stopColor="#a84e4e" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#ngn-bg)" />
      <rect
        x="3"
        y="3"
        width="58"
        height="58"
        rx="12"
        fill="none"
        stroke="#1e2530"
        strokeWidth="1.5"
      />
      <rect x="16" y="14" width="3" height="36" rx="1.2" fill="url(#ngn-g)" />
      <rect x="11" y="26" width="13" height="18" rx="2" fill="url(#ngn-g)" />
      <rect x="45" y="14" width="3" height="36" rx="1.2" fill="url(#ngn-r)" />
      <rect x="40" y="20" width="13" height="16" rx="2" fill="url(#ngn-r)" />
      <path
        d="M26 46 V18 L38 46 V18"
        fill="none"
        stroke="#e8ecf1"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
