import { createServerFn } from "@tanstack/react-start";
import { ChartAnalysisSchema, ANALYSIS_JSON_SCHEMA } from "./schema";
import { checkPlan } from "./plan-check";
import type { AnalysisInput, ChartAnalysis, CopilotTone } from "./types";

const TOOL_NAME = "submit_chart_analysis";
/** Vercel plafonne le corps d'une requête à ~4,5 Mo : budget total des images. */
const MAX_TOTAL_IMAGE_CHARS = 4_000_000;

/** xAI model (si XAI_API_KEY) */
const XAI_MODEL = process.env.XAI_MODEL?.trim() || "grok-4.5";
/** Claude vision (si ANTHROPIC_API_KEY) — modèle configurable */
const ANTHROPIC_MODEL =
  process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-5-5";

/**
 * Adresse de l'API au format Anthropic. Par défaut : Anthropic.
 * Pour un service compatible, définissez ANTHROPIC_BASE_URL sur Vercel,
 * par exemple https://api.apinex.bond (un « /v1 » final est accepté et retiré).
 */
const ANTHROPIC_BASE_URL = (
  process.env.ANTHROPIC_BASE_URL?.trim() || "https://api.anthropic.com"
)
  .replace(/\/+$/, "")
  .replace(/\/v1$/, "");
const IS_CUSTOM_ANTHROPIC_HOST = ANTHROPIC_BASE_URL !== "https://api.anthropic.com";

/**
 * System prompt Claude — analyse de captures graphiques.
 * La réponse applicative reste du JSON (schéma Ngntrade) pour l’UI existante.
 */
const CHART_ANALYSIS_SYSTEM = `Tu es un trader professionnel expert en analyse technique multi-timeframes, Smart Money Concepts (Order Blocks, Fair Value Gaps, liquidité, BOS/ChoCH) et price action. Tu analyses des captures d'écran de graphiques boursiers ou crypto pour proposer des plans de trading concrets, disciplinés et réalistes.

### Règles strictes :
- Base-toi UNIQUEMENT sur ce qui est visible sur les images + les informations fournies par l'utilisateur.
- Ne force jamais un trade. Si le setup n'est pas clair ou incomplet, dis-le clairement.
- Priorise toujours la gestion du risque et la protection du capital.
- Tu ne donnes AUCUN conseil financier. Tu fournis uniquement une analyse technique structurée.
- Sois précis, direct et professionnel. Évite le blabla.
- Si des éléments importants manquent (volume, timeframe 4H ou Daily, indicateurs, etc.), signale-le.

### Structure d'analyse OBLIGATOIRE (applique-la mentalement à 100 %) :
**1. Analyse Multi-Timeframes**
- Tendance et structure sur les timeframes élevés (4H / Daily si disponibles)
- Structure sur 1H
- Comportement sur 15min et 5min
- Confluences ou divergences entre les timeframes
- BOS / ChoCH récents si visibles

**2. Zones clés identifiées**
- Supports et Résistances majeures
- Order Blocks (bullish / bearish)
- Fair Value Gaps (FVG)
- Zones de liquidité (Buy-side / Sell-side)
- Niveaux psychologiques importants

**3. Biais directionnel**
- Direction : Haussier / Baissier / Neutre
- Niveau de confiance : X/10
- Raisons principales (maximum 3 points clairs)

**4. Plan de trading** (uniquement s'il existe un setup valide)
- Direction (Long / Short)
- Zone d'entrée idéale
- Stop Loss (avec justification claire)
- Take Profit 1 et Take Profit 2
- Ratio Risque/Récompense
- Conditions d'invalidation du trade

**5. Gestion du risque**
- Taille de position recommandée (en % du capital)
- Principaux risques à surveiller

**6. Verdict final**
- Qualité du setup : Fort / Moyen / Faible / À éviter
- Ce qui manque pour rendre l'analyse plus fiable

### Style :
- Clair, structuré, précis
- Langage accessible mais précis (termes techniques SMC ok, avec justification courte si besoin)
- Honnête : mieux vaut dire « pas de trade » que proposer un mauvais setup

### Rigueur de lecture :
- Lis d'abord l'axe des prix et l'axe du temps : symbole, timeframe, échelle, indicateurs affichés. Cite uniquement ce que tu vois.
- Chaque prix du plan doit être cohérent avec l'échelle de l'axe. Un stop doit être du bon côté de l'entrée, les cibles du bon côté aussi.
- Une réponse « wait » argumentée vaut mieux qu'un setup forcé. Si direction=wait, renseigne noTradeReason et ce qui déclencherait un setup.
- Donne toujours un scénario alternatif : ce qui se passe si le principal échoue.

### Format de sortie technique (obligatoire pour cette application) :
Rends ton analyse en appelant l'outil submit_chart_analysis, sans aucun autre texte. Tous les textes sont en français.`;

