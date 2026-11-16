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


const status3 = z.preprocess((v) => {
  const s = String(v ?? "").toLowerCase();
  if (["pass", "ok", "yes", "oui", "true", "valid"].includes(s)) return "pass";
  if (["fail", "no", "non", "false", "ko", "invalid"].includes(s)) return "fail";
  return "unknown";
}, z.enum(["pass", "fail", "unknown"]));

const zoneKind = z.preprocess((v) => {
  const s = String(v ?? "").toLowerCase().replace(/[\s-]+/g, "_");
  if (s.includes("order") || s === "ob") return "order_block";
  if (s.includes("fvg") || s.includes("gap") || s.includes("imbalance")) return "fvg";
  if (s.includes("liq")) return "liquidity";
  if (s.includes("resist")) return "resistance";
  if (s.includes("supply") || s.includes("offre")) return "supply";
  if (s.includes("demand")) return "demand";
  return "support";
}, z.enum(["order_block", "fvg", "liquidity", "support", "resistance", "supply", "demand"]));

const unit = z.preprocess((v) => {
  const n = typeof v === "string" ? Number(v.replace(",", ".")) : v;
  return typeof n === "number" && Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : v;
}, z.number().min(0).max(1));

const boolish = z.preprocess((v) => v === true || v === "true", z.boolean());

const ConfluenceSchema = z.object({
  id: str(40).catch(""),
  label: str(80).catch(""),
  status: status3.catch("unknown"),
  note: str(200).catch(""),
});

const ZoneSchema = z.object({
  kind: zoneKind.catch("support"),
  low: num.catch(0),
  high: num.catch(0),
  tf: str(8).catch(""),
  note: str(160).catch(""),
});

const ScenarioSchema = z.object({
  name: z
    .preprocess(
      (v) => (String(v ?? "").toLowerCase().startsWith("alt") ? "alternatif" : "principal"),
      z.enum(["principal", "alternatif"]),
    )
    .catch("principal"),
  trigger: str(300).catch(""),
  target: str(200).catch(""),
  invalidation: str(300).catch(""),
});

const StructureSchema = z.object({
  tf: str(8).catch(""),
  bias: biasEnum.catch("neutral"),
  note: str(240).catch(""),
});

const OverlaySchema = z
  .object({
    imageLabel: str(8).catch(""),
    axis: z.object({
      y1: unit.catch(0),
      p1: num.catch(0),
      y2: unit.catch(1),
      p2: num.catch(0),
      log: boolish.catch(false),
      reliable: boolish.catch(false),
    }),
  })
  .optional()
  .catch(undefined);

const arr = <T extends z.ZodTypeAny>(item: T, max: number) =>
  z
    .preprocess((v) => (Array.isArray(v) ? v.slice(0, max) : []), z.array(item))
    .catch([] as z.infer<T>[]);

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
  atr: num.catch(0),
  structure: arr(StructureSchema, 5),
  zones: arr(ZoneSchema, 12),
  confluence: arr(ConfluenceSchema, 12),
  scenarios: arr(ScenarioSchema, 3),
  missing: strArr.pipe(z.array(z.string().max(240)).max(6)).catch([]),
  noTradeReason: str(400).catch(""),
  overlay: OverlaySchema,
  imageQuality: z
    .object({
      score: num.pipe(z.number().min(0).max(100)).catch(50),
      axesVisible: z.preprocess((v) => Boolean(v), z.boolean()).catch(true),
      timeframeReadable: z.preprocess((v) => Boolean(v), z.boolean()).catch(true),
      levelsReadable: z.preprocess((v) => Boolean(v), z.boolean()).catch(true),
      tradeability: z
        .preprocess((v) => {
          const s = String(v ?? "").toLowerCase();
          if (s.includes("high") || s.includes("élev") || s.includes("elev")) return "high";
          if (s.includes("low") || s.includes("faible")) return "low";
          return "medium";
        }, z.enum(["high", "medium", "low"]))
        .catch("medium"),
      notes: str(400).catch(""),
    })
    .catch({
      score: 50,
      axesVisible: true,
      timeframeReadable: true,
      levelsReadable: true,
      tradeability: "medium" as const,
      notes: "Qualité image non évaluée en détail.",
    }),
});

