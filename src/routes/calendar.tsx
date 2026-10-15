import { createFileRoute } from "@tanstack/react-router";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CURRENCIES,
  MACRO_EVENTS,
  getSurprise,
  type Impact,
  type MacroEvent,
} from "@/lib/calendar/events";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendar")({ component: CalendarPage });

type ImpactFilter = Impact | "all";
type CurrencyFilter = (typeof CURRENCIES)[number] | "all";

function CalendarPage() {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return d;
  }, []);
  const [selected, setSelected] = useState(today);
  const [impactFilter, setImpactFilter] = useState<ImpactFilter>("all");
  const [currencyFilter, setCurrencyFilter] = useState<CurrencyFilter>("all");
  const [onlyWithResult, setOnlyWithResult] = useState(false);

  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const days = Array.from({ length: 21 }, (_, i) => addDays(weekStart, i));

  const filtered = useMemo(() => {
    return MACRO_EVENTS.filter((e) => {
      if (impactFilter !== "all" && e.impact !== impactFilter) return false;
      if (currencyFilter !== "all" && e.currency !== currencyFilter)
        return false;
      if (onlyWithResult && e.actual == null) return false;
      return true;
    });
  }, [impactFilter, currencyFilter, onlyWithResult]);

  const events = useMemo(
    () =>
      filtered
        .filter((e) => isSameDay(new Date(e.at), selected))
        .sort((a, b) => a.at.localeCompare(b.at)),
    [filtered, selected],
  );

  const upcomingHigh = useMemo(
    () =>
      filtered
        .filter((e) => e.impact === "high" && new Date(e.at) >= today)
        .sort((a, b) => a.at.localeCompare(b.at))
        .slice(0, 6),
    [filtered, today],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-28 md:pb-12">
      <p className="section-kicker">Macro</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
        Calendrier économique
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Sorties majeures et lecture d’impact (réel vs consensus). Filtre par
        importance et devise. Ce n’est pas un signal d’achat/vente — planifie
        autour de la volatilité.
      </p>

      {/* Filters */}
      <div className="mt-6 space-y-3 rounded-2xl border border-border/80 bg-card/80 p-4">
        <div>
          <p className="text-[11px] font-medium tracking-wide text-subtle uppercase">
            Impact
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(
              [
                ["all", "Tous"],
                ["high", "High"],
                ["medium", "Medium"],
                ["low", "Low"],
              ] as const
            ).map(([id, label]) => (
              <FilterChip
                key={id}
                active={impactFilter === id}
                onClick={() => setImpactFilter(id)}
              >
                {label}
              </FilterChip>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[11px] font-medium tracking-wide text-subtle uppercase">
            Devise
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <FilterChip
              active={currencyFilter === "all"}
              onClick={() => setCurrencyFilter("all")}
            >
              Toutes
            </FilterChip>
            {CURRENCIES.map((c) => (
              <FilterChip
                key={c}
                active={currencyFilter === c}
                onClick={() => setCurrencyFilter(c)}
              >
                {c}
              </FilterChip>
            ))}
          </div>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            className="size-4 rounded border-border"
            checked={onlyWithResult}
            onChange={(e) => setOnlyWithResult(e.target.checked)}
          />
          Uniquement les événements avec résultat publié
        </label>
        <p className="text-[11px] text-subtle">
          {filtered.length} événement{filtered.length > 1 ? "s" : ""} avec les
          filtres actuels
        </p>
      </div>

      {/* Day strip */}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {days.map((d) => {
          const active = isSameDay(d, selected);
          const dayEvents = filtered.filter((e) =>
            isSameDay(new Date(e.at), d),
          );
          const count = dayEvents.length;
          const high = dayEvents.some((e) => e.impact === "high");
          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => setSelected(d)}
              className={cn(
                "min-w-[4.25rem] rounded-xl border px-3 py-2.5 text-left transition-colors",
                active
                  ? "border-accent/60 bg-accent/10"
                  : "border-border/80 bg-card/80 hover:border-border",
              )}
            >
              <p className="text-[10px] tracking-wide text-subtle uppercase">
                {format(d, "EEE", { locale: fr })}
              </p>
              <p className="font-mono text-sm tabular-nums">{format(d, "d")}</p>
              <p
                className={cn(
                  "text-[10px]",
                  high ? "text-warn" : "text-subtle",
                )}
              >
                {count ? `${count} evt` : "—"}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-3">
          <h2 className="font-display text-lg font-semibold tracking-tight">
            {format(selected, "EEEE d MMMM yyyy", { locale: fr })}
          </h2>
          {events.length === 0 ? (
            <p className="rounded-2xl border border-border/80 bg-card/80 p-6 text-sm text-muted-foreground">
              Aucun événement avec ces filtres ce jour. Élargis les filtres ou
              choisis un autre jour — fenêtre potentiellement plus calme pour un
              plan technique.
            </p>
          ) : (
            events.map((e) => <EventCard key={e.id} event={e} />)
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border/80 bg-card/80 p-4">
            <h2 className="font-display text-lg font-semibold">High impact</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Prochaines sorties fortes (filtres appliqués)
            </p>
            <ul className="mt-3 space-y-2">
              {upcomingHigh.length === 0 ? (
                <li className="text-sm text-muted-foreground">
                  Aucun high impact à venir avec ces filtres.
                </li>
              ) : (
                upcomingHigh.map((e) => (
                  <li key={e.id}>
                    <Button
                      variant="outline"
                      className="h-auto w-full justify-start border-border/80 py-3 text-left"
                      onClick={() => setSelected(new Date(e.at))}
                    >
                      <span>
                        <span className="block font-mono text-[11px] text-muted-foreground">
                          {format(new Date(e.at), "EEE d MMM HH:mm", {
                            locale: fr,
                          })}{" "}
                          UTC
                        </span>
                        <span className="block text-sm">
                          {e.currency} · {e.title}
                        </span>
                      </span>
                    </Button>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="rounded-2xl border border-border/80 bg-elevated/30 p-4 text-xs leading-relaxed text-muted-foreground">
            <p className="font-medium text-foreground">Rappel risque</p>
            <p className="mt-1">
              Les analyses d’impact sont éducatives. Un « beat » n’implique pas
              automatiquement un trade. Spreads, slippage et gaps sont élevés
              autour des releases high impact.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function EventCard({ event }: { event: MacroEvent }) {
  const surprise = getSurprise(event);
  return (
    <article className="card-lift rounded-2xl border border-border/80 bg-card/90 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <ImpactBadge impact={event.impact} />
        <Badge variant="outline">{event.currency}</Badge>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {format(new Date(event.at), "HH:mm", { locale: fr })} UTC
        </span>
        <SurpriseBadge kind={surprise.kind} label={surprise.label} />
      </div>
      <h3 className="mt-2 font-display text-base font-semibold tracking-tight">
        {event.title}
      </h3>
      <p className="mt-1 text-xs text-subtle">Marchés : {event.market}</p>

      {event.forecast || event.previous || event.actual ? (
        <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <Metric k="Précédent" v={event.previous} />
          <Metric k="Consensus" v={event.forecast} />
          <Metric k="Réel" v={event.actual} />
        </dl>
      ) : null}

      <div className="mt-4 space-y-2 rounded-xl border border-border/60 bg-elevated/40 p-3">
        <p className="text-[11px] font-semibold tracking-wide text-accent uppercase">
          Analyse d’impact
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {surprise.resultText}
        </p>
        <p className="text-sm leading-relaxed text-foreground/90">
          {event.playbook}
        </p>
      </div>
    </article>
  );
}

function FilterChip({
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
        "h-8 rounded-full px-3 text-xs font-medium transition-colors",
        active
          ? "nav-pill-active"
          : "bg-elevated/80 text-muted-foreground hover:bg-elevated hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function ImpactBadge({ impact }: { impact: Impact }) {
  if (impact === "high") return <Badge variant="bear">High</Badge>;
  if (impact === "medium") return <Badge variant="warn">Medium</Badge>;
  return <Badge>Low</Badge>;
}

function SurpriseBadge({
  kind,
  label,
}: {
  kind: string;
  label: string;
}) {
  if (kind === "beat") return <Badge variant="bull">{label}</Badge>;
  if (kind === "miss") return <Badge variant="bear">{label}</Badge>;
  if (kind === "inline") return <Badge variant="outline">{label}</Badge>;
  return <Badge variant="outline">{label}</Badge>;
}

function Metric({ k, v }: { k: string; v?: string }) {
  return (
    <div className="rounded-lg bg-elevated/80 px-2.5 py-2">
      <p className="text-subtle">{k}</p>
      <p className="font-mono text-foreground tabular-nums">{v ?? "—"}</p>
    </div>
  );
}
