/**
 * Alpha Vantage free tier (25 req/jour, 5/min).
 * Activé uniquement si ALPHA_VANTAGE_API_KEY est défini.
 * Cache mémoire 5 min pour protéger le quota.
 *
 * Doc  : https://www.alphavantage.co/documentation/
 * Clé  : https://www.alphavantage.co/support/#api-key
 *
 * Sur le free tier on ne tire que les paires prioritaires (≤ 5 appels)
 * pour rester sous la limite 5/min. Les autres restent sur Frankfurter / Yahoo.
 */

import { env } from "../env.server";

const CACHE_TTL_MS = 5 * 60 * 1000;

type Quote = { price: number; change: number };

type CacheEntry = {
  at: number;
  data: Record<string, Quote>;
};

let cache: CacheEntry | null = null;

/** Paires prioritaires (free tier ≤ 5 appels / refresh). */
const PRIORITY_PAIRS: { symbol: string; from: string; to: string }[] = [
  { symbol: "EURUSD", from: "EUR", to: "USD" },
  { symbol: "GBPUSD", from: "GBP", to: "USD" },
  { symbol: "USDJPY", from: "USD", to: "JPY" },
  { symbol: "XAUUSD", from: "XAU", to: "USD" },
  { symbol: "XAGUSD", from: "XAG", to: "USD" },
];

function getApiKey(): string | undefined {
  return env("ALPHA_VANTAGE_API_KEY");
}

async function fetchExchangeRate(
  apiKey: string,
  from: string,
  to: string,
): Promise<number | null> {
  try {
    const url =
      `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE` +
      `&from_currency=${encodeURIComponent(from)}` +
      `&to_currency=${encodeURIComponent(to)}` +
      `&apikey=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      "Realtime Currency Exchange Rate"?: {
        "5. Exchange Rate"?: string;
      };
      Note?: string;
      Information?: string;
    };
    // Message de rate-limit ou info
    if (json.Note || json.Information) return null;
    const rateStr = json["Realtime Currency Exchange Rate"]?.["5. Exchange Rate"];
    if (!rateStr) return null;
    const price = Number(rateStr);
    return Number.isFinite(price) && price > 0 ? price : null;
  } catch {
    return null;
  }
}

/**
 * Cours Alpha Vantage (forex prioritaires + or/argent).
 * {} si pas de clé, rate-limit, ou erreur.
 */
export async function fetchAlphaVantageQuotes(): Promise<Record<string, Quote>> {
  const apiKey = getApiKey();
  if (!apiKey) return {};

  if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return cache.data;
  }

  const results = await Promise.all(
    PRIORITY_PAIRS.map(async (pair) => {
      const price = await fetchExchangeRate(apiKey, pair.from, pair.to);
      return price != null
        ? ([pair.symbol, { price, change: 0 }] as const)
        : null;
    }),
  );

  const data: Record<string, Quote> = {};
  for (const row of results) {
    if (row) data[row[0]] = row[1];
  }

  if (Object.keys(data).length > 0) {
    cache = { at: Date.now(), data };
  }

  return data;
}

export function isAlphaVantageConfigured(): boolean {
  return Boolean(getApiKey());
}
