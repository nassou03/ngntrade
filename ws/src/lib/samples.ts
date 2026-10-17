import type { Market } from "@/lib/analysis/types";

export type SampleChart = {
  id: string;
  file: string;
  symbol: string;
  market: Market;
  timeframe: string;
  title: string;
  thesis: string;
  session: "london" | "newyork" | "asia" | "overlap";
};

export const SAMPLE_CHARTS: SampleChart[] = [
  {
    id: "eurusd-h1",
    file: "/samples/eurusd-h1.jpg",
    symbol: "EURUSD",
    market: "forex",
    timeframe: "H1",
    title: "Continuation haussière",
    thesis: "Structure HH/HL, pullback sur moyenne mobile. Je cherche un long de continuation session Londres.",
    session: "london",
  },
  {
    id: "btcusd-h4",
    file: "/samples/btcusd-h4.jpg",
    symbol: "BTCUSD",
    market: "crypto",
    timeframe: "H4",
    title: "Rupture baissière",
    thesis: "Sommet raté puis cassure. Bias short tant que le prix reste sous la zone de breakdown.",
    session: "newyork",
  },
  {
    id: "xauusd-d1",
    file: "/samples/xauusd-d1.jpg",
    symbol: "XAUUSD",
    market: "commodity",
    timeframe: "D1",
    title: "Range de l’or",
    thesis: "Or coincé entre support et résistance. Pas de breakout clair — fade des extrêmes ou wait.",
    session: "newyork",
  },
  {
    id: "nas100-h1",
    file: "/samples/nas100-h1.jpg",
    symbol: "NAS100",
    market: "index",
    timeframe: "H1",
    title: "Breakout d’indice",
    thesis: "Compression puis cassure haussière avec volume. Long au retest de la zone cassée.",
    session: "newyork",
  },
];
