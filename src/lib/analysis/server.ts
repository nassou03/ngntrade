import { createServerFn } from "@tanstack/react-start";
import { ChartAnalysisSchema, ANALYSIS_JSON_SCHEMA } from "./schema";
import type { AnalysisInput, ChartAnalysis, CopilotTone } from "./types";

/** xAI model (si XAI_API_KEY) */
const XAI_MODEL = process.env.XAI_MODEL?.trim() || "grok-4.5";
/** Claude vision (si ANTHROPIC_API_KEY) — modèle configurable */
const ANTHROPIC_MODEL =
  process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-5-5";

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

### Format de sortie technique (obligatoire pour cette application) :
Réponds UNIQUEMENT avec un objet JSON valide (aucun markdown, aucun texte hors JSON).
Mappe ta structure 1–6 vers les champs JSON du message utilisateur (trend, rationale, risks, setup.sniperEntry, setup.sniperReason, setup.stopLoss, setup.targets, levels, invalidation, score, confidence, sessionNotes, patterns, imageQuality, etc.).`;

type AnalyzePayload = {
  /** Rétrocompat : une seule image */
  imageDataUrl?: string;
  /** Multi-TF recommandé : même symbole, H1 + M15 + M5 */
  images?: {
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
  temperature?: number;
  timeoutMs?: number;
}): Promise<LlmResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, error: "ANTHROPIC_API_KEY manquante" };
  }

  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    opts.timeoutMs ?? 90_000,
  );
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: opts.maxTokens,
        // temperature retiré : déprécié sur Claude 5.x / Sonnet 5.5
        ...(opts.system ? { system: opts.system } : {}),
        messages: opts.messages,
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
      return {
        ok: false,
        error: `Anthropic API error ${res.status}${detail}`,
        status: res.status,
      };
    }
    const json = (await res.json()) as {
      content?: { type: string; text?: string }[];
    };
    const text =
      json.content
        ?.filter((c) => c.type === "text")
        .map((c) => c.text ?? "")
        .join("\n") ?? "";
    return { ok: true, text, provider: "anthropic" };
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    return {
      ok: false,
      error: aborted
        ? "L’analyse a pris trop de temps"
        : "Connexion Anthropic impossible",
    };
  } finally {
    clearTimeout(timer);
  }
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

function buildAnalyzePrompt(
  input: AnalysisInput,
  frames: { label: string; present: boolean }[],
) {
  const present = frames.filter((f) => f.present).map((f) => f.label);
  const multi = present.length > 1;
  const parts = [
    "Tu es un analyste technique senior pour Ngntrade (multi-timeframe).",
    "Lis UNIQUEMENT ce qui est visible sur les captures : bougies, axes, indicateurs, volumes, niveaux, ATR si affiché.",
    "Ne fabule pas de prix contradictoires avec l’échelle. Si un champ est illisible, approxime prudemment et baisse confidence.",
    "Rédige trend, rationale, risks, sessionNotes, invalidation et patterns en français, ton professionnel, concis.",
    "Ce n’est pas un conseil financier : un plan à vérifier avant de risquer du capital.",
    "score = qualité du setup 0-100. confidence = certitude de lecture des graphiques 0-100.",
    "Réponds UNIQUEMENT avec un objet JSON valide.",
    "Interdit : markdown, blocs code, commentaires, texte avant/après le JSON.",
    "Les nombres (prix, scores) doivent être des number JSON, pas des strings.",
    "setup.sniperEntry : UN seul prix d'entrée LIMIT chirurgical (buy limit ou sell limit selon direction).",
    "setup.sniperReason : 1–2 phrases — confluence MTF + structure (FVG, OB, VWAP, equal highs/lows).",
    "Si direction=wait : sniperEntry = prix idéal d'attente (limit), pas le prix marché actuel.",
  ];
  if (multi) {
    parts.push(
      `MULTI-TIMEFRAME activé. Images fournies : ${present.join(", ")}.`,
      "Ordre de lecture strict :",
      "1) H1 = biais structurel (tendance, range, niveaux majeurs). Sans alignement H1, préfère direction=wait.",
      "2) M15 = zone d'entrée et invalidation intermédiaire.",
      "3) M5 = raffinement du limit sniper (retest précis).",
      "timeframe du JSON = TF d'exécution principal (souvent M15 ou M5).",
      "sessionNotes : résume en 2–4 phrases la confluence H1→M15→M5.",
    );
  } else {
    parts.push(
      "Une seule capture fournie. Analyse standard. timeframe = TF visible sur l'image.",
    );
  }
  parts.push(
    "STOP LOSS — règle ATR (prioritaire) :",
    "1) SL = environ 1× ATR du TF d'exécution (M15 si dispo, sinon M5, sinon TF unique).",
    "2) Si l'indicateur ATR est visible, utilise sa valeur lue sur le graphique.",
    "3) Sinon estime ATR ≈ amplitude moyenne des bougies récentes (ou True Range moyen visible).",
    "4) Place le SL au-delà d'une structure claire, à une distance ≈ 1 ATR depuis le sniper (pas plus serré que 0,8 ATR, pas plus large que 1,3 ATR sans raison structurelle).",
    "5) Interdit : compresser le SL juste pour gonfler le R:R.",
    "TAKE PROFITS :",
    "1) TP1 ≈ 1R à 1,5R (premier niveau structure).",
    "2) TP2 / TP3 = extensions H1 / niveaux majeurs visibles.",
    "3) Aligne les TP sur supports/résistances listés.",
    "imageQuality : qualité de lecture de l'ENSEMBLE des images (axes, TF, netteté).",
    "Ne promets jamais un winrate ; score = qualité de lecture + confluence MTF.",
  );
  if (input.market && input.market !== "auto") {
    parts.push(`Marché déclaré par le trader : ${input.market}.`);
  }
  if (input.session && input.session !== "any") {
    parts.push(`Session : ${input.session}.`);
  }
  if (input.risk) parts.push(`Risque annoncé : ${input.risk}.`);
  if (input.thesis) parts.push(`Thèse du trader : ${input.thesis}`);
  parts.push(
    `Schéma JSON attendu (clés obligatoires) : ${JSON.stringify(ANALYSIS_JSON_SCHEMA)}`,
  );
  return parts.join("\n");
}

export const analyzeChart = createServerFn({ method: "POST" })
  .validator((input: AnalyzePayload) => input)
  .handler(async ({ data }) => {
    const ordered: { label: string; url: string }[] = [];
    const pushImg = (label: string, url?: string) => {
      if (url?.startsWith("data:image/")) ordered.push({ label, url });
    };
    pushImg("H1", data.images?.h1);
    pushImg("M15", data.images?.m15);
    pushImg("M5", data.images?.m5);
    if (ordered.length === 0 && data.imageDataUrl?.startsWith("data:image/")) {
      ordered.push({ label: "CHART", url: data.imageDataUrl });
    }
    if (ordered.length === 0) {
      return {
        ok: false as const,
        error: "Ajoutez au moins une capture (idéalement H1 + M15 + M5).",
      };
    }
    for (const img of ordered) {
      if (img.url.length > 1_600_000) {
        return {
          ok: false as const,
          error: `Image ${img.label} trop lourde — compressez ou recadrez.`,
        };
      }
    }

    if (!hasAnthropic() && !hasXai()) {
      return {
        ok: false as const,
        error:
          "Analyse IA indisponible : ajoutez ANTHROPIC_API_KEY (Claude) ou XAI_API_KEY sur Vercel.",
      };
    }

    const frames = [
      { label: "H1", present: ordered.some((o) => o.label === "H1") },
      { label: "M15", present: ordered.some((o) => o.label === "M15") },
      { label: "M5", present: ordered.some((o) => o.label === "M5") },
      {
        label: "CHART",
        present: ordered.some((o) => o.label === "CHART"),
      },
    ];
    const prompt = buildAnalyzePrompt(data.input, frames);
    const timeoutMs = ordered.length > 1 ? 120_000 : 90_000;
    let result: LlmResult;

    if (hasAnthropic()) {
      const content: unknown[] = [];
      for (const img of ordered) {
        const parsed = parseDataUrl(img.url);
        if (!parsed) {
          return {
            ok: false as const,
            error: `Image ${img.label} invalide (data URL)`,
          };
        }
        content.push({ type: "text", text: `--- Graphique ${img.label} ---` });
        content.push({
          type: "image",
          source: {
            type: "base64",
            media_type: parsed.mediaType,
            data: parsed.base64,
          },
        });
      }
      content.push({ type: "text", text: prompt });
      result = await callAnthropic({
        system: CHART_ANALYSIS_SYSTEM,
        maxTokens: 4096,
        timeoutMs,
        messages: [{ role: "user", content }],
      });
    } else {
      const content: unknown[] = [];
      for (const img of ordered) {
        content.push({ type: "text", text: `--- Graphique ${img.label} ---` });
        content.push({
          type: "image_url",
          image_url: { url: img.url, detail: "high" },
        });
      }
      content.push({ type: "text", text: prompt });
      const messages = [{ role: "user", content }];
      const base = {
        model: XAI_MODEL,
        max_tokens: 2800,
        temperature: 0.2,
        messages,
      };
      result = await callXai(
        {
          ...base,
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "chart_analysis",
              strict: true,
              schema: ANALYSIS_JSON_SCHEMA,
            },
          },
        },
        timeoutMs,
      );
      if (!result.ok && result.status && result.status >= 400) {
        result = await callXai(
          {
            ...base,
            response_format: { type: "json_object" },
          },
          timeoutMs,
        );
      }
    }

    if (!result.ok) return { ok: false as const, error: result.error };

    try {
      const raw = extractJson(result.text);
      const parsed = ChartAnalysisSchema.safeParse(raw);
      if (parsed.success) {
        const analysis = reconcileImageQuality(parsed.data) as ChartAnalysis;
        return { ok: true as const, analysis };
      }
      // Dernier recours : forcer les défauts du schéma (très tolérant)
      const forced = ChartAnalysisSchema.parse({
        ...(typeof raw === "object" && raw ? raw : {}),
        setup:
          typeof raw === "object" && raw && "setup" in raw
            ? (raw as { setup: unknown }).setup
            : {},
      });
      return { ok: true as const, analysis: reconcileImageQuality(forced) as ChartAnalysis };
    } catch {
      return {
        ok: false as const,
        error:
          "L’IA a répondu, mais le plan est incomplet. Réessayez ou changez de capture.",
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
