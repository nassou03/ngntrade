export const MARKETS = ["forex", "crypto", "commodity", "index"] as const;
export type Market = (typeof MARKETS)[number];

export const SESSIONS = ["asia", "london", "newyork", "overlap", "any"] as const;
export type Session = (typeof SESSIONS)[number];

export const BIASES = ["bullish", "bearish", "neutral"] as const;
export type Bias = (typeof BIASES)[number];

export const DIRECTIONS = ["long", "short", "wait"] as const;
export type Direction = (typeof DIRECTIONS)[number];

export type ImageQuality = {
  /** 0–100 : fiabilité de la lecture sur CETTE capture */
  score: number;
  axesVisible: boolean;
  timeframeReadable: boolean;
  levelsReadable: boolean;
  tradeability: "high" | "medium" | "low";
  notes: string;
};

export type ChartSetup = {
  /** Si direction = wait : sens du scénario surveillé (les prix du plan le concernent). */
  watchDirection?: "long" | "short";
  direction: Direction;
  entryMin: number;
  entryMax: number;
  /** Point d'entrée sniper (chirurgical), dans ou proche de la zone */
  sniperEntry: number;
  /** Pourquoi ce prix exact (ordre limit, retest, FVG, etc.) */
  sniperReason: string;
  stopLoss: number;
  takeProfits: number[];
  riskReward: number;
  invalidation: string;
};

export const STYLES = ["scalp", "intraday", "swing"] as const;
export type TradingStyle = (typeof STYLES)[number];

export const METHODS = ["auto", "smc", "price-action", "indicators"] as const;
export type Method = (typeof METHODS)[number];

export type ConfluenceStatus = "pass" | "fail" | "unknown";
export type ConfluenceItem = {
  id: string;
  label: string;
  status: ConfluenceStatus;
  note: string;
};

export type TfStructure = { tf: string; bias: Bias; note: string };

export type ZoneKind =
  | "order_block"
  | "fvg"
  | "liquidity"
  | "support"
  | "resistance"
  | "supply"
  | "demand";
export type Zone = {
  kind: ZoneKind;
  low: number;
  high: number;
  tf: string;
  note: string;
};

export type Scenario = {
  name: "principal" | "alternatif";
  trigger: string;
  target: string;
  invalidation: string;
};

/** Calibrage prix → position verticale (0 = haut, 1 = bas) lu sur l'axe des prix. */
export type OverlayAxis = {
  y1: number;
  p1: number;
  y2: number;
  p2: number;
  log: boolean;
  reliable: boolean;
};
export type Overlay = { imageLabel: string; axis: OverlayAxis };

export type PlanWarning = { level: "error" | "warn" | "info"; text: string };
export type Grade = "A" | "B" | "C" | "none";

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
  imageQuality: ImageQuality;
  /* --- v2 (optionnels : les anciennes analyses stockées restent valides) --- */
  atr?: number;
  structure?: TfStructure[];
  zones?: Zone[];
  confluence?: ConfluenceItem[];
  scenarios?: Scenario[];
  missing?: string[];
  noTradeReason?: string;
  overlay?: Overlay;
  /** Calculés par l'application, jamais par l'IA */
  rrs?: number[];
  warnings?: PlanWarning[];
  confluenceScore?: number;
  grade?: Grade;
  /** Plan recalé par l'app quand celui de l'IA échoue aux contrôles */
  adjusted?: AdjustedPlan;
};

export type AdjustedPlan = {
  direction: "long" | "short";
  entry: number;
  stop: number;
  takeProfits: number[];
  rrs: number[];
  notes: string[];
};

export type AnalysisInput = {
  style?: TradingStyle;
  method?: Method;
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

export const STYLE_LABELS: Record<TradingStyle, string> = {
  scalp: "Scalping",
  intraday: "Intraday",
  swing: "Swing",
};

export const METHOD_LABELS: Record<Method, string> = {
  auto: "Auto",
  smc: "Smart Money",
  "price-action": "Price action",
  indicators: "Indicateurs",
};

export const ZONE_LABELS: Record<ZoneKind, string> = {
  order_block: "Order block",
  fvg: "FVG",
  liquidity: "Liquidité",
  support: "Support",
  resistance: "Résistance",
  supply: "Offre",
  demand: "Demande",
};

export const TONE_LABELS: Record<CopilotTone, string> = {
  analyst: "Analyste",
  mentor: "Mentor",
  risk: "Risk manager",
};
