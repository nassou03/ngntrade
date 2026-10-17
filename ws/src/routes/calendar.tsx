import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { addDays, format, startOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CURRENCIES,
  MACRO_EVENTS,
  getSurprise,
  type Impact,
  type MacroEvent,
} from "@/lib/calendar/events";
import { utcDayKey } from "@/lib/calendar/live";
import { getCalendarEvents } from "@/lib/calendar/server";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

export const Route = createFileRoute("/calendar")({ component: CalendarPage });

type ImpactFilter = Impact | "all";
type CurrencyFilter = (typeof CURRENCIES)[number] | "all";

function dayLabel(isoDay: string) {
  // isoDay = YYYY-MM-DD → parse as UTC noon
  return new Date(`${isoDay}T12:00:00.000Z`);
}

function CalendarPage() {
  const todayKey = useMemo(() => utcDayKey(new Date()), []);
  const [selectedKey, setSelectedKey] = useState(todayKey);
  const [impactFilter, setImpactFilter] = useState<ImpactFilter>("all");
  const [currencyFilter, setCurrencyFilter] = useState<CurrencyFilter>("all");
  const [onlyWithResult, setOnlyWithResult] = useState(false);
  const [didAutoPick, setDidAutoPick] = useState(false);

  const { data, isLoading, isFetching, refetch, isError } = useQuery({
    queryKey: ["macro-calendar"],
    queryFn: () => getCalendarEvents(),
    staleTime: 8 * 60_000,
    refetchInterval: 12 * 60_000,
  });

  const allEvents: MacroEvent[] = data?.events?.length
    ? data.events
    : MACRO_EVENTS;
  const source = data?.source ?? "curated";

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = Array.from({ length: 21 }, (_, i) => {
    const d = addDays(weekStart, i);
    return utcDayKey(d);
  });

  const filtered = useMemo(() => {
    return allEvents.filter((e) => {
      if (impactFilter !== "all" && e.impact !== impactFilter) return false;
      if (currencyFilter !== "all" && e.currency !== currencyFilter)
        return false;
      if (onlyWithResult && e.actual == null) return false;
      return true;
    });
  }, [allEvents, impactFilter, currencyFilter, onlyWithResult]);

  // Si le jour sélectionné est vide sous les filtres, sauter au prochain jour avec events
  useEffect(() => {
    if (didAutoPick || isLoading) return;
    const onSelected = filtered.some((e) => utcDayKey(e.at) === selectedKey);
    if (onSelected) return;
    const next = filtered
      .map((e) => utcDayKey(e.at))
      .filter((k) => k >= todayKey)
      .sort()[0];
    const prev = filtered
      .map((e) => utcDayKey(e.at))
      .filter((k) => k < todayKey)
      .sort()
      .at(-1);
    const pick = next || prev;
    if (pick) {
      setSelectedKey(pick);
      setDidAutoPick(true);
    }
  }, [filtered, selectedKey, todayKey, isLoading, didAutoPick]);

  useEffect(() => {
    setDidAutoPick(false);
  }, [impactFilter, currencyFilter, onlyWithResult]);

  const events = useMemo(
    () =>
      filtered
        .filter((e) => utcDayKey(e.at) === selectedKey)
        .sort((a, b) => a.at.localeCompare(b.at)),
    [filtered, selectedKey],
  );

  const upcomingHigh = useMemo(
    () =>
      filtered
        .filter((e) => e.impact === "high" && utcDayKey(e.at) >= todayKey)
        .sort((a, b) => a.at.localeCompare(b.at))
        .slice(0, 10),
    [filtered, todayKey],
  );

  const selectedDate = dayLabel(selectedKey);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-28 md:pb-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="section-kicker">Macro</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
            Calendrier économique
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Live soft (gratuit) + secours curaté. Filtres impact / devise.
            Analyse réel vs consensus.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <Badge
              variant={
                source === "curated" ? "outline" : "bull"
              }
            >
              {source === "live"
                ? "Live soft"
                : source === "mixed"
                  ? "Live + secours"
                  : "Secours curaté"}
            </Badge>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isFetching}
              onClick={() => void refetch()}
            >
              <RefreshCw
                className={cn("size-3.5", isFetching && "animate-spin")}
              />
              Actualiser
            </Button>
          </div>
          {data?.error ? (
            <p className="max-w-xs text-right text-[11px] text-warn">
              {data.error}
            </p>
          ) : null}
        </div>
      </div>

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
          {isLoading
            ? "Chargement du calendrier…"
            : `${filtered.length} événement${filtered.length > 1 ? "s" : ""} avec les filtres actuels`}
          {isError ? " · erreur réseau, secours local" : ""}
        </p>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {days.map((key) => {
          const d = dayLabel(key);
          const active = key === selectedKey;
          const dayEvents = filtered.filter((e) => utcDayKey(e.at) === key);
          const count = dayEvents.length;
          const high = dayEvents.some((e) => e.impact === "high");
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedKey(key)}
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
            {format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
          </h2>
          {events.length === 0 ? (
            <div className="space-y-3 rounded-2xl border border-border/80 bg-card/80 p-6 text-sm text-muted-foreground">
              <p>
                Aucun événement avec ces filtres ce jour.
              </p>
              <p className="text-xs">
                Astuce : repasse Impact sur <strong className="text-foreground/90">Tous</strong>{" "}
                ou Devise sur <strong className="text-foreground/90">Toutes</strong>, puis
                clique un jour marqué « evt ».
              </p>
              {filtered.length > 0 ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const keys = [...new Set(filtered.map((e) => utcDayKey(e.at)))].sort();
                    const next = keys.find((k) => k >= todayKey) || keys[0];
                    if (next) setSelectedKey(next);
                  }}
                >
                  Aller au prochain jour avec événements
                </Button>
              ) : null}
            </div>
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
                  Aucun high impact à venir avec ces filtres. Elargis Impact ou
                  Devise.
                </li>
              ) : (
                upcomingHigh.map((e) => (
                  <li key={e.id}>
                    <Button
                      variant="outline"
                      className="h-auto w-full justify-start border-border/80 py-3 text-left"
                      onClick={() => setSelectedKey(utcDayKey(e.at))}
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
            <p className="font-medium text-foreground">Source live soft</p>
            <p className="mt-1">
              Données agrégées gratuites (sans clé). Cache ~10 min. Jour affiché
              en UTC pour rester aligné avec les heures de publication. Lecture
              éducative — pas un conseil d’investissement.
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

function SurpriseBadge({ kind, label }: { kind: string; label: string }) {
  if (kind === "beat") return <Badge variant="bull">{label}</Badge>;
  if (kind === "miss") return <Badge variant="bear">{label}</Badge>;
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
