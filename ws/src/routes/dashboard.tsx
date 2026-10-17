import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MARKET_LABELS, type Market } from "@/lib/analysis/types";
import { useAppStore } from "@/lib/store";
import { cn, formatPnl } from "@/lib/utils";
import { MarketTicker } from "@/components/markets/ticker";

export const Route = createFileRoute("/dashboard")({ component: DashboardPage });

function DashboardPage() {
  const trades = useAppStore((s) => s.trades);
  const seedDemo = useAppStore((s) => s.seedDemo);
  useEffect(() => {
    seedDemo();
  }, [seedDemo]);

  const stats = useMemo(() => compute(trades), [trades]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-28 md:pb-12">
      <p className="text-xs font-medium tracking-wide text-accent uppercase">Performance</p>
      <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
        Ce qui paie
      </h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Calculé depuis votre journal local. Les lignes de démo montrent le tableau vivant.
      </p>

      <div className="mt-6">
        <MarketTicker limit={6} />
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="PnL net" value={formatPnl(stats.pnl)} tone={stats.pnl >= 0 ? "bull" : "bear"} />
        <Stat label="Win rate" value={`${stats.winRate.toFixed(0)}%`} />
        <Stat label="Série" value={stats.streak} />
        <Stat label="Profit factor" value={stats.pf.toFixed(2)} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Courbe d’équité</CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            {stats.equity.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.equity}>
                  <defs>
                    <linearGradient id="eq" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "var(--color-subtle)", fontSize: 11 }} />
                  <YAxis
                    tick={{ fill: "var(--color-subtle)", fontSize: 11 }}
                    width={48}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-elevated)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-accent)"
                    fill="url(#eq)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Empty />
            )}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">PnL par marché</CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            {stats.byMarket.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.byMarket}>
                  <CartesianGrid stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "var(--color-subtle)", fontSize: 11 }} />
                  <YAxis tick={{ fill: "var(--color-subtle)", fontSize: 11 }} width={40} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-elevated)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="pnl" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <h2 className="font-display text-lg font-semibold">Jour par jour</h2>
        <ul className="mt-3 divide-y divide-border rounded-xl border border-border bg-card">
          {stats.byDay.length === 0 ? (
            <li className="p-6 text-sm text-muted-foreground">Pas encore de clôture.</li>
          ) : (
            stats.byDay.map((d) => (
              <li key={d.day} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm">{d.day}</span>
                <span
                  className={cn(
                    "font-mono text-sm tabular-nums",
                    d.pnl >= 0 ? "text-bull" : "text-bear",
                  )}
                >
                  {formatPnl(d.pnl)}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "bull" | "bear";
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs tracking-wide text-subtle uppercase">{label}</p>
        <p
          className={cn(
            "mt-1 font-mono text-2xl tabular-nums",
            tone === "bull" && "text-bull",
            tone === "bear" && "text-bear",
          )}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function Empty() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      Journalisez un trade clos pour voir la courbe.
    </div>
  );
}

function compute(trades: ReturnType<typeof useAppStore.getState>["trades"]) {
  const closed = [...trades]
    .filter((t) => t.status !== "open")
    .sort(
      (a, b) =>
        new Date(a.closedAt ?? a.createdAt).getTime() -
        new Date(b.closedAt ?? b.createdAt).getTime(),
    );
  const wins = closed.filter((t) => t.status === "win").length;
  const losses = closed.filter((t) => t.status === "loss").length;
  const pnl = closed.reduce((s, t) => s + t.pnl, 0);
  const grossWin = closed.filter((t) => t.pnl > 0).reduce((s, t) => s + t.pnl, 0);
  const grossLoss = Math.abs(closed.filter((t) => t.pnl < 0).reduce((s, t) => s + t.pnl, 0));
  const pf = grossLoss === 0 ? (grossWin > 0 ? 99 : 0) : grossWin / grossLoss;

  let streakCount = 0;
  let streakKind: "W" | "L" | "—" = "—";
  for (const t of [...closed].reverse()) {
    if (t.status === "be") continue;
    const k = t.status === "win" ? "W" : "L";
    if (streakKind === "—") streakKind = k;
    if (k !== streakKind) break;
    streakCount += 1;
  }

  let run = 0;
  const equity = closed.map((t, i) => {
    run += t.pnl;
    const d = new Date(t.closedAt ?? t.createdAt);
    return { label: `${d.getDate()}/${d.getMonth() + 1}`, value: run, i };
  });

  const marketMap = new Map<Market, number>();
  for (const t of closed) {
    marketMap.set(t.market, (marketMap.get(t.market) ?? 0) + t.pnl);
  }
  const byMarket = [...marketMap.entries()].map(([m, v]) => ({
    label: MARKET_LABELS[m],
    pnl: v,
  }));

  const dayMap = new Map<string, number>();
  for (const t of closed) {
    const day = new Date(t.closedAt ?? t.createdAt).toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    dayMap.set(day, (dayMap.get(day) ?? 0) + t.pnl);
  }
  const byDay = [...dayMap.entries()].map(([day, v]) => ({ day, pnl: v }));

  return {
    pnl,
    winRate: closed.length ? (wins / Math.max(1, wins + losses)) * 100 : 0,
    streak: streakKind === "—" ? "—" : `${streakCount}${streakKind}`,
    pf,
    equity,
    byMarket,
    byDay,
  };
}
