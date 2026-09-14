import { createServerFn } from "@tanstack/react-start";
import { ChartAnalysisSchema, ANALYSIS_JSON_SCHEMA } from "./schema";
import type { AnalysisInput, ChartAnalysis, CopilotTone } from "./types";

const MODEL = "grok-4.5";

type AnalyzePayload = {
  imageDataUrl: string;
  input: AnalysisInput;
};

type ChatPayload = {
  messages: { role: "user" | "assistant"; content: string }[];
  tone: CopilotTone;
  analysisContext?: string;
};

function extractJson(text: string) {
  const trimmed = text.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Réponse IA illisible");
  }
  return JSON.parse(trimmed.slice(start, end + 1)) as unknown;
}

async function callXai(
  body: Record<string, unknown>,
  timeoutMs = 90_000,
): Promise<{ ok: true; text: string } | { ok: false; error: string; status?: number }> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey)
    return {
      ok: false,
      error:
        "Analyse IA indisponible : configurez XAI_API_KEY (clé gratuite ou crédits xAI) côté serveur.",
    };

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
    return { ok: true, text: json.choices?.[0]?.message?.content ?? "" };
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    return {
      ok: false,
      error: aborted ? "L’analyse a pris trop de temps" : "Connexion IA impossible",
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
  ];
  if (input.market && input.market !== "auto") {
    parts.push(`Marché déclaré par le trader : ${input.market}.`);
  }
  if (input.session && input.session !== "any") {
    parts.push(`Session : ${input.session}.`);
  }
  if (input.risk) parts.push(`Risque annoncé : ${input.risk}.`);
  if (input.thesis) parts.push(`Thèse du trader : ${input.thesis}`);
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

    const messages = [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: data.imageDataUrl, detail: "high" },
          },
          { type: "text", text: buildAnalyzePrompt(data.input) },
        ],
      },
    ];

    const base = {
      model: MODEL,
      max_tokens: 2200,
      temperature: 0.2,
      messages,
    };

    let result = await callXai({
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

    if (!result.ok) return { ok: false as const, error: result.error };

    try {
      const parsed = ChartAnalysisSchema.parse(extractJson(result.text));
      return { ok: true as const, analysis: parsed as ChartAnalysis };
    } catch {
      return {
        ok: false as const,
        error: "L’IA n’a pas renvoyé un plan exploitable. Réessayez.",
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

    const result = await callXai(
      {
        model: MODEL,
        max_tokens: 900,
        temperature: 0.4,
        messages: [{ role: "system", content: system }, ...history],
      },
      60_000,
    );

    if (!result.ok) return { ok: false as const, error: result.error };
    return { ok: true as const, text: result.text.trim() };
  });


export const getAiStatus = createServerFn({ method: "GET" }).handler(async () => {
  return {
    configured: Boolean(process.env.XAI_API_KEY?.trim()),
    markets: true,
  };
});