type AnalyzePayload = {
  /** Rétrocompat : une seule image */
  imageDataUrl?: string;
  /** Multi-TF recommandé : même symbole, H4 + H1 + M15 + M5 */
  images?: {
    h4?: string;
    h1?: string;
    m15?: string;
    m5?: string;
  };
  input: AnalysisInput;
};

type ChatPayload = {
  messages: { role: "user" | "assistant"; content: string }[];
  tone: CopilotTone;
  analysisContext?: string;
};

type LlmResult =
  | { ok: true; text: string; provider: "anthropic" | "xai" }
  | { ok: false; error: string; status?: number };


function reconcileImageQuality<T extends { imageQuality?: {
  score: number;
  axesVisible: boolean;
  timeframeReadable: boolean;
  levelsReadable: boolean;
  tradeability: "high" | "medium" | "low";
  notes: string;
}; confidence?: number }>(analysis: T): T {
  const q = analysis.imageQuality;
  if (!q) return analysis;
  const notes = (q.notes || "").toLowerCase();
  const neg =
    /manqu|absent|illisible|flou|caché|cache|inexploit|trop zoom|sans axe/.test(
      notes,
    );
  const pos =
    /lisible|visible|affiché|affiche|clair|nett|présent|present/.test(notes);
  let score = Math.max(0, Math.min(100, Number(q.score) || 50));
  let axesVisible = q.axesVisible;
  let timeframeReadable = q.timeframeReadable;
  let levelsReadable = q.levelsReadable;
  if (score >= 70 && pos && !neg) {
    axesVisible = true;
    timeframeReadable = true;
    levelsReadable = true;
  }
  if (score >= 75 && !neg) {
    axesVisible = true;
    timeframeReadable = true;
    levelsReadable = true;
    if (/partiel|masqué|masque|approxim/.test(notes)) {
      levelsReadable = false;
      score = Math.min(score, 85);
    }
  }
  if (neg && score >= 80) {
    score = Math.min(score, 72);
  }
  let tradeability: "high" | "medium" | "low" = "medium";
  if (score >= 75 && axesVisible) tradeability = "high";
  else if (score < 50 || !axesVisible) tradeability = "low";
  return {
    ...analysis,
    imageQuality: {
      ...q,
      score,
      axesVisible,
      timeframeReadable,
      levelsReadable,
      tradeability,
    },
  };
}

function extractJson(text: string) {
  let s = text.trim();
  // Strip markdown fences ```json ... ```
  const fence = /^```(?:json|JSON)?\s*\n?([\s\S]*?)\n?```$/m.exec(s);
  if (fence) s = fence[1].trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Réponse IA illisible");
  }
  s = s.slice(start, end + 1);
  return JSON.parse(s) as unknown;
}

function parseDataUrl(dataUrl: string): {
  mediaType: string;
  base64: string;
} | null {
  const m = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s.exec(dataUrl);
  if (!m) return null;
  return { mediaType: m[1], base64: m[2] };
}

