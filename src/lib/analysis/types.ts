export const MARKETS = ["forex", "crypto", "commodity", "index"] as const;
export type Market = (typeof MARKETS)[number];

export const SESSIONS = ["asia", "london", "newyork", "overlap", "any"] as const;
export type Session = (typeof SESSIONS)[number];

export const BIASES = ["bullish", "bearish", "neutral"] as const;
export type Bias = (typeof BIASES)[number];

export const DIRECTIONS = ["long", "short", "wait"] as const;
export type Direction = (typeof DIRECTIONS)[number];

export type ChartSetup = {
  direction: Direction;
  entryMin: number;
  entryMax: number;
  stopLoss: number;
  takeProfits: number[];
  riskReward: number;
  invalidation: string;
};

export type ChartAnalysis = {
  symbol: string;
  market: Market | "unknown";
  timeframe: string;
  bias: Bias;
  confidence: number;
  trend: string;
  score: number;
  patterns: string[];
  support: number[];
  resistance: number[];
  currentPrice: number;
  setup: ChartSetup;
  rationale: string;
  risks: string[];
  sessionNotes: string;
};

export type AnalysisInput = {
  thesis?: string;
  risk?: string;
  session?: Session;
  market?: Market | "auto";
};

export type AnalysisRecord = {
  id: string;
  createdAt: string;
  thumbnail: string;
  input: AnalysisInput;
  result: ChartAnalysis;
};

export type TradeStatus = "open" | "win" | "loss" | "be";

export type Trade = {
  id: string;
  createdAt: string;
  closedAt?: string;
  symbol: string;
  market: Market;
  direction: Exclude<Direction, "wait">;
  entry: number;
  stopLoss: number;
  takeProfit: number;
  size: number;
  status: TradeStatus;
  pnl: number;
  notes: string;
  analysisId?: string;
};

export type CopilotTone = "analyst" | "mentor" | "risk";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export const MARKET_LABELS: Record<Market | "unknown" | "auto", string> = {
  forex: "Forex",
  crypto: "Cryptomonnaies",
  commodity: "Matières premières",
  index: "Indices",
  unknown: "Marché",
  auto: "Détection auto",
};

export const SESSION_LABELS: Record<Session, string> = {
  asia: "Asie",
  london: "Londres",
  newyork: "New York",
  overlap: "Londres–NY",
  any: "Toutes sessions",
};

export const BIAS_LABELS: Record<Bias, string> = {
  bullish: "Haussier",
  bearish: "Baissier",
  neutral: "Neutre",
};

export const DIRECTION_LABELS: Record<Direction, string> = {
  long: "Achat",
  short: "Vente",
  wait: "Attendre",
};

export const TONE_LABELS: Record<CopilotTone, string> = {
  analyst: "Analyste",
  mentor: "Mentor",
  risk: "Risk manager",
};
