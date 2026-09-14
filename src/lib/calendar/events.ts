export type Impact = "high" | "medium" | "low";

export type MacroEvent = {
  id: string;
  at: string;
  currency: string;
  title: string;
  impact: Impact;
  actual?: string;
  forecast?: string;
  previous?: string;
  market: string;
};

export const MACRO_EVENTS: MacroEvent[] = [
  {
    id: "nfp",
    at: "2026-09-04T12:30:00.000Z",
    currency: "USD",
    title: "Non-Farm Payrolls",
    impact: "high",
    actual: "148K",
    forecast: "135K",
    previous: "119K",
    market: "USD, indices, or",
  },
  {
    id: "ism-services",
    at: "2026-09-05T14:00:00.000Z",
    currency: "USD",
    title: "ISM Services PMI",
    impact: "medium",
    actual: "53.1",
    forecast: "52.4",
    previous: "52.0",
    market: "USD, NAS100",
  },
  {
    id: "china-cpi",
    at: "2026-09-09T01:30:00.000Z",
    currency: "CNY",
    title: "CPI Chine (YoY)",
    impact: "medium",
    forecast: "0.4%",
    previous: "0.2%",
    market: "AUD, cuivre, indices Asie",
  },
  {
    id: "cpi-us",
    at: "2026-09-10T12:30:00.000Z",
    currency: "USD",
    title: "CPI US (YoY)",
    impact: "high",
    forecast: "2.8%",
    previous: "2.9%",
    market: "USD, or, NAS100",
  },
  {
    id: "core-cpi",
    at: "2026-09-10T12:30:00.000Z",
    currency: "USD",
    title: "Core CPI (MoM)",
    impact: "high",
    forecast: "0.2%",
    previous: "0.3%",
    market: "USD, indices",
  },
  {
    id: "ecb-speakers",
    at: "2026-09-10T13:00:00.000Z",
    currency: "EUR",
    title: "Discours Lagarde (BCE)",
    impact: "medium",
    market: "EURUSD, DAX",
  },
  {
    id: "eia",
    at: "2026-09-10T14:30:00.000Z",
    currency: "USD",
    title: "Stocks de pétrole EIA",
    impact: "medium",
    forecast: "-1.8M",
    previous: "-2.4M",
    market: "WTI, USD CAD",
  },
  {
    id: "ppi",
    at: "2026-09-11T12:30:00.000Z",
    currency: "USD",
    title: "PPI US",
    impact: "medium",
    forecast: "0.2%",
    previous: "0.1%",
    market: "USD",
  },
  {
    id: "uk-gdp",
    at: "2026-09-11T06:00:00.000Z",
    currency: "GBP",
    title: "PIB Royaume-Uni (MoM)",
    impact: "high",
    forecast: "0.1%",
    previous: "0.0%",
    market: "GBPUSD, UK100",
  },
  {
    id: "fomc",
    at: "2026-09-16T18:00:00.000Z",
    currency: "USD",
    title: "Décision de taux FOMC",
    impact: "high",
    forecast: "4.25%",
    previous: "4.50%",
    market: "USD, or, indices, BTC",
  },
  {
    id: "fomc-press",
    at: "2026-09-16T18:30:00.000Z",
    currency: "USD",
    title: "Conférence Powell",
    impact: "high",
    market: "Toutes classes d’actifs",
  },
  {
    id: "boe",
    at: "2026-09-17T11:00:00.000Z",
    currency: "GBP",
    title: "Décision BoE",
    impact: "high",
    forecast: "4.00%",
    previous: "4.00%",
    market: "GBP",
  },
  {
    id: "ecb",
    at: "2026-09-17T12:15:00.000Z",
    currency: "EUR",
    title: "Décision de taux BCE",
    impact: "high",
    forecast: "2.00%",
    previous: "2.00%",
    market: "EUR, DAX",
  },
  {
    id: "jobless",
    at: "2026-09-17T12:30:00.000Z",
    currency: "USD",
    title: "Inscriptions chômage",
    impact: "medium",
    forecast: "230K",
    previous: "226K",
    market: "USD",
  },
  {
    id: "retail",
    at: "2026-09-18T12:30:00.000Z",
    currency: "USD",
    title: "Ventes au détail US",
    impact: "high",
    forecast: "0.3%",
    previous: "0.5%",
    market: "USD, indices",
  },
  {
    id: "jgb",
    at: "2026-09-18T23:00:00.000Z",
    currency: "JPY",
    title: "Inflation Tokyo (YoY)",
    impact: "medium",
    forecast: "2.4%",
    previous: "2.5%",
    market: "USDJPY",
  },
];

export function eventsOnDay(isoDate: string) {
  return MACRO_EVENTS.filter((e) => e.at.slice(0, 10) === isoDate);
}
