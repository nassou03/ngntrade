import { i as __toESM } from "../_runtime.mjs";
import { a as uid, i as formatPrice, t as cn } from "./utils-CLVI9uf9.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { _ as Copy, a as TrendingDown, d as Plus, f as Minus, h as LoaderCircle, i as TrendingUp, l as ShieldAlert, p as MessageSquare, s as Target } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Button } from "./router-DDtmUGdU.mjs";
import { a as makeThumbnail, i as fetchAsDataUrl, n as SAMPLE_CHARTS, r as compressToDataUrl, t as Dropzone } from "./samples-CQ2khD4I.mjs";
import { t as Badge } from "./badge-DVTfkXrm.mjs";
import { i as CardTitle, n as CardContent, r as CardHeader, t as Card } from "./card-8PTL9kW2.mjs";
import { n as Label, r as Textarea, t as Input } from "./input-CTzoe4cj.mjs";
import { a as SESSION_LABELS, i as MARKET_LABELS, n as DIRECTION_LABELS, t as BIAS_LABELS } from "./types-CA2WmqyP.mjs";
import { t as useAppStore } from "./store-DWIeqJ61.mjs";
import { t as analyzeChart } from "./server-C3C6CZIM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/analyzer-h6WoUsat.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function biasIcon(bias) {
	if (bias === "bullish") return TrendingUp;
	if (bias === "bearish") return TrendingDown;
	return Minus;
}
function decimalsFor(symbol, price) {
	if (price >= 1e3) return 1;
	if (price >= 100) return 2;
	if (symbol.includes("JPY")) return 3;
	if (price < 2) return 5;
	return 2;
}
function ResultPanel({ analysis, analysisId }) {
	const addTrade = useAppStore((s) => s.addTrade);
	const [capital, setCapital] = (0, import_react.useState)("10000");
	const [riskPct, setRiskPct] = (0, import_react.useState)("0.5");
	const d = decimalsFor(analysis.symbol, analysis.currentPrice || analysis.setup.entryMin);
	const BiasIcon = biasIcon(analysis.bias);
	const dir = analysis.setup.direction;
	const size = (0, import_react.useMemo)(() => {
		const cap = Number(capital);
		const rp = Number(riskPct);
		const entry = (analysis.setup.entryMin + analysis.setup.entryMax) / 2;
		const sl = analysis.setup.stopLoss;
		if (!cap || !rp || !entry || !sl || entry === sl) return null;
		return cap * (rp / 100) / Math.abs(entry - sl);
	}, [
		capital,
		riskPct,
		analysis
	]);
	const planText = [
		`${analysis.symbol} ${analysis.timeframe} — ${DIRECTION_LABELS[dir]} (${BIAS_LABELS[analysis.bias]})`,
		`Entrée ${formatPrice(analysis.setup.entryMin, d)} – ${formatPrice(analysis.setup.entryMax, d)}`,
		`Stop ${formatPrice(analysis.setup.stopLoss, d)}`,
		`TP ${analysis.setup.takeProfits.map((p) => formatPrice(p, d)).join(" / ")}`,
		`R:R ${analysis.setup.riskReward.toFixed(2)}`,
		analysis.setup.invalidation
	].join("\n");
	function saveToJournal() {
		if (dir === "wait") {
			toast("Pas de trade à journaliser — le plan dit d’attendre.");
			return;
		}
		const market = analysis.market === "unknown" ? "forex" : analysis.market;
		addTrade({
			createdAt: (/* @__PURE__ */ new Date()).toISOString(),
			symbol: analysis.symbol,
			market,
			direction: dir,
			entry: (analysis.setup.entryMin + analysis.setup.entryMax) / 2,
			stopLoss: analysis.setup.stopLoss,
			takeProfit: analysis.setup.takeProfits[0] ?? analysis.setup.entryMax,
			size: size ?? 1,
			status: "open",
			pnl: 0,
			notes: analysis.rationale.slice(0, 280),
			analysisId
		});
		toast.success("Setup ajouté au journal");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-[1.1fr_0.9fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "flex flex-row items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs font-medium tracking-wide text-subtle uppercase",
							children: [
								MARKET_LABELS[analysis.market],
								" · ",
								analysis.timeframe
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "mt-1 font-mono text-2xl tracking-tight",
							children: analysis.symbol
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: analysis.trend
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-end gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: analysis.bias === "bullish" ? "bull" : analysis.bias === "bearish" ? "bear" : "default",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BiasIcon, { className: "mr-1 size-3" }), BIAS_LABELS[analysis.bias]]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-mono text-xs text-muted-foreground tabular-nums",
							children: [
								"Score ",
								Math.round(analysis.score),
								" · Conf. ",
								Math.round(analysis.confidence),
								"%"
							]
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3 sm:grid-cols-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Prix lu",
									value: formatPrice(analysis.currentPrice, d)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Direction",
									value: DIRECTION_LABELS[dir],
									tone: dir === "long" ? "bull" : dir === "short" ? "bear" : "muted"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "R:R",
									value: analysis.setup.riskReward.toFixed(2)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Stop",
									value: formatPrice(analysis.setup.stopLoss, d),
									tone: "bear"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm leading-relaxed text-foreground/90",
							children: analysis.rationale
						}),
						analysis.patterns.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-1.5",
							children: analysis.patterns.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: p }, p))
						}) : null
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "flex items-center gap-2 text-base",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, { className: "size-4 text-accent" }), "Plan de trade"]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						k: "Zone d’entrée",
						v: `${formatPrice(analysis.setup.entryMin, d)} – ${formatPrice(analysis.setup.entryMax, d)}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						k: "Stop loss",
						v: formatPrice(analysis.setup.stopLoss, d)
					}),
					analysis.setup.takeProfits.map((tp, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						k: `Take profit ${i + 1}`,
						v: formatPrice(tp, d)
					}, i)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						k: "Invalidation",
						v: analysis.setup.invalidation
					}),
					analysis.sessionNotes ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: analysis.sessionNotes
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2 pt-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "secondary",
								onClick: () => {
									navigator.clipboard.writeText(planText);
									toast.success("Plan copié");
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }), "Copier le plan"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "secondary",
								onClick: saveToJournal,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Journaliser"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/copilot",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "size-4" }), "Interroger le copilote"]
								})
							})
						]
					})
				]
			})] })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: "Niveaux"
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "grid grid-cols-2 gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 text-xs font-medium tracking-wide text-bull uppercase",
						children: "Supports"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "space-y-1 font-mono text-sm tabular-nums",
						children: [analysis.support.map((lvl) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: formatPrice(lvl, d) }, lvl)), !analysis.support.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "text-subtle",
							children: "—"
						}) : null]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 text-xs font-medium tracking-wide text-bear uppercase",
						children: "Résistances"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "space-y-1 font-mono text-sm tabular-nums",
						children: [analysis.resistance.map((lvl) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: formatPrice(lvl, d) }, lvl)), !analysis.resistance.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "text-subtle",
							children: "—"
						}) : null]
					})] })]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: "Taille de position"
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "cap",
									children: "Capital"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "cap",
									inputMode: "decimal",
									value: capital,
									onChange: (e) => setCapital(e.target.value)
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "risk",
									children: "Risque %"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "risk",
									inputMode: "decimal",
									value: riskPct,
									onChange: (e) => setRiskPct(e.target.value)
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-sm tabular-nums",
							children: size ? `≈ ${size.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} unités` : "Indiquez capital et risque"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-subtle",
							children: "Calcul simple : risque $ / distance entrée–stop. Adaptez au lot de votre broker."
						})
					]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					className: "flex items-center gap-2 text-base",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-4 text-warn" }), "Risques"]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2 text-sm text-muted-foreground",
					children: analysis.risks.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "leading-snug",
						children: r
					}, r))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-xs text-subtle",
					children: "Lecture éducative. Vérifiez les niveaux sur votre plateforme avant d’engager du capital."
				})] })] })
			]
		})]
	});
}
function Stat({ label, value, tone = "muted" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md bg-elevated px-3 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[11px] tracking-wide text-subtle uppercase",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: cn("mt-0.5 font-mono text-sm tabular-nums", tone === "bull" && "text-bull", tone === "bear" && "text-bear"),
			children: value
		})]
	});
}
function Row({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-start justify-between gap-4 border-b border-border/80 py-2 last:border-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs text-muted-foreground",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-right font-mono text-sm tabular-nums",
			children: v
		})]
	});
}
var MARKETS = [
	"auto",
	"forex",
	"crypto",
	"commodity",
	"index"
];
var SESSIONS = [
	"any",
	"asia",
	"london",
	"newyork",
	"overlap"
];
var RISKS = [
	"0.25%",
	"0.5%",
	"1%",
	"2%"
];
function AnalyzerWorkspace() {
	const pendingImage = useAppStore((s) => s.pendingImage);
	const pendingInput = useAppStore((s) => s.pendingInput);
	const setPending = useAppStore((s) => s.setPending);
	const addAnalysis = useAppStore((s) => s.addAnalysis);
	const analyses = useAppStore((s) => s.analyses);
	const activeId = useAppStore((s) => s.activeAnalysisId);
	const setActive = useAppStore((s) => s.setActiveAnalysis);
	const [image, setImage] = (0, import_react.useState)(pendingImage);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [market, setMarket] = (0, import_react.useState)(pendingInput?.market ?? "auto");
	const [session, setSession] = (0, import_react.useState)(pendingInput?.session ?? "any");
	const [risk, setRisk] = (0, import_react.useState)(pendingInput?.risk ?? "0.5%");
	const [thesis, setThesis] = (0, import_react.useState)(pendingInput?.thesis ?? "");
	const active = analyses.find((a) => a.id === activeId);
	(0, import_react.useEffect)(() => {
		if (pendingImage) {
			setImage(pendingImage);
			setPending(null);
		}
	}, [pendingImage, setPending]);
	async function loadFile(file) {
		try {
			const data = await compressToDataUrl(file);
			setImage(data);
			setError(null);
			setActive(null);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Image illisible");
		}
	}
	async function loadSample(id) {
		const sample = SAMPLE_CHARTS.find((s) => s.id === id);
		if (!sample) return;
		setBusy(true);
		setError(null);
		try {
			const data = await fetchAsDataUrl(sample.file);
			setImage(data);
			setMarket(sample.market);
			setSession(sample.session);
			setThesis(sample.thesis);
			setActive(null);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Exemple indisponible");
		} finally {
			setBusy(false);
		}
	}
	async function run() {
		if (!image) {
			toast.error("Ajoutez d’abord une capture");
			return;
		}
		const input = {
			market,
			session,
			risk,
			thesis: thesis.trim() || void 0
		};
		setBusy(true);
		setError(null);
		try {
			const res = await analyzeChart({ data: {
				imageDataUrl: image,
				input
			} });
			if (!res.ok) {
				setError(res.error);
				toast.error(res.error);
				return;
			}
			const thumb = await makeThumbnail(image);
			addAnalysis({
				id: uid(),
				createdAt: (/* @__PURE__ */ new Date()).toISOString(),
				thumbnail: thumb,
				input,
				result: res.analysis
			});
			toast.success("Plan de trade prêt");
		} catch {
			setError("Analyse interrompue");
			toast.error("Analyse interrompue");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl space-y-8 px-4 py-8 pb-28 md:pb-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-wide text-accent uppercase",
						children: "Analyzer"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-1 font-display text-3xl font-semibold tracking-tight",
						children: "Capture, thèse, plan"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-xl text-sm text-muted-foreground",
						children: "Envoyez un graphique TradingView, MT4/MT5 ou broker. Ngntrade lit la structure et renvoie biais, niveaux et un plan exécutable chez vous."
					})
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "overflow-hidden rounded-xl border border-border bg-card",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: image,
								alt: "Graphique à analyser",
								className: "max-h-[420px] w-full object-contain bg-background"
							})
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dropzone, {
							onFile: loadFile,
							busy
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: image ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: run,
								disabled: busy,
								children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : null, busy ? "Lecture du graphique…" : "Obtenir le plan"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								disabled: busy,
								onClick: () => {
									setImage(null);
									setActive(null);
								},
								children: "Changer d’image"
							})] }) : null
						}),
						busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-accent shimmer-text",
							children: "Lecture des bougies, niveaux et structure…"
						}) : null,
						error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-bear",
							children: error
						}) : null
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-4 p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Marché" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-1.5",
								children: MARKETS.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
									active: market === m,
									onClick: () => setMarket(m),
									children: MARKET_LABELS[m]
								}, m))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Session" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-1.5",
								children: SESSIONS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
									active: session === s,
									onClick: () => setSession(s),
									children: SESSION_LABELS[s]
								}, s))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Risque" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-1.5",
								children: RISKS.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
									active: risk === r,
									onClick: () => setRisk(r),
									children: r
								}, r))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "thesis",
								children: "Votre lecture (optionnel)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "thesis",
								value: thesis,
								onChange: (e) => setThesis(e.target.value),
								placeholder: "Thèse, niveaux que vous suivez, ce que vous voulez valider…",
								maxLength: 500
							})]
						})
					]
				}) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg font-semibold",
					children: "Pas de capture sous la main"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Quatre exemples — un par classe d’actifs — pour tester le moteur."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
					children: SAMPLE_CHARTS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => void loadSample(s.id),
						className: "group overflow-hidden rounded-xl border border-border bg-card text-left transition-colors duration-quick ease-smooth hover:border-accent/50",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: s.file,
							alt: s.symbol,
							className: "h-28 w-full object-cover opacity-90 group-hover:opacity-100"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-sm",
								children: s.symbol
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: [
									s.timeframe,
									" · ",
									s.title
								]
							})]
						})]
					}, s.id))
				})
			] }),
			active ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-lg font-semibold",
						children: "Plan reçu"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: new Date(active.createdAt).toLocaleString("fr-FR") })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultPanel, {
					analysis: active.result,
					analysisId: active.id
				})]
			}) : null,
			analyses.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-lg font-semibold",
				children: "Historique"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex gap-3 overflow-x-auto pb-2",
				children: analyses.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setActive(a.id),
					className: cn("w-40 shrink-0 overflow-hidden rounded-lg border text-left transition-colors duration-quick", a.id === activeId ? "border-accent" : "border-border"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: a.thumbnail,
						alt: "",
						className: "h-20 w-full object-cover"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs",
							children: a.result.symbol
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-muted-foreground",
							children: a.result.timeframe
						})]
					})]
				}, a.id))
			})] }) : null
		]
	});
}
function Chip({ active, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: cn("h-9 rounded-full px-3 text-xs font-medium transition-colors duration-quick", active ? "bg-primary text-primary-foreground" : "bg-elevated text-muted-foreground hover:text-foreground"),
		children
	});
}
function AnalyzerPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalyzerWorkspace, {});
}
//#endregion
export { AnalyzerPage as component };
