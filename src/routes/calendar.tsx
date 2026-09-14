import { createFileRoute } from "@tanstack/react-router";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MACRO_EVENTS, type Impact } from "@/lib/calendar/events";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendar")({ component: CalendarPage });

function CalendarPage() {
  const today = new Date("2026-09-10T10:00:00Z");
  const [selected, setSelected] = useState(today);
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const days = Array.from({ length: 14 }, (_, i) => addDays(weekStart, i));

  const events = useMemo(
    () =>
      MACRO_EVENTS.filter((e) => isSameDay(new Date(e.at), selected)).sort(
        (a, b) => a.at.localeCompare(b.at),
      ),
    [selected],
  );

  const upcomingHigh = MACRO_EVENTS.filter(
    (e) => e.impact === "high" && new Date(e.at) >= today,
  ).slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-28 md:pb-12">
      <p className="text-xs font-medium tracking-wide text-accent uppercase">Macro</p>
      <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
        Calendrier de volatilité
      </h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Les sorties qui bougent le dollar, l’or, les indices et le BTC. Planifiez autour, ne
        tradez pas dedans à l’aveugle.
      </p>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {days.map((d) => {
          const active = isSameDay(d, selected);
          const count = MACRO_EVENTS.filter((e) => isSameDay(new Date(e.at), d)).length;
          const high = MACRO_EVENTS.some(
            (e) => e.impact === "high" && isSameDay(new Date(e.at), d),
          );
          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => setSelected(d)}
              className={cn(
                "min-w-16 rounded-xl border px-3 py-2 text-left",
                active ? "border-accent bg-elevated" : "border-border bg-card",
              )}
            >
              <p className="text-[10px] uppercase tracking-wide text-subtle">
                {format(d, "EEE", { locale: fr })}
              </p>
              <p className="font-mono text-sm">{format(d, "d")}</p>
              <p className={cn("text-[10px]", high ? "text-warn" : "text-subtle")}>
                {count ? `${count} evt` : "—"}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-3">
          <h2 className="font-display text-lg font-semibold">
            {format(selected, "EEEE d MMMM", { locale: fr })}
          </h2>
          {events.length === 0 ? (
            <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
              Pas de sortie majeure ce jour. Fenêtre plus calme pour exécuter un plan technique.
            </p>
          ) : (
            events.map((e) => (
              <article
                key={e.id}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <ImpactBadge impact={e.impact} />
                  <Badge>{e.currency}</Badge>
                  <span className="font-mono text-xs text-muted-foreground">
                    {format(new Date(e.at), "HH:mm", { locale: fr })} UTC
                  </span>
                </div>
                <h3 className="mt-2 font-display text-base font-semibold">{e.title}</h3>
                <p className="mt-1 text-xs text-subtle">{e.market}</p>
                {e.forecast || e.previous || e.actual ? (
                  <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <Metric k="Précédent" v={e.previous} />
                    <Metric k="Consensus" v={e.forecast} />
                    <Metric k="Réel" v={e.actual} />
                  </dl>
                ) : null}
              </article>
            ))
          )}
        </div>
        <aside>
          <h2 className="font-display text-lg font-semibold">Prochains high impact</h2>
          <ul className="mt-3 space-y-2">
            {upcomingHigh.map((e) => (
              <li key={e.id}>
                <Button
                  variant="outline"
                  className="h-auto w-full justify-start py-3 text-left"
                  onClick={() => setSelected(new Date(e.at))}
                >
                  <span>
                    <span className="block font-mono text-[11px] text-muted-foreground">
                      {format(new Date(e.at), "EEE d MMM HH:mm", { locale: fr })}
                    </span>
                    <span className="block text-sm">
                      {e.currency} · {e.title}
                    </span>
                  </span>
                </Button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}

function ImpactBadge({ impact }: { impact: Impact }) {
  if (impact === "high") return <Badge variant="bear">High</Badge>;
  if (impact === "medium") return <Badge variant="warn">Medium</Badge>;
  return <Badge>Low</Badge>;
}

function Metric({ k, v }: { k: string; v?: string }) {
  return (
    <div className="rounded-md bg-elevated px-2 py-1.5">
      <p className="text-subtle">{k}</p>
      <p className="font-mono tabular-nums">{v ?? "—"}</p>
    </div>
  );
}
