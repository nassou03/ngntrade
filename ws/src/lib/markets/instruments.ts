import type { Market } from "@/lib/analysis/types";

export type Instrument = {
  symbol: string;
  name: string;
  market: Market;
  /** CoinGecko id or FX quote currency code when applicable */
  quoteId?: string;
  /** Yahoo Finance ticker for live commodity / index quotes */
  yahooSymbol?: string;
  decimals: number;
  fallback: number;
  fallbackChange: number;
};

export const INSTRUMENTS: Instrument[] = [
  { symbol: "EURUSD", name: "Euro / Dollar", market: "forex", quoteId: "EUR", decimals: 5, fallback: 1.1748, fallbackChange: 0.18 },
  { symbol: "GBPUSD", name: "Livre / Dollar", market: "forex", quoteId: "GBP", decimals: 5, fallback: 1.3264, fallbackChange: -0.12 },
  { symbol: "USDJPY", name: "Dollar / Yen", market: "forex", quoteId: "JPY", decimals: 3, fallback: 147.82, fallbackChange: 0.22 },
  { symbol: "USDCHF", name: "Dollar / Franc", market: "forex", quoteId: "CHF", decimals: 5, fallback: 0.8014, fallbackChange: -0.08 },
  { symbol: "AUDUSD", name: "Aussie / Dollar", market: "forex", quoteId: "AUD", decimals: 5, fallback: 0.6621, fallbackChange: 0.31 },
  { symbol: "USDCAD", name: "Dollar / Cad", market: "forex", quoteId: "CAD", decimals: 5, fallback: 1.3786, fallbackChange: 0.05 },
  { symbol: "GBPJPY", name: "Livre / Yen", market: "forex", decimals: 3, fallback: 198.41, fallbackChange: 0.14 },
  { symbol: "EURGBP", name: "Euro / Livre", market: "forex", decimals: 5, fallback: 0.8856, fallbackChange: -0.06 },
  { symbol: "BTCUSD", name: "Bitcoin", market: "crypto", quoteId: "bitcoin", decimals: 0, fallback: 111840, fallbackChange: -1.42 },
  { symbol: "ETHUSD", name: "Ethereum", market: "crypto", quoteId: "ethereum", decimals: 2, fallback: 4286, fallbackChange: -0.88 },
  { symbol: "SOLUSD", name: "Solana", market: "crypto", quoteId: "solana", decimals: 2, fallback: 186.4, fallbackChange: 2.14 },
  { symbol: "XRPUSD", name: "XRP", market: "crypto", quoteId: "ripple", decimals: 4, fallback: 0.612, fallbackChange: 0.74 },
  { symbol: "XAUUSD", name: "Or spot", market: "commodity", yahooSymbol: "GC=F", decimals: 2, fallback: 3394.2, fallbackChange: 0.46 },
  { symbol: "XAGUSD", name: "Argent", market: "commodity", yahooSymbol: "SI=F", decimals: 3, fallback: 39.82, fallbackChange: 0.91 },
  { symbol: "WTI", name: "Pétrole WTI", market: "commodity", yahooSymbol: "CL=F", decimals: 2, fallback: 72.48, fallbackChange: -0.63 },
  { symbol: "BRENT", name: "Brent", market: "commodity", yahooSymbol: "BZ=F", decimals: 2, fallback: 76.12, fallbackChange: -0.41 },
  { symbol: "COPPER", name: "Cuivre", market: "commodity", yahooSymbol: "HG=F", decimals: 3, fallback: 4.182, fallbackChange: 0.28 },
  { symbol: "NATGAS", name: "Gaz naturel", market: "commodity", yahooSymbol: "NG=F", decimals: 3, fallback: 2.764, fallbackChange: 1.12 },
  { symbol: "NAS100", name: "Nasdaq 100", market: "index", yahooSymbol: "^NDX", decimals: 1, fallback: 20412, fallbackChange: 0.62 },
  { symbol: "US500", name: "S&P 500", market: "index", yahooSymbol: "^GSPC", decimals: 2, fallback: 5628.4, fallbackChange: 0.38 },
  { symbol: "US30", name: "Dow Jones", market: "index", yahooSymbol: "^DJI", decimals: 0, fallback: 42180, fallbackChange: 0.21 },
  { symbol: "GER40", name: "DAX 40", market: "index", yahooSymbol: "^GDAXI", decimals: 1, fallback: 18642, fallbackChange: -0.17 },
  { symbol: "UK100", name: "FTSE 100", market: "index", yahooSymbol: "^FTSE", decimals: 1, fallback: 8324.6, fallbackChange: 0.09 },
  { symbol: "JPN225", name: "Nikkei 225", market: "index", yahooSymbol: "^N225", decimals: 0, fallback: 42150, fallbackChange: 0.54 },
];

export type QuoteMap = Record<string, { price: number; change: number }>;
