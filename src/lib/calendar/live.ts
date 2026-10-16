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

/** Jour UTC YYYY-MM-DD (évite les décalages fuseau sur le calendrier) */
export function utcDayKey(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

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
    let at = r.time;
    if (!at.includes("T")) at = `${at}T12:00:00Z`;
    else if (!at.endsWith("Z") && !/[+-]\d{2}:\d{2}$/.test(at)) at = `${at}Z`;
    const event: MacroEvent = {
      id,
      at,
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

function mergeEvents(live: MacroEvent[], curated: MacroEvent[]): MacroEvent[] {
  const map = new Map<string, MacroEvent>();
  for (const e of curated) {
    map.set(`${utcDayKey(e.at)}|${e.currency}|${e.title.toLowerCase()}`, e);
  }
  for (const e of live) {
    const key = `${utcDayKey(e.at)}|${e.currency}|${e.title.toLowerCase()}`;
    const prev = map.get(key);
    if (prev) {
      map.set(key, {
        ...e,
        playbook: prev.playbook || e.playbook,
        actual: e.actual ?? prev.actual,
        forecast: e.forecast ?? prev.forecast,
        previous: e.previous ?? prev.previous,
      });
    } else {
      map.set(key, e);
    }
  }
  return [...map.values()].sort((a, b) => a.at.localeCompare(b.at));
}

let cache: { at: number; events: MacroEvent[]; source: string; error?: string } | null =
  null;
const CACHE_MS = 10 * 60 * 1000;

export async function loadCalendarEvents(): Promise<{
  events: MacroEvent[];
  source: "live" | "curated" | "mixed";
  error?: string;
}> {
  if (cache && Date.now() - cache.at < CACHE_MS) {
    return {
      events: cache.events,
      source: cache.source as "live" | "curated" | "mixed",
      error: cache.error,
    };
  }

  try {
    const from = new Date();
    from.setUTCDate(from.getUTCDate() - 3);
    const to = new Date();
    to.setUTCDate(to.getUTCDate() + 21);
    const fromS = from.toISOString().slice(0, 10);
    const toS = to.toISOString().slice(0, 10);
    // Deux appels (fenêtres) si une seule réponse est plafonnée
    const urls = [
      `https://biquote.io/api/calendar?from=${fromS}&to=${toS}`,
      `https://biquote.io/api/calendar?importance=high&from=${fromS}&to=${toS}`,
    ];
    const chunks: BiquoteEvent[] = [];
    let lastErr = "";
    for (const url of urls) {
      try {
        const res = await fetch(url, {
          headers: {
            Accept: "application/json",
            "User-Agent": "NgntradeCalendar/1.1",
          },
          signal: AbortSignal.timeout(15_000),
        });
        if (!res.ok) {
          lastErr = `HTTP ${res.status}`;
          continue;
        }
        const data = (await res.json()) as BiquoteEvent[];
        if (Array.isArray(data)) chunks.push(...data);
      } catch (e) {
        lastErr = e instanceof Error ? e.message : "fetch failed";
      }
    }
    if (chunks.length === 0) {
      throw new Error(lastErr || "Réponse vide");
    }
    // Dédup brute par id
    const seen = new Set<string>();
    const unique: BiquoteEvent[] = [];
    for (const c of chunks) {
      const id = String(c.id || c.eventId || `${c.time}-${c.name}`);
      if (seen.has(id)) continue;
      seen.add(id);
      unique.push(c);
    }
    const live = mapBiquoteToMacro(unique);
    const events = mergeEvents(live, MACRO_EVENTS);
    const source = live.length > 0 ? "mixed" : "curated";
    cache = { at: Date.now(), events, source };
    return { events, source: source as "mixed" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "fetch failed";
    cache = {
      at: Date.now(),
      events: MACRO_EVENTS,
      source: "curated",
      error: `Live indisponible (${msg}) — calendrier de secours.`,
    };
    return {
      events: MACRO_EVENTS,
      source: "curated",
      error: cache.error,
    };
  }
}