function hasAnthropic() {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

function hasXai() {
  return Boolean(process.env.XAI_API_KEY?.trim());
}

async function callAnthropic(opts: {
  system?: string;
  messages: unknown[];
  maxTokens: number;
  timeoutMs?: number;
  /** Force une sortie structurée via tool use. */
  tool?: { name: string; description: string; input_schema: unknown };
}): Promise<LlmResult & { toolInput?: unknown }> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, error: "ANTHROPIC_API_KEY manquante" };
  }
  const retryable = (status?: number) =>
    status === 429 || status === 500 || status === 502 || status === 503 || status === 529;

  // Si le service refuse le format « outil » (certains modèles gratuits), on repasse en JSON texte.
  let useTool = Boolean(opts.tool);
  const messagesFor = (): unknown[] => {
    if (useTool || !opts.tool) return opts.messages;
    const msgs = [...opts.messages] as { role: string; content: unknown }[];
    const lastMsg = msgs[msgs.length - 1];
    const extra = {
      type: "text",
      text:
        "Ne fais aucun appel d'outil. Réponds UNIQUEMENT avec un objet JSON valide respectant ce schéma : " +
        JSON.stringify(opts.tool.input_schema),
    };
    msgs[msgs.length - 1] = {
      ...lastMsg,
      content: Array.isArray(lastMsg.content)
        ? [...lastMsg.content, extra]
        : [{ type: "text", text: String(lastMsg.content) }, extra],
    };
    return msgs;
  };

  let last: LlmResult = { ok: false, error: "Connexion Anthropic impossible" };
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 900 * 2 ** (attempt - 1)));
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 90_000);
    try {
      const res = await fetch(`${ANTHROPIC_BASE_URL}/v1/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          // Certains services compatibles attendent aussi l'en-tête Bearer.
          ...(IS_CUSTOM_ANTHROPIC_HOST ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
          model: ANTHROPIC_MODEL,
          max_tokens: opts.maxTokens,
          // temperature retiré : déprécié sur Claude 5.x / Sonnet 5.5
          ...(opts.system
            ? {
                system: [
                  { type: "text", text: opts.system, cache_control: { type: "ephemeral" } },
                ],
              }
            : {}),
          ...(useTool && opts.tool
            ? {
                tools: [opts.tool],
                tool_choice: { type: "tool", name: opts.tool.name },
              }
            : {}),
          messages: messagesFor(),
        }),
        signal: controller.signal,
      });
      if (!res.ok) {
        let detail = "";
        try {
          const errJson = (await res.json()) as { error?: { message?: string } };
          detail = errJson.error?.message ? `: ${errJson.error.message}` : "";
        } catch {
          /* ignore */
        }
        last = {
          ok: false,
          error: `Anthropic API error ${res.status}${detail}`,
          status: res.status,
        };
        if (res.status === 400 && useTool) {
          useTool = false;
          continue;
        }
        if (retryable(res.status)) continue;
        return last;
      }
      const json = (await res.json()) as {
        content?: { type: string; text?: string; input?: unknown }[];
      };
      const toolBlock = json.content?.find((c) => c.type === "tool_use");
      const text =
        json.content
          ?.filter((c) => c.type === "text")
          .map((c) => c.text ?? "")
          .join("\n") ?? "";
      return { ok: true, text, provider: "anthropic", toolInput: toolBlock?.input };
    } catch (err) {
      const aborted = err instanceof Error && err.name === "AbortError";
      last = {
        ok: false,
        error: aborted ? "L’analyse a pris trop de temps" : "Connexion Anthropic impossible",
      };
      if (aborted) return last;
    } finally {
      clearTimeout(timer);
    }
  }
  return last;
}

async function callXai(
  body: Record<string, unknown>,
  timeoutMs = 90_000,
): Promise<LlmResult> {
  const apiKey = process.env.XAI_API_KEY?.trim();
  if (!apiKey) {
    return {
      ok: false,
      error:
        "Analyse IA indisponible : configurez ANTHROPIC_API_KEY ou XAI_API_KEY côté serveur.",
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      return {
        ok: false,
        error: `xAI API error ${res.status}`,
        status: res.status,
      };
    }
    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return {
      ok: true,
      text: json.choices?.[0]?.message?.content ?? "",
      provider: "xai",
    };
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    return {
      ok: false,
      error: aborted
        ? "L’analyse a pris trop de temps"
        : "Connexion IA impossible",
    };
  } finally {
    clearTimeout(timer);
  }
}

const STYLE_RULES = {
  scalp: {
    label: "Scalping",
    roles: "M15 = contexte, M5 = exécution et zone d'entrée. H1/H4 si fournis = biais de fond.",
    atr: "1× ATR du TF d'exécution (M5), entre 0,8 et 1,3 ATR",
    tp: "TP1 ≈ 1R, TP2 ≈ 1,5–2R sur structure M15",
  },
  intraday: {
    label: "Intraday",
    roles:
      "H4 = contexte majeur, H1 = biais et structure, M15 = zone et invalidation, M5 = raffinement du limit.",
    atr: "1× ATR du TF d'exécution (M15), entre 0,8 et 1,3 ATR",
    tp: "TP1 ≈ 1–1,5R sur la première structure, TP2/TP3 sur extensions H1 et niveaux majeurs",
  },
  swing: {
    label: "Swing",
    roles: "H4 = exécution, H1 = affinage de l'entrée. Daily visible sur H4 = contexte.",
    atr: "1,5× ATR du TF d'exécution (H4), entre 1,2 et 2 ATR",
    tp: "TP1 ≈ 1,5–2R, TP2/TP3 sur niveaux hebdo/journaliers visibles",
  },
} as const;

const METHOD_RULES: Record<string, string> = {
  auto: "Choisis la méthode la plus adaptée à ce qui est visible (structure, zones, indicateurs).",
  smc: "Méthode Smart Money : BOS/ChoCH, liquidité (equal highs/lows), order blocks, FVG, premium/discount.",
  "price-action": "Méthode price action : structure HH/HL, supports/résistances, chandeliers de rejet, retests.",
  indicators:
    "Méthode indicateurs : lis uniquement ceux affichés (moyennes mobiles, RSI, MACD, VWAP, Bollinger…) et dis lesquels manquent.",
};

/** Image sur laquelle l'overlay est calibré — même priorité que la miniature côté client. */
function overlayLabelFor(labels: string[]) {
  for (const l of ["M15", "H1", "H4", "M5", "CHART"]) if (labels.includes(l)) return l;
  return labels[0];
}

function buildAnalyzePrompt(input: AnalysisInput, present: string[]) {
  const style = STYLE_RULES[input.style ?? "intraday"];
  const multi = present.length > 1;
  const overlayLabel = overlayLabelFor(present);
  const parts = [
    "Tu es l'analyste technique de Ngntrade. Lis UNIQUEMENT ce qui est visible : bougies, axes, indicateurs, volumes, niveaux.",
    "Ne fabule pas de prix contradictoires avec l'échelle. Si un champ est illisible, approxime prudemment, baisse confidence et liste le manque dans missing.",
    "Textes en français, ton professionnel, concis. Ce n'est pas un conseil financier.",
    "score = qualité du setup 0-100. confidence = certitude de lecture 0-100. Les nombres sont des number JSON.",
    `Style du trader : ${style.label}. ${style.roles}`,
    `Méthode : ${METHOD_RULES[input.method ?? "auto"]}`,
    "setup.sniperEntry : UN seul prix limit chirurgical. setup.sniperReason : 1–2 phrases (confluence + structure).",
    "Si direction=wait : renseigne setup.watchDirection (long ou short) = le sens du scénario surveillé. Entrée, stop, cibles et checklist concernent CE scénario, jamais le sens opposé : le texte doit dire achat si watchDirection=long, vente si short. Renseigne aussi noTradeReason et le déclencheur dans scenarios.",
    "timeframe = le TF d'exécution seul (par exemple M15), jamais N/A ni une liste de timeframes.",
  ];
  if (multi) {
    parts.push(
      `MULTI-TIMEFRAME. Images fournies : ${present.join(", ")}. Lis de la plus haute à la plus basse unité de temps.`,
      "Si le TF supérieur contredit clairement le setup, préfère direction=wait.",
      "structure : une entrée par TF fourni (biais + note courte). sessionNotes : 2–4 phrases sur la confluence entre TF.",
    );
  } else {
    parts.push("Une seule capture : analyse standard. timeframe = TF visible. structure : une seule entrée.");
  }
  parts.push(
    "LANGUE : tout texte renvoyé (trend, patterns, notes, scénarios) doit être en français. Seuls BOS, ChoCH, FVG, order block, POC et ATR restent en anglais.",
    "STOP LOSS : " + style.atr + ". Si l'ATR est affiché, lis sa valeur ; sinon estime-le sur l'amplitude moyenne des bougies récentes et renseigne atr en unités de prix. Place le stop au-delà d'une structure claire. Interdit : resserrer le stop pour gonfler le R:R. Si la structure impose un stop à plus de 1,6 ATR de l'entrée, rapproche l'ENTRÉE de la zone (entrée plus proche du stop) ou mets direction=wait : ne propose pas un stop large.",
    "COHÉRENCE DU PLAN : vérifie avant de répondre que (distance entrée→TP1) / (distance entrée→stop) est au moins 1,5 et que TP1 est à 1 à 3 ATR de l'entrée, placé juste avant le premier obstacle réel (support, demande, plus bas récent). Si aucun plan ne respecte ces deux conditions, mets direction=wait, ne force pas des cibles trop proches.",
    `TAKE PROFITS : ${style.tp}. Aligne-les sur les niveaux listés. Renseigne riskReward = distance TP1 / distance stop.`,
    "zones : jusqu'à 8 zones clés avec bornes low/high en prix (order_block, fvg, liquidity, support, resistance, supply, demand).",
    "confluence : EXACTEMENT ces 9 id, dans cet ordre, status pass/fail/unknown + note de 1 phrase : " +
      "htf_alignment (TF supérieur aligné avec la direction), structure_break (BOS/ChoCH confirmant), " +
      "liquidity_sweep (liquidité balayée avant l'entrée), zone_retest (OB/FVG/niveau retesté), " +
      "session_timing (session adaptée, compte tenu de la session déclarée), rr_min (R:R TP1 ≥ 1,5), " +
      "atr_stop (stop dans la fourchette ATR), invalidation_clear (invalidation nette et visible), " +
      "news_risk (pas d'annonce majeure ; unknown si non visible). Utilise unknown plutôt que d'inventer.",
    "scenarios : 2 entrées — principal (déclencheur, cible, invalidation) puis alternatif (ce qui se passe si le principal échoue).",
    `overlay : calibre l'axe des prix de l'image ${overlayLabel} (imageLabel="${overlayLabel}"). Choisis DEUX repères de l'axe des prix éloignés verticalement (au moins 40 % de la hauteur) : de préférence l'étiquette colorée du prix actuel si elle est visible, puis une graduation lisible loin d'elle. Mesure y au centre du texte du prix, pas de la ligne de grille. ` +
      "y1/y2 = position verticale de chaque graduation, de 0 (haut de l'image) à 1 (bas de l'image) ; p1/p2 = prix lus. log=true seulement si l'échelle est logarithmique. " +
      "reliable=false si l'axe est illisible, tronqué ou absent.",
    "imageQuality : qualité de lecture de l'ENSEMBLE des images. Ne promets jamais un winrate.",
  );
  if (input.market && input.market !== "auto") parts.push(`Marché déclaré : ${input.market}.`);
  if (input.session && input.session !== "any") parts.push(`Session : ${input.session}.`);
  if (input.risk) parts.push(`Risque annoncé : ${input.risk}.`);
  if (input.thesis) parts.push(`Thèse du trader (à challenger, pas à confirmer par défaut) : ${input.thesis}`);
  return parts.join("\n");
}