const S = { type: "string" } as const;
const N = { type: "number" } as const;
const BIAS = { type: "string", enum: ["bullish", "bearish", "neutral"] } as const;

/** Schéma d'entrée de l'outil `submit_chart_analysis` (Anthropic tool use). */
export const ANALYSIS_JSON_SCHEMA = {
  type: "object",
  additionalProperties: true,
  required: ["symbol", "timeframe", "bias", "setup", "confluence", "rationale"],
  properties: {
    symbol: S,
    market: { type: "string", enum: ["forex", "crypto", "commodity", "index", "unknown"] },
    timeframe: S,
    bias: BIAS,
    confidence: N,
    trend: S,
    score: N,
    atr: { ...N, description: "ATR lu ou estimé sur le TF d'exécution, en unités de prix (0 si inconnu)." },
    patterns: { type: "array", items: S },
    support: { type: "array", items: N },
    resistance: { type: "array", items: N },
    currentPrice: N,
    structure: {
      type: "array",
      description: "Une entrée par timeframe fourni.",
      items: {
        type: "object",
        properties: { tf: S, bias: BIAS, note: S },
        required: ["tf", "bias", "note"],
      },
    },
    zones: {
      type: "array",
      description: "Zones clés visibles (max 8) avec bornes de prix.",
      items: {
        type: "object",
        properties: {
          kind: {
            type: "string",
            enum: ["order_block", "fvg", "liquidity", "support", "resistance", "supply", "demand"],
          },
          low: N,
          high: N,
          tf: S,
          note: S,
        },
        required: ["kind", "low", "high"],
      },
    },
    confluence: {
      type: "array",
      description:
        "Checklist fixe, exactement ces id : htf_alignment, structure_break, liquidity_sweep, zone_retest, session_timing, rr_min, atr_stop, invalidation_clear, news_risk.",
      items: {
        type: "object",
        properties: {
          id: S,
          label: S,
          status: { type: "string", enum: ["pass", "fail", "unknown"] },
          note: S,
        },
        required: ["id", "label", "status", "note"],
      },
    },
    setup: {
      type: "object",
      additionalProperties: true,
      required: ["direction"],
      properties: {
        direction: { type: "string", enum: ["long", "short", "wait"] },
        entryMin: N,
        entryMax: N,
        sniperEntry: N,
        sniperReason: S,
        stopLoss: N,
        takeProfits: { type: "array", items: N },
        riskReward: N,
        invalidation: S,
      },
    },
    scenarios: {
      type: "array",
      description: "Scénario principal puis alternatif.",
      items: {
        type: "object",
        properties: {
          name: { type: "string", enum: ["principal", "alternatif"] },
          trigger: S,
          target: S,
          invalidation: S,
        },
        required: ["name", "trigger"],
      },
    },
    missing: { type: "array", items: S, description: "Ce qui manque pour fiabiliser l'analyse." },
    noTradeReason: { ...S, description: "Si direction=wait : pourquoi, en une phrase." },
    overlay: {
      type: "object",
      description:
        "Calibrage de l'axe des prix sur l'image demandée. y = position verticale 0 (haut) à 1 (bas) de deux graduations de prix lisibles et éloignées.",
      properties: {
        imageLabel: S,
        axis: {
          type: "object",
          properties: {
            y1: N,
            p1: N,
            y2: N,
            p2: N,
            log: { type: "boolean" },
            reliable: { type: "boolean" },
          },
          required: ["y1", "p1", "y2", "p2", "reliable"],
        },
      },
      required: ["imageLabel", "axis"],
    },
    rationale: S,
    risks: { type: "array", items: S },
    sessionNotes: S,
    imageQuality: {
      type: "object",
      properties: {
        score: N,
        axesVisible: { type: "boolean" },
        timeframeReadable: { type: "boolean" },
        levelsReadable: { type: "boolean" },
        tradeability: { type: "string", enum: ["high", "medium", "low"] },
        notes: S,
      },
    },
  },
} as const;
