import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MARKETS, MARKET_LABELS, type Market } from "@/lib/analysis/types";
import { INSTRUMENTS } from "@/lib/markets/instruments";
import { getMarketQuotes } from "@/lib/markets/quotes";
import { TradingViewChart } from "@/components/markets/tradingview-chart";
import { cn, formatPct, formatPrice } from "@/lib/utils";

export const Route = createFileRoute("/markets")({ component: MarketsPage });

function MarketsPage() {
  const [tab, setTab] = useState<Market | "all">("all");
  const [selected, setSelected] = useState("EURUSD");
  const { data, isLoading, isFetching, dataUpdatedAt, refetch, isError } =
    useQuery({
      queryKey: ["quotes"],
      queryFn: () => getMarketQuotes(),
      refetchInterval: 60_000,
      staleTime: 30_000,
    });

  const list =
    tab === "all" ? INSTRUMENTS : INSTRUMENTS.filter((i) => i.market === tab);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-28 md:pb-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-accent uppercase">
            Watchlist
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            Quatre marchés, un analyzer
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Forex, cryptomonnaies, matières premières, indices. Prix via
            Frankfurter, CoinGecko, Yahoo. Clique un actif pour afficher le
            graphique TradingView.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-subtle">
            {isLoading
              ? "Chargement…"
              : dataUpdatedAt
                ? `MAJ ${new Date(dataUpdatedAt).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}`
                : null}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isFetching}
            onClick={() => void refetch()}
            aria-label="Rafraîchir les prix"
          >
            <RefreshCw
              className={cn("size-3.5", isFetching && "animate-spin")}
            />
            Actualiser
          </Button>
        </div>
      </div>

      {isError ? (
        <p className="mt-4 rounded-lg border border-border bg-elevated px-3 py-2 text-xs text-muted-foreground">
          Impossible de joindre les API de marché. Affichage des valeurs de
          secours.
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-1.5">
        <Chip active={tab === "all"} onClick={() => setTab("all")}>
          Tous
        </Chip>
        {MARKETS.map((m) => (
          <Chip key={m} active={tab === m} onClick={() => setTab(m)}>
            {MARKET_LABELS[m]}
          </Chip>
        ))}
      </div>

      <div className="mt-6">
        <TradingViewChart symbol={selected} height={480} />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((ins) => {
          const q = data?.[ins.symbol] ?? {
            price: ins.fallback,
            change: ins.fallbackChange,
          };
          const up = q.change >= 0;
          const live = Boolean(data?.[ins.symbol]);
          const isSelected = selected === ins.symbol;
          return (
            <article
              key={ins.symbol}
              role="button"
              tabIndex={0}
              onClick={() => setSelected(ins.symbol)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelected(ins.symbol);
                }
              }}
              className={cn(
                "cursor-pointer rounded-xl border bg-card p-4 transition-colors",
                isSelected
                  ? "border-accent ring-1 ring-accent/40"
                  : "border-border hover:border-border/80",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-mono text-sm">{ins.symbol}</p>
                    {live && !isLoading ? (
                      <span
                        className="size-1.5 rounded-full bg-bull"
                        title="Cours live"
                      />
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground">{ins.name}</p>
                </div>
                <Badge>{MARKET_LABELS[ins.market]}</Badge>
              </div>
              <p
                className={cn(
                  "mt-4 font-mono text-2xl tabular-nums",
                  isLoading && "opacity-50",
                )}
              >
                {formatPrice(q.price, ins.decimals)}
              </p>
              <p
                className={cn(
                  "mt-1 font-mono text-xs tabular-nums",
                  up ? "text-bull" : "text-bear",
                )}
              >
                {formatPct(q.change)}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(ins.symbol);
                  }}
                >
                  Graphique
                </Button>
                <Button asChild variant="ghost" size="sm" className="px-0">
                  <Link to="/analyzer">Analyser une capture</Link>
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 rounded-full px-3 text-xs font-medium",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-elevated text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}
