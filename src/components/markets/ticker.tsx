import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { INSTRUMENTS } from "@/lib/markets/instruments";
import { getMarketQuotes } from "@/lib/markets/quotes";
import { cn, formatPct, formatPrice } from "@/lib/utils";

const HIGHLIGHT = [
  "EURUSD",
  "GBPUSD",
  "BTCUSD",
  "ETHUSD",
  "XAUUSD",
  "NAS100",
  "US500",
  "WTI",
] as const;

type Props = {
  /** Nombre max d’instruments affichés (bandeau compact) */
  limit?: number;
  className?: string;
};

export function MarketTicker({ limit = 8, className }: Props) {
  const { data, isLoading, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ["quotes"],
    queryFn: () => getMarketQuotes(),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const symbols = HIGHLIGHT.slice(0, limit);
  const items = symbols.map((symbol) => {
    const ins = INSTRUMENTS.find((i) => i.symbol === symbol)!;
    const q = data?.[symbol] ?? {
      price: ins.fallback,
      change: ins.fallbackChange,
    };
    return { ins, q };
  });

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card/60",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-1.5">
        <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
          Marchés live
        </p>
        <div className="flex items-center gap-2">
          {isFetching || isLoading ? (
            <span className="size-1.5 animate-pulse rounded-full bg-accent" />
          ) : (
            <span className="size-1.5 rounded-full bg-bull" />
          )}
          <span className="text-[10px] text-subtle">
            {dataUpdatedAt
              ? `MAJ ${new Date(dataUpdatedAt).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`
              : "…"}
          </span>
          <Link
            to="/markets"
            className="text-[10px] font-medium text-accent hover:underline"
          >
            Voir tout
          </Link>
        </div>
      </div>
      <div className="flex gap-0 overflow-x-auto scrollbar-none">
        {items.map(({ ins, q }) => {
          const up = q.change >= 0;
          return (
            <div
              key={ins.symbol}
              className="min-w-[7.5rem] shrink-0 border-r border-border px-3 py-2 last:border-r-0"
            >
              <p className="font-mono text-[11px] text-muted-foreground">
                {ins.symbol}
              </p>
              <p className="mt-0.5 font-mono text-sm tabular-nums">
                {formatPrice(q.price, ins.decimals)}
              </p>
              <p
                className={cn(
                  "font-mono text-[11px] tabular-nums",
                  up ? "text-bull" : "text-bear",
                )}
              >
                {formatPct(q.change)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
