import { i as __toESM } from "../_runtime.mjs";
import { t as cn } from "./utils-CLVI9uf9.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as Button } from "./router-DDtmUGdU.mjs";
import { t as Badge } from "./badge-DVTfkXrm.mjs";
import { a as addDays, i as startOfWeek, n as format, r as isSameDay, t as fr } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/calendar-BqqfaVp6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MACRO_EVENTS = [
	{
		id: "nfp",
		at: "2026-09-04T12:30:00.000Z",
		currency: "USD",
		title: "Non-Farm Payrolls",
		impact: "high",
		actual: "148K",
		forecast: "135K",
		previous: "119K",
		market: "USD, indices, or"
	},
	{
		id: "ism-services",
		at: "2026-09-05T14:00:00.000Z",
		currency: "USD",
		title: "ISM Services PMI",
		impact: "medium",
		actual: "53.1",
		forecast: "52.4",
		previous: "52.0",
		market: "USD, NAS100"
	},
	{
		id: "china-cpi",
		at: "2026-09-09T01:30:00.000Z",
		currency: "CNY",
		title: "CPI Chine (YoY)",
		impact: "medium",
		forecast: "0.4%",
		previous: "0.2%",
		market: "AUD, cuivre, indices Asie"
	},
	{
		id: "cpi-us",
		at: "2026-09-10T12:30:00.000Z",
		currency: "USD",
		title: "CPI US (YoY)",
		impact: "high",
		forecast: "2.8%",
		previous: "2.9%",
		market: "USD, or, NAS100"
	},
	{
		id: "core-cpi",
		at: "2026-09-10T12:30:00.000Z",
		currency: "USD",
		title: "Core CPI (MoM)",
		impact: "high",
		forecast: "0.2%",
		previous: "0.3%",
		market: "USD, indices"
	},
	{
		id: "ecb-speakers",
		at: "2026-09-10T13:00:00.000Z",
		currency: "EUR",
		title: "Discours Lagarde (BCE)",
		impact: "medium",
		market: "EURUSD, DAX"
	},
	{
		id: "eia",
		at: "2026-09-10T14:30:00.000Z",
		currency: "USD",
		title: "Stocks de pétrole EIA",
		impact: "medium",
		forecast: "-1.8M",
		previous: "-2.4M",
		market: "WTI, USD CAD"
	},
	{
		id: "ppi",
		at: "2026-09-11T12:30:00.000Z",
		currency: "USD",
		title: "PPI US",
		impact: "medium",
		forecast: "0.2%",
		previous: "0.1%",
		market: "USD"
	},
	{
		id: "uk-gdp",
		at: "2026-09-11T06:00:00.000Z",
		currency: "GBP",
		title: "PIB Royaume-Uni (MoM)",
		impact: "high",
		forecast: "0.1%",
		previous: "0.0%",
		market: "GBPUSD, UK100"
	},
	{
		id: "fomc",
		at: "2026-09-16T18:00:00.000Z",
		currency: "USD",
		title: "Décision de taux FOMC",
		impact: "high",
		forecast: "4.25%",
		previous: "4.50%",
		market: "USD, or, indices, BTC"
	},
	{
		id: "fomc-press",
		at: "2026-09-16T18:30:00.000Z",
		currency: "USD",
		title: "Conférence Powell",
		impact: "high",
		market: "Toutes classes d’actifs"
	},
	{
		id: "boe",
		at: "2026-09-17T11:00:00.000Z",
		currency: "GBP",
		title: "Décision BoE",
		impact: "high",
		forecast: "4.00%",
		previous: "4.00%",
		market: "GBP"
	},
	{
		id: "ecb",
		at: "2026-09-17T12:15:00.000Z",
		currency: "EUR",
		title: "Décision de taux BCE",
		impact: "high",
		forecast: "2.00%",
		previous: "2.00%",
		market: "EUR, DAX"
	},
	{
		id: "jobless",
		at: "2026-09-17T12:30:00.000Z",
		currency: "USD",
		title: "Inscriptions chômage",
		impact: "medium",
		forecast: "230K",
		previous: "226K",
		market: "USD"
	},
	{
		id: "retail",
		at: "2026-09-18T12:30:00.000Z",
		currency: "USD",
		title: "Ventes au détail US",
		impact: "high",
		forecast: "0.3%",
		previous: "0.5%",
		market: "USD, indices"
	},
	{
		id: "jgb",
		at: "2026-09-18T23:00:00.000Z",
		currency: "JPY",
		title: "Inflation Tokyo (YoY)",
		impact: "medium",
		forecast: "2.4%",
		previous: "2.5%",
		market: "USDJPY"
	}
];
function CalendarPage() {
	const today = /* @__PURE__ */ new Date("2026-09-10T10:00:00Z");
	const [selected, setSelected] = (0, import_react.useState)(today);
	const weekStart = startOfWeek(today, { weekStartsOn: 1 });
	const days = Array.from({ length: 14 }, (_, i) => addDays(weekStart, i));
	const events = (0, import_react.useMemo)(() => MACRO_EVENTS.filter((e) => isSameDay(new Date(e.at), selected)).sort((a, b) => a.at.localeCompare(b.at)), [selected]);
	const upcomingHigh = MACRO_EVENTS.filter((e) => e.impact === "high" && new Date(e.at) >= today).slice(0, 4);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl px-4 py-8 pb-28 md:pb-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-wide text-accent uppercase",
				children: "Macro"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-1 font-display text-3xl font-semibold tracking-tight",
				children: "Calendrier de volatilité"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-xl text-sm text-muted-foreground",
				children: "Les sorties qui bougent le dollar, l’or, les indices et le BTC. Planifiez autour, ne tradez pas dedans à l’aveugle."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 flex gap-2 overflow-x-auto pb-2",
				children: days.map((d) => {
					const active = isSameDay(d, selected);
					const count = MACRO_EVENTS.filter((e) => isSameDay(new Date(e.at), d)).length;
					const high = MACRO_EVENTS.some((e) => e.impact === "high" && isSameDay(new Date(e.at), d));
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setSelected(d),
						className: cn("min-w-16 rounded-xl border px-3 py-2 text-left", active ? "border-accent bg-elevated" : "border-border bg-card"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] uppercase tracking-wide text-subtle",
								children: format(d, "EEE", { locale: fr })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-sm",
								children: format(d, "d")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: cn("text-[10px]", high ? "text-warn" : "text-subtle"),
								children: count ? `${count} evt` : "—"
							})
						]
					}, d.toISOString());
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-lg font-semibold",
						children: format(selected, "EEEE d MMMM", { locale: fr })
					}), events.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground",
						children: "Pas de sortie majeure ce jour. Fenêtre plus calme pour exécuter un plan technique."
					}) : events.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-xl border border-border bg-card p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImpactBadge, { impact: e.impact }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: e.currency }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-mono text-xs text-muted-foreground",
										children: [format(new Date(e.at), "HH:mm", { locale: fr }), " UTC"]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-2 font-display text-base font-semibold",
								children: e.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-subtle",
								children: e.market
							}),
							e.forecast || e.previous || e.actual ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
								className: "mt-3 grid grid-cols-3 gap-2 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
										k: "Précédent",
										v: e.previous
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
										k: "Consensus",
										v: e.forecast
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
										k: "Réel",
										v: e.actual
									})
								]
							}) : null
						]
					}, e.id))]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg font-semibold",
					children: "Prochains high impact"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-2",
					children: upcomingHigh.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						className: "h-auto w-full justify-start py-3 text-left",
						onClick: () => setSelected(new Date(e.at)),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block font-mono text-[11px] text-muted-foreground",
							children: format(new Date(e.at), "EEE d MMM HH:mm", { locale: fr })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "block text-sm",
							children: [
								e.currency,
								" · ",
								e.title
							]
						})] })
					}) }, e.id))
				})] })]
			})
		]
	});
}
function ImpactBadge({ impact }) {
	if (impact === "high") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "bear",
		children: "High"
	});
	if (impact === "medium") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "warn",
		children: "Medium"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "Low" });
}
function Metric({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md bg-elevated px-2 py-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-subtle",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono tabular-nums",
			children: v ?? "—"
		})]
	});
}
//#endregion
export { CalendarPage as component };
