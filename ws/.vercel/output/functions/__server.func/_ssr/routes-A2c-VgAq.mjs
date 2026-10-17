import { v as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { S as ArrowRight, b as CalendarDays, c as Shield, g as LayoutDashboard, p as MessageSquare, x as BookOpen, y as ChartCandlestick } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Button } from "./router-DDtmUGdU.mjs";
import { i as fetchAsDataUrl, n as SAMPLE_CHARTS, r as compressToDataUrl, t as Dropzone } from "./samples-CQ2khD4I.mjs";
import { t as Badge } from "./badge-DVTfkXrm.mjs";
import { t as useAppStore } from "./store-DWIeqJ61.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-A2c-VgAq.js
var import_jsx_runtime = require_jsx_runtime();
var STEPS = [
	{
		n: "01",
		title: "Capturez le graphique",
		body: "Symbole, timeframe, niveaux et indicateurs dans une seule image."
	},
	{
		n: "02",
		title: "Déposez et précisez votre lecture",
		body: "Thèse, risque, session. Court et clair."
	},
	{
		n: "03",
		title: "Recevez un plan utilisable",
		body: "Biais structuré, niveaux, entrée, stop, cibles — à vérifier avant le capital."
	},
	{
		n: "04",
		title: "Exécutez chez votre broker",
		body: "Taille et ordres restent sous votre contrôle."
	}
];
var FEATURES = [
	{
		icon: ChartCandlestick,
		title: "L’IA lit vos graphiques",
		body: "Niveaux, biais et plan rédigé. Forex, crypto, matières premières, indices."
	},
	{
		icon: MessageSquare,
		title: "Copilote de session",
		body: "Questionnez le plan, challengez une idée, restez ancré à vos règles."
	},
	{
		icon: BookOpen,
		title: "Journal de trades",
		body: "Importez un setup depuis l’analyse. Plus de recopies à la main."
	},
	{
		icon: LayoutDashboard,
		title: "Tableau de performance",
		body: "PnL, séries, résultats jour par jour. Ce qui paie, ce qui coûte."
	},
	{
		icon: CalendarDays,
		title: "Calendrier macro",
		body: "NFP, CPI, FOMC, BCE — planifiez autour de la volatilité."
	},
	{
		icon: Shield,
		title: "Risque d’abord",
		body: "Invalidation, taille de position, scénario qui tue le compte."
	}
];
var QUOTES = [
	{
		name: "Amira K.",
		role: "Forex · Londres",
		body: "Le plan est lisible en trente secondes. Je vérifie les niveaux sur MT5, je taille, j’exécute."
	},
	{
		name: "Leo M.",
		role: "Crypto · swing",
		body: "Plus utile qu’un signal Telegram. La zone d’invalidation m’empêche de bouger le stop."
	},
	{
		name: "Nadia R.",
		role: "Indices · cash open",
		body: "Le copilote challenge ma thèse avant le open NY. Moins de FOMO, plus de R:R tenus."
	}
];
function Home() {
	const navigate = useNavigate();
	const setPending = useAppStore((s) => s.setPending);
	async function onFile(file) {
		try {
			const data = await compressToDataUrl(file);
			setPending(data);
			navigate({ to: "/analyzer" });
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Image illisible");
		}
	}
	async function loadSample(id) {
		const sample = SAMPLE_CHARTS.find((s) => s.id === id);
		if (!sample) return;
		try {
			const data = await fetchAsDataUrl(sample.file);
			setPending(data, {
				market: sample.market,
				session: sample.session,
				thesis: sample.thesis
			});
			navigate({ to: "/analyzer" });
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Exemple indisponible");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-16",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "accent",
					children: "Forex · Crypto · Matières · Indices"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]",
					children: "L’IA qui lit vos graphiques."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 max-w-lg text-base leading-relaxed text-muted-foreground",
					children: "Envoyez une capture. Ngntrade renvoie un plan : biais, supports et résistances, zone d’entrée, stop, cibles. Vous exécutez où vous tradez déjà."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "lg",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/analyzer",
							children: ["Ouvrir l’analyzer", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "lg",
						variant: "outline",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/markets",
							children: "Voir les marchés"
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 text-xs text-subtle",
					children: "Lecture éducative. Pas un conseil d’investissement."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dropzone, { onFile }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MockPlan, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-center text-xs text-subtle",
						children: "TradingView, MetaTrader, cTrader, broker — n’importe quelle capture nette."
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "border-y border-border bg-card/40",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Proof, {
						k: "4 marchés",
						v: "FX, crypto, or, indices"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Proof, {
						k: "Plan structuré",
						v: "Biais, niveaux, R:R"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Proof, {
						k: "Vous gardez la main",
						v: "Taille et ordres chez vous"
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "border-b border-border bg-card/40",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4",
				children: STEPS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs text-accent",
						children: s.n
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-lg font-semibold",
						children: s.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-relaxed text-muted-foreground",
						children: s.body
					})
				] }, s.n))
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto max-w-6xl px-4 py-14",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-wide text-accent uppercase",
					children: "Exemples"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1 font-display text-2xl font-semibold",
					children: "Quatre classes d’actifs"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "ghost",
					size: "sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/analyzer",
						children: "Tout analyser"
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: SAMPLE_CHARTS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => void loadSample(s.id),
					className: "group overflow-hidden rounded-xl border border-border bg-card text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: s.file,
						alt: s.symbol,
						className: "h-36 w-full object-cover transition-opacity duration-fast group-hover:opacity-90"
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
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "border-t border-border",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto grid max-w-6xl gap-6 px-4 py-14 sm:grid-cols-2 lg:grid-cols-3",
				children: FEATURES.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-border bg-card p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(f.icon, { className: "size-5 text-accent" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-3 font-display text-lg font-semibold",
							children: f.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-relaxed text-muted-foreground",
							children: f.body
						})
					]
				}, f.title))
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "border-t border-border bg-card/30",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-6xl px-4 py-14",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-wide text-accent uppercase",
						children: "Traders"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-1 font-display text-2xl font-semibold",
						children: "Un second regard, pas un gourou"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-8 grid gap-4 md:grid-cols-3",
						children: QUOTES.map((q) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("blockquote", {
							className: "rounded-xl border border-border bg-card p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm leading-relaxed text-foreground/90",
								children: [
									"“",
									q.body,
									"”"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
								className: "mt-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium",
									children: q.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-subtle",
									children: q.role
								})]
							})]
						}, q.name))
					})
				]
			})
		})
	] });
}
function Proof({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "font-display text-lg font-semibold",
		children: k
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-1 text-sm text-muted-foreground",
		children: v
	})] });
}
function MockPlan() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border bg-card p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-sm",
				children: "EURUSD · H1"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Exemple de plan renvoyé"
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				variant: "bull",
				children: "Haussier"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
			className: "mt-3 grid grid-cols-3 gap-2 text-xs",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-md bg-elevated px-2 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-subtle",
						children: "Entrée"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "mt-0.5 font-mono tabular-nums",
						children: "1.1742–1.1758"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-md bg-elevated px-2 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-subtle",
						children: "Stop"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "mt-0.5 font-mono tabular-nums text-bear",
						children: "1.1718"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-md bg-elevated px-2 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-subtle",
						children: "R:R"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "mt-0.5 font-mono tabular-nums",
						children: "2.14"
					})]
				})
			]
		})]
	});
}
//#endregion
export { Home as component };
