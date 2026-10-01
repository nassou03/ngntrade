import { n as _enum, o as object, r as array, s as string, t as number } from "../_libs/zod.mjs";
import { t as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-A6pJPYTF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/server-Cpavgvsn.js
var ChartAnalysisSchema = object({
	symbol: string().min(1).max(32),
	market: _enum([
		"forex",
		"crypto",
		"commodity",
		"index",
		"unknown"
	]),
	timeframe: string().min(1).max(16),
	bias: _enum([
		"bullish",
		"bearish",
		"neutral"
	]),
	confidence: number().min(0).max(100),
	trend: string().min(1).max(280),
	score: number().min(0).max(100),
	patterns: array(string().max(80)).max(8),
	support: array(number()).max(6),
	resistance: array(number()).max(6),
	currentPrice: number(),
	setup: object({
		direction: _enum([
			"long",
			"short",
			"wait"
		]),
		entryMin: number(),
		entryMax: number(),
		stopLoss: number(),
		takeProfits: array(number()).max(4),
		riskReward: number(),
		invalidation: string().max(400)
	}),
	rationale: string().min(1).max(1800),
	risks: array(string().max(240)).max(6),
	sessionNotes: string().max(400)
});
var ANALYSIS_JSON_SCHEMA = {
	type: "object",
	additionalProperties: false,
	properties: {
		symbol: { type: "string" },
		market: {
			type: "string",
			enum: [
				"forex",
				"crypto",
				"commodity",
				"index",
				"unknown"
			]
		},
		timeframe: { type: "string" },
		bias: {
			type: "string",
			enum: [
				"bullish",
				"bearish",
				"neutral"
			]
		},
		confidence: { type: "number" },
		trend: { type: "string" },
		score: { type: "number" },
		patterns: {
			type: "array",
			items: { type: "string" }
		},
		support: {
			type: "array",
			items: { type: "number" }
		},
		resistance: {
			type: "array",
			items: { type: "number" }
		},
		currentPrice: { type: "number" },
		setup: {
			type: "object",
			additionalProperties: false,
			properties: {
				direction: {
					type: "string",
					enum: [
						"long",
						"short",
						"wait"
					]
				},
				entryMin: { type: "number" },
				entryMax: { type: "number" },
				stopLoss: { type: "number" },
				takeProfits: {
					type: "array",
					items: { type: "number" }
				},
				riskReward: { type: "number" },
				invalidation: { type: "string" }
			},
			required: [
				"direction",
				"entryMin",
				"entryMax",
				"stopLoss",
				"takeProfits",
				"riskReward",
				"invalidation"
			]
		},
		rationale: { type: "string" },
		risks: {
			type: "array",
			items: { type: "string" }
		},
		sessionNotes: { type: "string" }
	},
	required: [
		"symbol",
		"market",
		"timeframe",
		"bias",
		"confidence",
		"trend",
		"score",
		"patterns",
		"support",
		"resistance",
		"currentPrice",
		"setup",
		"rationale",
		"risks",
		"sessionNotes"
	]
};
var MODEL = "grok-4.5";
function extractJson(text) {
	const trimmed = text.trim();
	const start = trimmed.indexOf("{");
	const end = trimmed.lastIndexOf("}");
	if (start === -1 || end === -1) throw new Error("Réponse IA illisible");
	return JSON.parse(trimmed.slice(start, end + 1));
}
async function callXai(body, timeoutMs = 9e4) {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "AI is not available"
	};
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const res = await fetch("https://api.x.ai/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify(body),
			signal: controller.signal
		});
		if (!res.ok) return {
			ok: false,
			error: `xAI API error ${res.status}`,
			status: res.status
		};
		return {
			ok: true,
			text: (await res.json()).choices?.[0]?.message?.content ?? ""
		};
	} catch (err) {
		return {
			ok: false,
			error: err instanceof Error && err.name === "AbortError" ? "L’analyse a pris trop de temps" : "Connexion IA impossible"
		};
	} finally {
		clearTimeout(timer);
	}
}
function buildAnalyzePrompt(input) {
	const parts = [
		"Tu es un analyste technique senior pour Ngntrade.",
		"Lis UNIQUEMENT ce qui est visible sur la capture : bougies, axes, indicateurs, volumes, niveaux tracés.",
		"Ne fabule pas de prix contradictoires avec l’échelle. Si un champ est illisible, approxime prudemment et baisse confidence.",
		"Rédige trend, rationale, risks, sessionNotes, invalidation et patterns en français, ton professionnel, concis.",
		"Ce n’est pas un conseil financier : un plan à vérifier avant de risquer du capital.",
		"score = qualité du setup 0-100. confidence = certitude de lecture du graphique 0-100.",
		"takeProfits : 1 à 3 cibles dans le sens du trade. Si direction = wait, fournis tout de même des zones hypothétiques."
	];
	if (input.market && input.market !== "auto") parts.push(`Marché déclaré par le trader : ${input.market}.`);
	if (input.session && input.session !== "any") parts.push(`Session : ${input.session}.`);
	if (input.risk) parts.push(`Risque annoncé : ${input.risk}.`);
	if (input.thesis) parts.push(`Thèse du trader : ${input.thesis}`);
	return parts.join("\n");
}
var analyzeChart_createServerFn_handler = createServerRpc({
	id: "49e390d9bf5618ec9f7d49d5eae8ebb4c93820eb250625e8501a7cb25708cdc5",
	name: "analyzeChart",
	filename: "src/lib/analysis/server.ts"
}, (opts) => analyzeChart.__executeServer(opts));
var analyzeChart = createServerFn({ method: "POST" }).validator((input) => input).handler(analyzeChart_createServerFn_handler, async ({ data }) => {
	if (!data.imageDataUrl?.startsWith("data:image/")) return {
		ok: false,
		error: "Image invalide"
	};
	if (data.imageDataUrl.length > 16e5) return {
		ok: false,
		error: "Image trop lourde"
	};
	const base = {
		model: MODEL,
		max_tokens: 2200,
		temperature: .2,
		messages: [{
			role: "user",
			content: [{
				type: "image_url",
				image_url: {
					url: data.imageDataUrl,
					detail: "high"
				}
			}, {
				type: "text",
				text: buildAnalyzePrompt(data.input)
			}]
		}]
	};
	let result = await callXai({
		...base,
		response_format: {
			type: "json_schema",
			json_schema: {
				name: "chart_analysis",
				strict: true,
				schema: ANALYSIS_JSON_SCHEMA
			}
		}
	});
	if (!result.ok && result.status && result.status >= 400) result = await callXai({
		...base,
		response_format: { type: "json_object" }
	});
	if (!result.ok) return {
		ok: false,
		error: result.error
	};
	try {
		return {
			ok: true,
			analysis: ChartAnalysisSchema.parse(extractJson(result.text))
		};
	} catch {
		return {
			ok: false,
			error: "L’IA n’a pas renvoyé un plan exploitable. Réessayez."
		};
	}
});
var TONE_PROMPTS = {
	analyst: "Tu es l’analyste de session Ngntrade. Réponses structurées, factuelles, sans fluff. Challenge la thèse si elle est faible.",
	mentor: "Tu es un mentor de trading patient. Explique le pourquoi (structure, liquidité, risque) pour faire progresser le trader.",
	risk: "Tu es risk manager. Priorité invalidation, taille de position, corrélation et scénario qui tue le compte. Pas de forçage de trade."
};
var askCopilot_createServerFn_handler = createServerRpc({
	id: "bd89eb35a216569b66a0fbcc87e7bdddd9a91bb624a6db640ad2d17bd5b88994",
	name: "askCopilot",
	filename: "src/lib/analysis/server.ts"
}, (opts) => askCopilot.__executeServer(opts));
var askCopilot = createServerFn({ method: "POST" }).validator((input) => input).handler(askCopilot_createServerFn_handler, async ({ data }) => {
	const history = data.messages.slice(-8);
	const result = await callXai({
		model: MODEL,
		max_tokens: 900,
		temperature: .4,
		messages: [{
			role: "system",
			content: [
				TONE_PROMPTS[data.tone],
				"Réponds en français, concis (120-180 mots max sauf si on te demande un plan détaillé).",
				"Pas de conseil financier personnalisé. Rappelle que l’exécution reste chez le trader.",
				"Si un plan d’analyse est fourni, ancre tes réponses dessus.",
				data.analysisContext ? `Plan en cours :\n${data.analysisContext}` : "Aucun graphique chargé. Pose des questions de clarification plutôt que d’inventer des niveaux."
			].join("\n")
		}, ...history]
	}, 6e4);
	if (!result.ok) return {
		ok: false,
		error: result.error
	};
	return {
		ok: true,
		text: result.text.trim()
	};
});
//#endregion
export { analyzeChart_createServerFn_handler, askCopilot_createServerFn_handler };
