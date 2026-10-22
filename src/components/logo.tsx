import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <img
      src="/logo-ngn.png"
      alt=""
      width={32}
      height={32}
      className={cn("size-8 rounded-full object-cover", className)}
      aria-hidden="true"
    />
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