function finalize(raw: unknown, execLabel: string): ChartAnalysis | null {
  const parsed = ChartAnalysisSchema.safeParse(raw);
  const base = parsed.success
    ? parsed.data
    : ChartAnalysisSchema.parse({
        ...(typeof raw === "object" && raw ? raw : {}),
        setup:
          typeof raw === "object" && raw && "setup" in raw
            ? (raw as { setup: unknown }).setup
            : {},
      });
  const reconciled = reconcileImageQuality(base) as ChartAnalysis;
  const tfOk = /^(M\d+|H\d+|D\d*|W\d*|\d+\s?(m|h|d|w|min))$/i.test(reconciled.timeframe.trim());
  if (!tfOk) reconciled.timeframe = execLabel || reconciled.timeframe.trim().split(/[\s,/]+/)[0] || "—";
  const check = checkPlan(reconciled);
  return {
    ...reconciled,
    setup: {
      ...reconciled.setup,
      riskReward: check.riskReward || reconciled.setup.riskReward,
    },
    rrs: check.rrs,
    warnings: check.warnings,
    confluenceScore: check.confluenceScore,
    confluence: check.confluence,
    adjusted: check.adjusted,
    verdict: check.verdict,
    grade: check.grade,
  };
}

export const analyzeChart = createServerFn({ method: "POST" })
  .validator((input: AnalyzePayload) => input)
  .handler(async ({ data }) => {
    const ordered: { label: string; url: string }[] = [];
    const pushImg = (label: string, url?: string) => {
      if (url?.startsWith("data:image/")) ordered.push({ label, url });
    };
    pushImg("H4", data.images?.h4);
    pushImg("H1", data.images?.h1);
    pushImg("M15", data.images?.m15);
    pushImg("M5", data.images?.m5);
    if (ordered.length === 0 && data.imageDataUrl?.startsWith("data:image/")) {
      ordered.push({ label: "CHART", url: data.imageDataUrl });
    }
    if (ordered.length === 0) {
      return {
        ok: false as const,
        error: "Ajoutez au moins une capture (idéalement H4 + H1 + M15 + M5).",
      };
    }
    if (ordered.reduce((n, o) => n + o.url.length, 0) > MAX_TOTAL_IMAGE_CHARS) {
      return {
        ok: false as const,
        error: "Images trop lourdes au total — recadrez ou retirez une capture.",
      };
    }
    if (!hasAnthropic() && !hasXai()) {
      return {
        ok: false as const,
        error:
          "Analyse IA indisponible : ajoutez ANTHROPIC_API_KEY (Claude) ou XAI_API_KEY sur Vercel.",
      };
    }

    const labels = ordered.map((o) => o.label);
    const prompt = buildAnalyzePrompt(data.input, labels);
    const timeoutMs = ordered.length >= 3 ? 150_000 : ordered.length > 1 ? 120_000 : 90_000;

    const runAnthropic = async () => {
      const content: unknown[] = [];
      for (const img of ordered) {
        const parsedUrl = parseDataUrl(img.url);
        if (!parsedUrl) return { ok: false as const, error: `Image ${img.label} invalide (data URL)` };
        content.push({ type: "text", text: `--- Graphique ${img.label} ---` });
        content.push({
          type: "image",
          source: { type: "base64", media_type: parsedUrl.mediaType, data: parsedUrl.base64 },
        });
      }
      content.push({ type: "text", text: prompt });
      return callAnthropic({
        system: CHART_ANALYSIS_SYSTEM,
        maxTokens: 6000,
        timeoutMs,
        messages: [{ role: "user", content }],
        tool: {
          name: TOOL_NAME,
          description: "Soumet l'analyse structurée du ou des graphiques.",
          input_schema: ANALYSIS_JSON_SCHEMA,
        },
      });
    };

    const runXai = async (): Promise<LlmResult> => {
      const content: unknown[] = [];
      for (const img of ordered) {
        content.push({ type: "text", text: `--- Graphique ${img.label} ---` });
        content.push({ type: "image_url", image_url: { url: img.url, detail: "high" } });
      }
      content.push({
        type: "text",
        text: `${prompt}\nSchéma JSON attendu : ${JSON.stringify(ANALYSIS_JSON_SCHEMA)}\nRéponds UNIQUEMENT avec un objet JSON valide.`,
      });
      const base = {
        model: XAI_MODEL,
        max_tokens: 4000,
        temperature: 0.2,
        messages: [{ role: "user", content }],
      };
      let r = await callXai({ ...base, response_format: { type: "json_object" } }, timeoutMs);
      if (!r.ok && r.status === 400) r = await callXai(base, timeoutMs);
      return r;
    };

    let raw: unknown = null;
    let lastError = "";
    if (hasAnthropic()) {
      const r = await runAnthropic();
      if (r.ok) {
        try {
          raw = "toolInput" in r && r.toolInput ? r.toolInput : extractJson(r.text);
        } catch {
          lastError = "Réponse IA illisible";
        }
      } else lastError = r.error;
    }
    if (!raw && hasXai()) {
      const r = await runXai();
      if (r.ok) {
        try {
          raw = extractJson(r.text);
        } catch {
          lastError = "Réponse IA illisible";
        }
      } else lastError = r.error;
    }
    if (!raw) {
      return {
        ok: false as const,
        error: lastError || "L’IA a répondu, mais le plan est incomplet. Réessayez ou changez de capture.",
      };
    }
    try {
      const analysis = finalize(raw, labels.length > 1 ? overlayLabelFor(labels) : "");
      if (!analysis) throw new Error("empty");
      if (analysis.overlay && !labels.includes(analysis.overlay.imageLabel)) {
        analysis.overlay = { ...analysis.overlay, imageLabel: overlayLabelFor(labels) };
      }
      return { ok: true as const, analysis };
    } catch {
      return {
        ok: false as const,
        error: "L’IA a répondu, mais le plan est incomplet. Réessayez ou changez de capture.",
      };
    }
  });

