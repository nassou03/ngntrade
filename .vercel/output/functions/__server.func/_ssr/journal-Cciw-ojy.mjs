import { i as __toESM } from "../_runtime.mjs";
import { i as formatPrice, t as cn } from "./utils-CLVI9uf9.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { d as Plus, o as Trash2, t as X } from "../_libs/lucide-react.mjs";
import { a as DialogOverlay, i as DialogDescription$1, n as DialogClose, o as DialogPortal, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Button } from "./router-DDtmUGdU.mjs";
import { t as Badge } from "./badge-DVTfkXrm.mjs";
import { n as CardContent, t as Card } from "./card-8PTL9kW2.mjs";
import { n as Label, r as Textarea, t as Input } from "./input-CTzoe4cj.mjs";
import { i as MARKET_LABELS, n as DIRECTION_LABELS } from "./types-CA2WmqyP.mjs";
import { t as useAppStore } from "./store-DWIeqJ61.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/journal-Cciw-ojy.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Dialog = Dialog$1;
function DialogContent({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-50 bg-background/70 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
		className: cn("fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-5 shadow-xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
			className: "absolute top-3 right-3 rounded-md p-2 text-muted-foreground hover:bg-elevated hover:text-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "Fermer"
			})]
		})]
	})] });
}
function DialogHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("mb-4 space-y-1", className),
		...props
	});
}
function DialogTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
		className: cn("font-display text-lg font-semibold", className),
		...props
	});
}
function DialogDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
		className: cn("text-sm text-muted-foreground", className),
		...props
	});
}
var STATUSES = [
	{
		id: "open",
		label: "Ouvert"
	},
	{
		id: "win",
		label: "Gain"
	},
	{
		id: "loss",
		label: "Perte"
	},
	{
		id: "be",
		label: "BE"
	}
];
function JournalPage() {
	const trades = useAppStore((s) => s.trades);
	const seedDemo = useAppStore((s) => s.seedDemo);
	const clearDemo = useAppStore((s) => s.clearDemo);
	const addTrade = useAppStore((s) => s.addTrade);
	const updateTrade = useAppStore((s) => s.updateTrade);
	const removeTrade = useAppStore((s) => s.removeTrade);
	const [open, setOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		seedDemo();
	}, [seedDemo]);
	const hasDemo = trades.some((t) => t.id.startsWith("demo-"));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl px-4 py-8 pb-28 md:pb-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-wide text-accent uppercase",
						children: "Journal"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-1 font-display text-3xl font-semibold tracking-tight",
						children: "Vos exécutions"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-xl text-sm text-muted-foreground",
						children: "Pas de connexion broker ici : vous journalisez depuis un plan Ngntrade, ou à la main."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [hasDemo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: clearDemo,
						children: "Retirer la démo"
					}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: () => setOpen(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Ajouter"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 space-y-3",
				children: trades.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "py-12 text-center text-sm text-muted-foreground",
					children: "Aucun trade. Analysez un graphique puis journalisez le setup, ou ajoutez une ligne."
				}) }) : trades.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-[1fr_auto] sm:items-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-mono text-sm",
									children: t.symbol
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: MARKET_LABELS[t.market] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: t.direction === "long" ? "bull" : "bear",
									children: DIRECTION_LABELS[t.direction]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: t.status })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 font-mono text-xs text-muted-foreground tabular-nums",
							children: [
								"Entrée ",
								formatPrice(t.entry),
								" · SL ",
								formatPrice(t.stopLoss),
								" · TP",
								" ",
								formatPrice(t.takeProfit),
								" · Taille ",
								t.size
							]
						}),
						t.notes ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: t.notes
						}) : null
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 sm:flex-col sm:items-end",
						children: [t.status === "open" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-sm tabular-nums text-subtle",
							children: "—"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "sr-only",
								children: "PnL"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: cn("h-9 w-28 rounded-md border border-input bg-elevated px-2 text-right font-mono text-sm tabular-nums", t.pnl > 0 && "text-bull", t.pnl < 0 && "text-bear"),
								defaultValue: t.pnl,
								inputMode: "decimal",
								onBlur: (e) => {
									const n = Number(e.target.value);
									if (Number.isFinite(n)) updateTrade(t.id, { pnl: n });
								}
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-1",
							children: [STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: cn("h-8 rounded-md px-2 text-[10px] uppercase tracking-wide", t.status === s.id ? "bg-elevated text-foreground" : "text-subtle hover:text-foreground"),
								onClick: () => updateTrade(t.id, {
									status: s.id,
									closedAt: s.id === "open" ? void 0 : (/* @__PURE__ */ new Date()).toISOString()
								}),
								children: s.label
							}, s.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "size-8 text-subtle hover:text-bear",
								"aria-label": "Supprimer",
								onClick: () => {
									removeTrade(t.id);
									toast("Ligne retirée");
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mx-auto size-4" })
							})]
						})]
					})]
				}, t.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TradeDialog, {
				open,
				onOpenChange: setOpen,
				onSave: (trade) => {
					addTrade(trade);
					setOpen(false);
					toast.success("Trade ajouté");
				}
			})
		]
	});
}
function StatusBadge({ status }) {
	if (status === "win") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "bull",
		children: "Gain"
	});
	if (status === "loss") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "bear",
		children: "Perte"
	});
	if (status === "be") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "warn",
		children: "BE"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "Ouvert" });
}
function TradeDialog({ open, onOpenChange, onSave }) {
	const [symbol, setSymbol] = (0, import_react.useState)("EURUSD");
	const [market, setMarket] = (0, import_react.useState)("forex");
	const [direction, setDirection] = (0, import_react.useState)("long");
	const [entry, setEntry] = (0, import_react.useState)("");
	const [stopLoss, setStopLoss] = (0, import_react.useState)("");
	const [takeProfit, setTakeProfit] = (0, import_react.useState)("");
	const [size, setSize] = (0, import_react.useState)("1");
	const [pnl, setPnl] = (0, import_react.useState)("0");
	const [notes, setNotes] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Nouveau trade" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Une ligne, un risque, une thèse." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "space-y-3",
			onSubmit: (e) => {
				e.preventDefault();
				onSave({
					createdAt: (/* @__PURE__ */ new Date()).toISOString(),
					symbol: symbol.toUpperCase(),
					market,
					direction,
					entry: Number(entry),
					stopLoss: Number(stopLoss),
					takeProfit: Number(takeProfit),
					size: Number(size) || 1,
					status: "open",
					pnl: Number(pnl) || 0,
					notes
				});
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Symbole",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: symbol,
								onChange: (e) => setSymbol(e.target.value),
								required: true
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Marché",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: "flex h-11 w-full rounded-md border border-input bg-elevated px-3 text-sm",
								value: market,
								onChange: (e) => setMarket(e.target.value),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "forex",
										children: "Forex"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "crypto",
										children: "Crypto"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "commodity",
										children: "Matière"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "index",
										children: "Indice"
									})
								]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Direction",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: "flex h-11 w-full rounded-md border border-input bg-elevated px-3 text-sm",
								value: direction,
								onChange: (e) => setDirection(e.target.value),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "long",
									children: "Achat"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "short",
									children: "Vente"
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Taille",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: size,
								onChange: (e) => setSize(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Entrée",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: entry,
								onChange: (e) => setEntry(e.target.value),
								required: true
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Stop",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: stopLoss,
								onChange: (e) => setStopLoss(e.target.value),
								required: true
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "TP",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: takeProfit,
								onChange: (e) => setTakeProfit(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "PnL (si clos)",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: pnl,
								onChange: (e) => setPnl(e.target.value)
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Notes",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: notes,
						onChange: (e) => setNotes(e.target.value)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					className: "w-full",
					children: "Enregistrer"
				})
			]
		})] })
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), children]
	});
}
//#endregion
export { JournalPage as component };
