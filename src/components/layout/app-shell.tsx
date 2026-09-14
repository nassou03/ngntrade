import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  CandlestickChart,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Plus,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { LEGAL_DISCLAIMER, PARTNERS } from "@/lib/monetization";

const NAV = [
  { to: "/analyzer", label: "Analyser", icon: CandlestickChart },
  { to: "/copilot", label: "Copilote", icon: MessageSquare },
  { to: "/journal", label: "Journal", icon: BookOpen },
  { to: "/dashboard", label: "Performance", icon: LayoutDashboard },
  { to: "/calendar", label: "Calendrier", icon: CalendarDays },
  { to: "/markets", label: "Marchés", icon: BarChart3 },
] as const;

function NavLinks({
  onNavigate,
  compact,
}: {
  onNavigate?: () => void;
  compact?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className={cn("flex", compact ? "flex-col gap-1" : "items-center gap-1")}>
      {NAV.map((item) => {
        const active = pathname === item.to;
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "inline-flex h-11 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors duration-quick ease-smooth",
              active
                ? "bg-elevated text-foreground"
                : "text-muted-foreground hover:bg-elevated hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60_000, retry: 0 } },
      }),
  );
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/";

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-dvh flex-col bg-background text-foreground">
        <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-sm">
          <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
            <Link to="/" className="shrink-0" aria-label="Ngntrade — accueil">
              <Logo />
            </Link>
            <div className="hidden flex-1 md:flex md:justify-center">
              {!isHome ? <NavLinks /> : null}
            </div>
            <div className="ml-auto flex items-center gap-2">
              {isHome ? (
                <Button asChild size="sm" variant="ghost" className="hidden md:inline-flex">
                  <Link to="/markets">Marchés</Link>
                </Button>
              ) : null}
              <Button asChild size="sm">
                <Link to="/analyzer">
                  <Plus className="size-4" />
                  <span className="hidden sm:inline">Nouvelle analyse</span>
                  <span className="sm:hidden">Analyser</span>
                </Link>
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="md:hidden"
                onClick={() => setOpen(true)}
                aria-label="Menu"
              >
                <Menu className="size-4" />
              </Button>
            </div>
          </div>
          {isHome ? (
            <div className="hidden border-t border-border md:block">
              <div className="mx-auto flex max-w-6xl justify-center py-1">
                <NavLinks />
              </div>
            </div>
          ) : null}
        </header>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="left">
            <Logo className="mb-6" />
            <NavLinks onNavigate={() => setOpen(false)} compact />
          </SheetContent>
        </Sheet>

        <div className="flex-1 pb-16 md:pb-0">{children}</div>

        <footer className="border-t border-border py-8">
          <div className="mx-auto max-w-6xl space-y-6 px-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {PARTNERS.map((p) => (
                <a
                  key={p.id}
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="rounded-lg border border-border bg-card/50 px-3 py-2 transition-colors hover:border-accent/40"
                >
                  <p className="text-[10px] font-medium tracking-wide text-accent uppercase">
                    {p.tag}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-foreground">{p.name}</p>
                  <p className="mt-0.5 text-[11px] text-subtle">{p.blurb}</p>
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-2 text-xs text-subtle sm:flex-row sm:items-start sm:justify-between">
              <p className="max-w-2xl leading-relaxed">{LEGAL_DISCLAIMER}</p>
              <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
                <p>Forex · Crypto · Matières · Indices</p>
                <Link to="/premium" className="text-accent hover:underline">
                  Offre Premium
                </Link>
              </div>
            </div>
          </div>
        </footer>

        <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] md:hidden">
          {NAV.slice(0, 5).map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] font-medium",
                  active ? "text-foreground" : "text-subtle",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </QueryClientProvider>
  );
}