const TONE_PROMPTS: Record<CopilotTone, string> = {
  analyst:
    "Tu es l’analyste de session Ngntrade. Réponses structurées, factuelles, sans fluff. Challenge la thèse si elle est faible.",
  mentor:
    "Tu es un mentor de trading patient. Explique le pourquoi (structure, liquidité, risque) pour faire progresser le trader.",
  risk:
    "Tu es risk manager. Priorité invalidation, taille de position, corrélation et scénario qui tue le compte. Pas de forçage de trade.",
};

export const askCopilot = createServerFn({ method: "POST" })
  .validator((input: ChatPayload) => input)
  .handler(async ({ data }) => {
    if (!hasAnthropic() && !hasXai()) {
      return {
        ok: false as const,
        error:
          "Copilote indisponible : configurez ANTHROPIC_API_KEY ou XAI_API_KEY.",
      };
    }

    const history = data.messages.slice(-12);
    const system = [
      TONE_PROMPTS[data.tone],
      "Réponds en français, clair et complet.",
      "STRUCTURE OBLIGATOIRE de chaque réponse :",
      "1) Réponse directe à la question",
      "2) Développement (niveaux, scénarios, risques si pertinent)",
      "3) Conclusion actionnable en 1–3 phrases (quoi faire / quoi éviter / invalidation)",
      "Ne coupe jamais une idée au milieu : termine chaque point avant de passer au suivant.",
      "Longueur adaptée : ~200–450 mots si la question le mérite ; plus court seulement pour une question simple.",
      "Pas de conseil financier personnalisé. L’exécution reste chez le trader.",
      "Si un plan d’analyse est fourni, ancre tes réponses dessus (prix, SL, TP, biais).",
      data.analysisContext
        ? `Plan en cours :\n${data.analysisContext}`
        : "Aucun graphique chargé. Pose des questions de clarification plutôt que d’inventer des niveaux.",
    ].join("\n");

    let result: LlmResult;
    if (hasAnthropic()) {
      result = await callAnthropic({
        system,
        maxTokens: 2500,
        timeoutMs: 90_000,
        messages: history.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });
    } else {
      result = await callXai(
        {
          model: XAI_MODEL,
          max_tokens: 2500,
          temperature: 0.35,
          messages: [{ role: "system", content: system }, ...history],
        },
        90_000,
      );
    }

    if (!result.ok) return { ok: false as const, error: result.error };
    return { ok: true as const, text: result.text.trim() };
  });

export const getAiStatus = createServerFn({ method: "GET" }).handler(
  async () => {
    const anthropic = hasAnthropic();
    const xai = hasXai();
    return {
      configured: anthropic || xai,
      provider: anthropic ? ("anthropic" as const) : xai ? ("xai" as const) : null,
      markets: true,
    };
  },
);
