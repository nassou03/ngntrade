import { createServerFn } from "@tanstack/react-start";
import { INSTRUMENTS, type QuoteMap } from "./instruments";
import {
  fetchAlphaVantageQuotes,
  isAlphaVantageConfigured,
} from "./alpha-vantage";

const YAHOO_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json",
};

type YahooMeta = {
  regularMarketPrice?: number;
  regularMarketChangePercent?: number;
  chartPreviousClose?: number;
  previousClose?: number;
};

async function fetchYahooQuote(
  yahooSymbol: string,
): Promise<{ price: number; change: number } | null> {
  try {
    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      yahooSymbol,
    )}?interval=1d&range=5d`;
    const res = await fetch(url, {
      headers: YAHOO_HEADERS,
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      chart?: { result?: { meta?: YahooMeta }[] };
    };
    const meta = json.chart?.result?.[0]?.meta;
    const price = meta?.regularMarketPrice;
    if (typeof price !== "number" || !Number.isFinite(price)) return null;

    let change = meta?.regularMarketChangePercent;
    if (typeof change !== "number" || !Number.isFinite(change)) {
      const prev = meta?.chartPreviousClose ?? meta?.previousClose;
      if (typeof prev === "number" && prev > 0) {
        change = ((price - prev) / prev) * 100;
      } else {
        change = 0;
      }
    }
    return { price, change };
  } catch {
    return null;
  }
}

export const getMarketQuotes = createServerFn({ method: "GET" }).handler(
  async () => {
    const quotes: QuoteMap = {};
    for (const ins of INSTRUMENTS) {
      quotes[ins.symbol] = { price: ins.fallback, change: ins.fallbackChange };
    }

    const yahooInstruments = INSTRUMENTS.filter((i) => i.yahooSymbol);
    const useAv = isAlphaVantageConfigured();

    try {
      const [fxRes, cgRes, avQuotes, ...yahooResults] = await Promise.all([
        fetch(
          "https://api.frankfurter.app/latest?from=USD&to=EUR,GBP,JPY,CHF,CAD,AUD",
          { signal: AbortSignal.timeout(4000) },
        ),
        fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,ripple&vs_currencies=usd&include_24hr_change=true",
          { signal: AbortSignal.timeout(4000) },
        ),
        useAv ? fetchAlphaVantageQuotes() : Promise.resolve({} as Record<string, { price: number; change: number }>),
        ...yahooInstruments.map((ins) =>
          fetchYahooQuote(ins.yahooSymbol!).then((q) =>
            q ? ({ symbol: ins.symbol, ...q } as const) : null,
          ),
        ),
      ]);

      // --- Forex — Frankfurter (ECB, gratuit, sans clé) ---
      if (fxRes.ok) {
        const fx = (await fxRes.json()) as { rates?: Record<string, number> };
        const r = fx.rates ?? {};
        if (r.EUR) quotes.EURUSD = { price: 1 / r.EUR, change: quotes.EURUSD.change };
        if (r.GBP) quotes.GBPUSD = { price: 1 / r.GBP, change: quotes.GBPUSD.change };
        if (r.JPY) quotes.USDJPY = { price: r.JPY, change: quotes.USDJPY.change };
        if (r.CHF) quotes.USDCHF = { price: r.CHF, change: quotes.USDCHF.change };
        if (r.AUD) quotes.AUDUSD = { price: 1 / r.AUD, change: quotes.AUDUSD.change };
        if (r.CAD) quotes.USDCAD = { price: r.CAD, change: quotes.USDCAD.change };
        if (r.GBP && r.JPY)
          quotes.GBPJPY = { price: r.JPY / r.GBP, change: quotes.GBPJPY.change };
        if (r.EUR && r.GBP)
          quotes.EURGBP = { price: r.GBP / r.EUR, change: quotes.EURGBP.change };
      }

      // --- Crypto — CoinGecko (gratuit, sans clé) ---
      if (cgRes.ok) {
        const cg = (await cgRes.json()) as Record<
          string,
          { usd?: number; usd_24h_change?: number }
        >;
        const map: Record<string, string> = {
          bitcoin: "BTCUSD",
          ethereum: "ETHUSD",
          solana: "SOLUSD",
          ripple: "XRPUSD",
        };
        for (const [id, symbol] of Object.entries(map)) {
          const row = cg[id];
          if (row?.usd) {
            quotes[symbol] = {
              price: row.usd,
              change: row.usd_24h_change ?? quotes[symbol].change,
            };
          }
        }
      }

      // --- Commodities + indices — Yahoo Finance (gratuit, sans clé) ---
      for (const row of yahooResults) {
        if (row) {
          quotes[row.symbol] = { price: row.price, change: row.change };
        }
      }

      // --- Alpha Vantage (optionnel, clé ALPHA_VANTAGE_API_KEY)
      //     Prioritaire sur forex + or/argent : taux marché temps réel
      //     Conserve le % change déjà calculé si AV ne le fournit pas
      for (const [symbol, q] of Object.entries(avQuotes)) {
        if (q?.price && Number.isFinite(q.price)) {
          const prevChange = quotes[symbol]?.change ?? 0;
          quotes[symbol] = {
            price: q.price,
            change: q.change !== 0 ? q.change : prevChange,
          };
        }
      }
    } catch {
      // conserve les fallbacks en cas d'erreur réseau
    }

    return quotes;
  },
);
