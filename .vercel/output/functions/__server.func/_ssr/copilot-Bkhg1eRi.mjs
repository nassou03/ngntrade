import { i as __toESM } from "../_runtime.mjs";
import { t as cn } from "./utils-CLVI9uf9.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { h as LoaderCircle, u as Send } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Button } from "./router-DDtmUGdU.mjs";
import { t as Badge } from "./badge-DVTfkXrm.mjs";
import { r as Textarea } from "./input-CTzoe4cj.mjs";
import { o as TONE_LABELS } from "./types-CA2WmqyP.mjs";
import { t as useAppStore } from "./store-DWIeqJ61.mjs";
import { n as askCopilot } from "./server-C3C6CZIM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/copilot-Bkhg1eRi.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TONES = [
	"analyst",
	"mentor",
	"risk"
];
var STARTERS = [
	"Le setup est-il assez propre pour risquer 0,5 % ?",
	"Quel est le scénario qui invalide ce plan ?",
	"Comment gérer un news high-impact pendant le trade ?",
	"Où partieler si le premier TP est trop loin ?"
];
function CopilotPage() {
	const messages = useAppStore((s) => s.messages);
	const addMessage = useAppStore((s) => s.addMessage);
	const clearMessages = useAppStore((s) => s.clearMessages);
	const tone = useAppStore((s) => s.tone);
	const setTone = useAppStore((s) => s.setTone);
	const analyses = useAppStore((s) => s.analyses);
	const activeId = useAppStore((s) => s.activeAnalysisId);
	const active = analyses.find((a) => a.id === activeId) ?? analyses[0];
	const [draft, setDraft] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const context = (0, import_react.useMemo)(() => {
		if (!active) return void 0;
		const r = active.result;
		return [
			`${r.symbol} ${r.timeframe} ${r.bias} (${r.confidence}%)`,
			`Direction ${r.setup.direction} entrée ${r.setup.entryMin}-${r.setup.entryMax} SL ${r.setup.stopLoss} TP ${r.setup.takeProfits.join("/")}`,
			r.rationale,
			`Invalidation: ${r.setup.invalidation}`
		].join("\n");
	}, [active]);
	async function send(text) {
		const content = text.trim();
		if (!content || busy) return;
		addMessage({
			role: "user",
			content
		});
		setDraft("");
		setBusy(true);
		try {
			const history = [...useAppStore.getState().messages.map((m) => ({
				role: m.role,
				content: m.content
			}))];
			const res = await askCopilot({ data: {
				messages: history,
				tone,
				analysisContext: context
			} });
			if (!res.ok) {
				toast.error(res.error);
				addMessage({
					role: "assistant",
					content: "Je n’ai pas pu répondre. Réessayez dans un instant."
				});
				return;
			}
			addMessage({
				role: "assistant",
				content: res.text
			});
		} catch {
			toast.error("Copilote indisponible");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-3xl flex-col px-4 py-8 pb-32 md:pb-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-wide text-accent uppercase",
						children: "Copilote"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-1 font-display text-3xl font-semibold tracking-tight",
						children: "Dans la room"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: active ? `Ancré sur ${active.result.symbol} ${active.result.timeframe}` : "Aucun plan chargé — analysez un graphique pour ancrer la session."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: clearMessages,
					children: "Effacer"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-4 flex flex-wrap gap-1.5",
				children: TONES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setTone(t),
					className: cn("h-9 rounded-full px-3 text-xs font-medium", tone === t ? "bg-primary text-primary-foreground" : "bg-elevated text-muted-foreground"),
					children: TONE_LABELS[t]
				}, t))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-[48vh] flex-col gap-3",
				children: [messages.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-2 sm:grid-cols-2",
					children: STARTERS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => void send(s),
						className: "rounded-xl border border-border bg-card p-4 text-left text-sm text-muted-foreground hover:border-accent/50 hover:text-foreground",
						children: s
					}, s))
				}) : messages.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("max-w-[90%] rounded-xl px-4 py-3 text-sm leading-relaxed", m.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-card border border-border"),
					children: m.content
				}, m.id)), busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "inline-flex items-center gap-2 text-sm text-accent",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), "Réflexion…"]
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "sticky bottom-20 mt-6 flex gap-2 md:bottom-4",
				onSubmit: (e) => {
					e.preventDefault();
					send(draft);
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					value: draft,
					onChange: (e) => setDraft(e.target.value),
					placeholder: "Votre question de session…",
					className: "min-h-12 resize-none",
					rows: 2,
					onKeyDown: (e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							send(draft);
						}
					}
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					size: "icon",
					disabled: busy || !draft.trim(),
					"aria-label": "Envoyer",
					children: busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" })
				})]
			}),
			active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "accent",
					children: active.result.symbol
				})
			}) : null
		]
	});
}
//#endregion
export { CopilotPage as component };
