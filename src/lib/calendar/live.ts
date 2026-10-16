import type { Impact, MacroEvent } from "./events";
import { MACRO_EVENTS } from "./events";

type BiquoteEvent = {
  id?: string;
  eventId?: string;
  time?: string;
  countryCode?: string;
  currency?: string;
  name?: string;
  importance?: string;
  type?: string;
  unit?: string;
  multiplier?: string;
  digits?: number;
  actual?: number | null;
  forecast?: number | null;
  previous?: number | null;
};

const IMPACT_MAP: Record<string, Impact> = {
  high: "high",
  medium: "medium",
  low: "low",
};

const MARKET_HINT: Record<string, string> = {
  USD: "USD, indices, or, BTC",
  EUR: "EURUSD, DAX",
  GBP: "GBPUSD, UK100",
  JPY: "USDJPY",
  AUD: "AUDUSD, indices Asie",
  CAD: "USDCAD, WTI",
  CNY: "AUD, cuivre, indices Asie",
  CHF: "USDCHF",
  NZD: "NZDUSD",
};

function formatValue(
  n: number | null | undefined,
  unit?: string,
  multiplier?: string,
  digits?: number,
): string | undefined {
  if (n == null || Number.isNaN(n)) return undefined;
  const d = typeof digits === "number" ? digits : 1;
  const mult = (multiplier || "none").toLowerCase();
  const u = (unit || "none").toLowerCase();
  let suffix = "";
  if (mult === "thousands") suffix = "K";
  else if (mult === "millions") suffix = "M";
  else if (mult === "billions") suffix = "B";
  else if (u === "percent") suffix = "%";
  const abs = Math.abs(n);
  const body =
    suffix === "%" || abs >= 100
      ? n.toFixed(Math.min(d, 2))
      : abs >= 10
        ? n.toFixed(Math.min(d, 1))
        : n.toFixed(d);
  return `${body}${suffix}`;
}

function genericPlaybook(e: MacroEvent): string {
  const cur = e.currency;
  const mk = e.market;
  if (e.impact === "high") {
    return `Sortie high impact (${cur}). Attendre le chiffre puis comparer au consensus avant d’agir. Marchés typiques : ${mk}. Éviter d’ouvrir une position dans les 10–15 minutes autour de la release.`;
  }
  if (e.impact === "medium") {
    return `Impact moyen (${cur}). Mouvement possible mais souvent plus contenu qu’un NFP/CPI/FOMC. Surveiller ${mk}.`;
  }
  return `Impact faible. Peu de volatilité attendue hors contexte de marché déjà nerveux.`;
}

export function mapBiquoteToMacro(raw: BiquoteEvent[]): MacroEvent[] {
  const out: MacroEvent[] = [];
  for (const r of raw) {
    if (!r.time || !r.name) continue;
    const currency = (r.currency || "USD").toUpperCase();
    if (currency === "ALL") continue;
    const impact = IMPACT_MAP[(r.importance || "low").toLowerCase()] ?? "low";
    const id = String(r.id || r.eventId || `${r.time}-${r.name}`).replace(
      /[^a-zA-Z0-9:_-]/g,
      "_",
    );
    const event: MacroEvent = {
      id,
      at: r.time.endsWith("Z") ? r.time : `${r.time}Z`.replace("ZZ", "Z"),
      currency: currency.slice(0, 3),
      title: r.name,
      impact,
      actual: formatValue(r.actual, r.unit, r.multiplier, r.digits),
      forecast: formatValue(r.forecast, r.unit, r.multiplier, r.digits),
      previous: formatValue(r.previous, r.unit, r.multiplier, r.digits),
      market: MARKET_HINT[currency] ?? currency,
      playbook: "",
    };
    event.playbook = genericPlaybook(event);
    out.push(event);
  }
  return out.sort((a, b) => a.at.localeCompare(b.at));
}

let cache: { at: number; events: MacroEvent[]; source: string } | null = null;
const CACHE_MS = 15 * 60 * 1000;

export async function loadCalendarEvents(): Promise<{
  events: MacroEvent[];
  source: "live" | "curated";
  error?: string;
}> {
  if (cache && Date.now() - cache.at < CACHE_MS) {
    return {
      events: cache.events,
      source: cache.source as "live" | "curated",
    };
  }

  try {
    const from = new Date();
    from.setUTCDate(from.getUTCDate() - 2);
    const to = new Date();
    to.setUTCDate(to.getUTCDate() + 14);
    const fromS = from.toISOString().slice(0, 10);
    const toS = to.toISOString().slice(0, 10);
    const url = `https://biquote.io/api/calendar?from=${fromS}&to=${toS}`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "NgntradeCalendar/1.0",
      },
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = (await res.json()) as BiquoteEvent[];
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Réponse vide");
    }
    const events = mapBiquoteToMacro(data);
    // Prefer curated playbooks when same title+day roughly matches
    const enriched = events.map((e) => {
      const hit = MACRO_EVENTS.find(
        (c) =>
          c.currency === e.currency &&
          c.title.toLowerCase().includes(e.title.slice(0, 12).toLowerCase()),
      );
      if (hit?.playbook) return { ...e, playbook: hit.playbook };
      return e;
    });
    cache = { at: Date.now(), events: enriched, source: "live" };
    return { events: enriched, source: "live" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "fetch failed";
    cache = { at: Date.now(), events: MACRO_EVENTS, source: "curated" };
    return {
      events: MACRO_EVENTS,
      source: "curated",
      error: `Live indisponible (${msg}) — calendrier de secours affiché.`,
    };
  }
}
