import * as React from "react";
import { Drawer } from "vaul";
import { cn } from "@/lib/utils";

function Sheet({
  open,
  onOpenChange,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </Drawer.Root>
  );
}

function SheetTrigger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Drawer.Trigger className={className} asChild>
      {children}
    </Drawer.Trigger>
  );
}

function SheetContent({
  children,
  className,
  side = "bottom",
}: {
  children: React.ReactNode;
  className?: string;
  side?: "bottom" | "left";
}) {
  return (
    <Drawer.Portal>
      <Drawer.Overlay className="fixed inset-0 z-50 bg-background/70" />
      <Drawer.Content
        className={cn(
          "fixed z-50 flex flex-col bg-card text-card-foreground outline-none",
          side === "bottom"
            ? "inset-x-0 bottom-0 max-h-[88dvh] rounded-t-xl border-t border-border"
            : "inset-y-0 left-0 h-full w-[min(20rem,86vw)] border-r border-border",
          className,
        )}
      >
        {side === "bottom" ? (
          <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-border" />
        ) : null}
        <div className="overflow-y-auto p-5">{children}</div>
      </Drawer.Content>
    </Drawer.Portal>
  );
}

export { Sheet, SheetTrigger, SheetContent };
