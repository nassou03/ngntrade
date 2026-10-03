import { createServerFn } from "@tanstack/react-start";
import { ChartAnalysisSchema, ANALYSIS_JSON_SCHEMA } from "./schema";
import type { AnalysisInput, ChartAnalysis, CopilotTone } from "./types";

/** xAI model (si XAI_API_KEY) */
const XAI_MODEL = process.env.XAI_MODEL?.trim() || "grok-4.5";
/** Claude vision (si ANTHROPIC_API_KEY) — modèle configurable */
const ANTHROPIC_MODEL =
  process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-5-5";

type AnalyzePayload = {
  imageDataUrl: string;
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

function buildAnalyzePrompt(input: AnalysisInput) {
  const parts = [
    "Tu es un analyste technique senior pour Ngntrade.",
    "Lis UNIQUEMENT ce qui est visible sur la capture : bougies, axes, indicateurs, volumes, niveaux tracés.",
    "Ne fabule pas de prix contradictoires avec l’échelle. Si un champ est illisible, approxime prudemment et baisse confidence.",
    "Rédige trend, rationale, risks, sessionNotes, invalidation et patterns en français, ton professionnel, concis.",
    "Ce n’est pas un conseil financier : un plan à vérifier avant de risquer du capital.",
    "score = qualité du setup 0-100. confidence = certitude de lecture du graphique 0-100.",
    "takeProfits : 1 à 3 cibles dans le sens du trade. Si direction = wait, fournis tout de même des zones hypothétiques.",
    "Réponds UNIQUEMENT avec un objet JSON valide.",
    "Interdit : markdown, blocs code, commentaires, texte avant/après le JSON.",
    "Les nombres (prix, scores) doivent être des number JSON, pas des strings.",
    "setup.takeProfits : tableau de 1 à 3 nombres. patterns et risks : tableaux de strings.",
    "setup.sniperEntry : UN seul prix d'entrée chirurgical (pas une zone). Doit être dans ou collé à entryMin–entryMax.",
    "setup.sniperReason : 1–2 phrases — pourquoi CE prix (retest FVG, OB, VWAP, equal highs, liquidité, etc.).",
    "Si direction=wait : sniperEntry = prix idéal d'attente (limit), pas le prix marché actuel.",
    "Précision sniper : utilise l'échelle visible du graphique (même nombre de décimales que les labels).",
    "STOP LOSS — règles strictes :",
    "1) Place le SL AU-DELÀ d'une structure claire (swing, extrémité de range, bande VWAP externe, equal highs/lows), PAS juste sous la dernière mèche.",
    "2) Ajoute une marge de sécurité (buffer) : ~0,15–0,35 % du prix pour crypto/indices majeurs, ou 1–1,5× l'amplitude moyenne des bougies visibles sur le TF.",
    "3) Interdit : SL trop serré qui serait touché par le bruit normal du TF (ex. < 0,25 % sur BTC 15m sans structure).",
    "4) Distance sniper→SL doit permettre un R:R réaliste SANS compresser le stop artificiellement.",
    "TAKE PROFITS — règles strictes :",
    "1) TP1 = premier niveau de structure / liquidité (réaction probable), souvent ~1R à 1,5R après un SL correct.",
    "2) TP2 = extension (sommet/creux de range, VWAP session précédente, niveau rond).",
    "3) TP3 = objectif ambitieux mais visible sur le graphique (pas inventé hors échelle).",
    "4) Les TP doivent s'aligner sur supports/résistances listés ; éviter des TP collés trop près du sniper.",
    "5) Si le SL est large, accepte un R:R TP1 plus modeste (1–1,5) plutôt qu'un SL irréaliste.",
  ];
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
    if (!data.imageDataUrl?.startsWith("data:image/")) {
      return { ok: false as const, error: "Image invalide" };
    }
    if (data.imageDataUrl.length > 1_600_000) {
      return { ok: false as const, error: "Image trop lourde" };
    }

    if (!hasAnthropic() && !hasXai()) {
      return {
        ok: false as const,
        error:
          "Analyse IA indisponible : ajoutez ANTHROPIC_API_KEY (Claude) ou XAI_API_KEY sur Vercel.",
      };
    }

    const prompt = buildAnalyzePrompt(data.input);
    let result: LlmResult;

    if (hasAnthropic()) {
      const parsed = parseDataUrl(data.imageDataUrl);
      if (!parsed) {
        return { ok: false as const, error: "Image invalide (data URL)" };
      }
      result = await callAnthropic({
        maxTokens: 4096,
        temperature: 0.2,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: parsed.mediaType,
                  data: parsed.base64,
                },
              },
              { type: "text", text: prompt },
            ],
          },
        ],
      });
    } else {
      const messages = [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: data.imageDataUrl, detail: "high" },
            },
            { type: "text", text: prompt },
          ],
        },
      ];
      const base = {
        model: XAI_MODEL,
        max_tokens: 2200,
        temperature: 0.2,
        messages,
      };
      result = await callXai({
        ...base,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "chart_analysis",
            strict: true,
            schema: ANALYSIS_JSON_SCHEMA,
          },
        },
      });
      if (!result.ok && result.status && result.status >= 400) {
        result = await callXai({
          ...base,
          response_format: { type: "json_object" },
        });
      }
    }

    if (!result.ok) return { ok: false as const, error: result.error };

    try {
      const raw = extractJson(result.text);
      const parsed = ChartAnalysisSchema.safeParse(raw);
      if (parsed.success) {
        return { ok: true as const, analysis: parsed.data as ChartAnalysis };
      }
      // Dernier recours : forcer les défauts du schéma (très tolérant)
      const forced = ChartAnalysisSchema.parse({
        ...(typeof raw === "object" && raw ? raw : {}),
        setup:
          typeof raw === "object" && raw && "setup" in raw
            ? (raw as { setup: unknown }).setup
            : {},
      });
      return { ok: true as const, analysis: forced as ChartAnalysis };
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

    const history = data.messages.slice(-8);
    const system = [
      TONE_PROMPTS[data.tone],
      "Réponds en français, concis (120-180 mots max sauf si on te demande un plan détaillé).",
      "Pas de conseil financier personnalisé. Rappelle que l’exécution reste chez le trader.",
      "Si un plan d’analyse est fourni, ancre tes réponses dessus.",
      data.analysisContext
        ? `Plan en cours :\n${data.analysisContext}`
        : "Aucun graphique chargé. Pose des questions de clarification plutôt que d’inventer des niveaux.",
    ].join("\n");

    let result: LlmResult;
    if (hasAnthropic()) {
      result = await callAnthropic({
        system,
        maxTokens: 900,
        temperature: 0.4,
        timeoutMs: 60_000,
        messages: history.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });
    } else {
      result = await callXai(
        {
          model: XAI_MODEL,
          max_tokens: 900,
          temperature: 0.4,
          messages: [{ role: "system", content: system }, ...history],
        },
        60_000,
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
