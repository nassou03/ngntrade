import { z } from "zod";

const num = z.preprocess((v) => {
  if (typeof v === "string") {
    const n = Number(v.replace(/\s/g, "").replace(",", "."));
    return Number.isFinite(n) ? n : v;
  }
  return v;
}, z.number());

const str = (max: number) =>
  z.preprocess((v) => (v == null ? "" : String(v)), z.string().max(max));

const biasEnum = z.preprocess((v) => {
  const s = String(v ?? "").toLowerCase();
  if (["bullish", "haussier", "long", "buy", "up"].includes(s)) return "bullish";
  if (["bearish", "baissier", "short", "sell", "down"].includes(s)) return "bearish";
  return "neutral";
}, z.enum(["bullish", "bearish", "neutral"]));

const marketEnum = z.preprocess((v) => {
  const s = String(v ?? "").toLowerCase();
  if (s.includes("forex") || s.includes("fx") || s.includes("devise")) return "forex";
  if (s.includes("crypto") || s.includes("btc") || s.includes("eth")) return "crypto";
  if (
    s.includes("commod") ||
    s.includes("gold") ||
    s.includes("xau") ||
    s.includes("matière") ||
    s.includes("matiere")
  )
    return "commodity";
  if (s.includes("index") || s.includes("indice") || s.includes("nasdaq") || s.includes("spx"))
    return "index";
  return "unknown";
}, z.enum(["forex", "crypto", "commodity", "index", "unknown"]));

const directionEnum = z.preprocess((v) => {
  const s = String(v ?? "").toLowerCase();
  if (["long", "buy", "achat", "haussier"].includes(s)) return "long";
  if (["short", "sell", "vente", "baissier"].includes(s)) return "short";
  return "wait";
}, z.enum(["long", "short", "wait"]));

const numArr = z
  .preprocess((v) => {
    if (!Array.isArray(v)) return [];
    return v
      .map((x) => {
        if (typeof x === "number") return x;
        if (typeof x === "string") {
          const n = Number(x.replace(/\s/g, "").replace(",", "."));
          return Number.isFinite(n) ? n : null;
        }
        return null;
      })
      .filter((x): x is number => x != null);
  }, z.array(z.number()))
  .default([]);

const strArr = z
  .preprocess((v) => {
    if (!Array.isArray(v)) return [];
    return v.map((x) => String(x)).filter(Boolean);
  }, z.array(z.string().max(240)))
  .default([]);

export const ChartAnalysisSchema = z.object({
  symbol: str(32).pipe(z.string().min(1).max(32)).catch("UNKNOWN"),
  market: marketEnum.catch("unknown"),
  timeframe: str(16).pipe(z.string().min(1).max(16)).catch("N/A"),
  bias: biasEnum.catch("neutral"),
  confidence: num.pipe(z.number().min(0).max(100)).catch(50),
  trend: str(500).pipe(z.string().min(1)).catch("Structure non détaillée."),
  score: num.pipe(z.number().min(0).max(100)).catch(50),
  patterns: strArr.pipe(z.array(z.string().max(80)).max(8)).catch([]),
  support: numArr.pipe(z.array(z.number()).max(8)).catch([]),
  resistance: numArr.pipe(z.array(z.number()).max(8)).catch([]),
  currentPrice: num.catch(0),
  setup: z
    .object({
      direction: directionEnum.catch("wait"),
      entryMin: num.catch(0),
      entryMax: num.catch(0),
      sniperEntry: num.catch(0),
      sniperReason: str(400).catch(""),
      stopLoss: num.catch(0),
      takeProfits: numArr.pipe(z.array(z.number()).max(4)).catch([]),
      riskReward: num.catch(0),
      invalidation: str(500).catch("Non précisé."),
    })
    .transform((s) => {
      let sniper = s.sniperEntry;
      if (!sniper || sniper === 0) {
        if (s.entryMin && s.entryMax) sniper = (s.entryMin + s.entryMax) / 2;
        else sniper = s.entryMin || s.entryMax || 0;
      }
      return { ...s, sniperEntry: sniper };
    })
    .catch({
      direction: "wait" as const,
      entryMin: 0,
      entryMax: 0,
      sniperEntry: 0,
      sniperReason: "",
      stopLoss: 0,
      takeProfits: [] as number[],
      riskReward: 0,
      invalidation: "Non précisé.",
    }),
  rationale: str(2500).pipe(z.string().min(1)).catch("Analyse partielle."),
  risks: strArr.pipe(z.array(z.string().max(240)).max(8)).catch([]),
  sessionNotes: str(600).catch(""),
});

export const ANALYSIS_JSON_SCHEMA = {
  type: "object",
  additionalProperties: true,
  properties: {
    symbol: { type: "string" },
    market: {
      type: "string",
      enum: ["forex", "crypto", "commodity", "index", "unknown"],
    },
    timeframe: { type: "string" },
    bias: { type: "string", enum: ["bullish", "bearish", "neutral"] },
    confidence: { type: "number" },
    trend: { type: "string" },
    score: { type: "number" },
    patterns: { type: "array", items: { type: "string" } },
    support: { type: "array", items: { type: "number" } },
    resistance: { type: "array", items: { type: "number" } },
    currentPrice: { type: "number" },
    setup: {
      type: "object",
      additionalProperties: true,
      properties: {
        direction: { type: "string", enum: ["long", "short", "wait"] },
        entryMin: { type: "number" },
        entryMax: { type: "number" },
        sniperEntry: { type: "number" },
        sniperReason: { type: "string" },
        stopLoss: { type: "number" },
        takeProfits: { type: "array", items: { type: "number" } },
        riskReward: { type: "number" },
        invalidation: { type: "string" },
      },
    },
    rationale: { type: "string" },
    risks: { type: "array", items: { type: "string" } },
    sessionNotes: { type: "string" },
  },
} as const;
