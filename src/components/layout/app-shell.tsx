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
  Sparkles,
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
    <nav
      className={cn(
        "flex",
        compact ? "flex-col gap-1" : "items-center gap-0.5 rounded-full border border-border/60 bg-elevated/40 p-1",
      )}
    >
      {NAV.map((item) => {
        const active = pathname === item.to || pathname.startsWith(item.to + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 text-sm font-medium transition-all duration-quick ease-smooth",
              compact ? "h-11 justify-start" : "h-9",
              active
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:bg-elevated hover:text-foreground",
            )}
          >
            <Icon className={cn("size-3.5", active && "opacity-90")} />
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
        <header className="sticky top-0 z-40 border-b border-border/80 glass-strong">
          <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
            <Link to="/" className="shrink-0 transition-opacity hover:opacity-90" aria-label="Ngntrade — accueil">
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
              <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex border-border/80">
                <Link to="/premium">
                  <Sparkles className="size-3.5 text-accent" />
                  Premium
                </Link>
              </Button>
              <Button asChild size="sm" className="shadow-[0_0_20px_-6px_color-mix(in_oklab,var(--color-accent)_40%,transparent)]">
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
            <div className="hidden border-t border-border/50 md:block">
              <div className="mx-auto flex max-w-6xl justify-center py-2">
                <NavLinks />
              </div>
            </div>
          ) : null}
        </header>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="left" className="border-border bg-card">
            <Logo className="mb-8" />
            <NavLinks onNavigate={() => setOpen(false)} compact />
            <div className="mt-8 space-y-2 border-t border-border pt-6">
              <Button asChild className="w-full" onClick={() => setOpen(false)}>
                <Link to="/analyzer">Nouvelle analyse</Link>
              </Button>
              <Button asChild variant="outline" className="w-full" onClick={() => setOpen(false)}>
                <Link to="/premium">Premium & EA MT5</Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex-1 pb-20 md:pb-0">{children}</div>

        {/* Mobile bottom nav */}
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 glass-strong md:hidden">
          <div className="mx-auto flex max-w-lg items-stretch justify-between px-1 py-1">
            {NAV.slice(0, 5).map((item) => {
              const active = pathname === item.to;
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-[10px] font-medium transition-colors",
                    active ? "text-accent" : "text-subtle hover:text-muted-foreground",
                  )}
                >
                  <Icon className={cn("size-5", active && "stroke-[2.25px]")} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <footer className="mt-auto border-t border-border/80 bg-card/40 py-10">
          <div className="mx-auto max-w-6xl space-y-8 px-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PARTNERS.map((p) => (
                <a
                  key={p.id}
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="card-lift group rounded-xl border border-border bg-card/80 p-4"
                >
                  <p className="text-[10px] font-semibold tracking-wider text-subtle uppercase">
                    {p.tag}
                  </p>
                  <p className="mt-1 font-display text-base font-semibold group-hover:text-accent transition-colors">
                    {p.name}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {p.blurb}
                  </p>
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-3 border-t border-border/60 pt-6 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-2xl text-xs leading-relaxed text-subtle">
                {LEGAL_DISCLAIMER}
              </p>
              <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
                <p className="text-xs text-muted-foreground">
                  Forex · Crypto · Matières · Indices
                </p>
                <Link
                  to="/premium"
                  className="text-xs font-medium text-accent hover:underline"
                >
                  Offre Premium
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </QueryClientProvider>
  );
}
