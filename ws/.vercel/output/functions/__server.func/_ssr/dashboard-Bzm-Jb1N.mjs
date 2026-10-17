import { i as __toESM } from "../_runtime.mjs";
import { r as formatPnl, t as cn } from "./utils-CLVI9uf9.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as CardTitle, n as CardContent, r as CardHeader, t as Card } from "./card-8PTL9kW2.mjs";
import { i as MARKET_LABELS } from "./types-CA2WmqyP.mjs";
import { t as useAppStore } from "./store-DWIeqJ61.mjs";
import { a as Area, c as ResponsiveContainer, i as XAxis, l as Tooltip, n as BarChart, o as CartesianGrid, r as YAxis, s as Bar, t as AreaChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-Bzm-Jb1N.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DashboardPage() {
	const trades = useAppStore((s) => s.trades);
	const seedDemo = useAppStore((s) => s.seedDemo);
	(0, import_react.useEffect)(() => {
		seedDemo();
	}, [seedDemo]);
	const stats = (0, import_react.useMemo)(() => compute(trades), [trades]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl px-4 py-8 pb-28 md:pb-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-wide text-accent uppercase",
				children: "Performance"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-1 font-display text-3xl font-semibold tracking-tight",
				children: "Ce qui paie"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-xl text-sm text-muted-foreground",
				children: "Calculé depuis votre journal local. Les lignes de démo montrent le tableau vivant."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "PnL net",
						value: formatPnl(stats.pnl),
						tone: stats.pnl >= 0 ? "bull" : "bear"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Win rate",
						value: `${stats.winRate.toFixed(0)}%`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Série",
						value: stats.streak
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Profit factor",
						value: stats.pf.toFixed(2)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-4 lg:grid-cols-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "lg:col-span-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base",
						children: "Courbe d’équité"
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "h-56",
						children: stats.equity.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
								data: stats.equity,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
										id: "eq",
										x1: "0",
										y1: "0",
										x2: "0",
										y2: "1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
											offset: "0%",
											stopColor: "var(--color-accent)",
											stopOpacity: .35
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
											offset: "100%",
											stopColor: "var(--color-accent)",
											stopOpacity: 0
										})]
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
										stroke: "var(--color-border)",
										vertical: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
										dataKey: "label",
										tick: {
											fill: "var(--color-subtle)",
											fontSize: 11
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
										tick: {
											fill: "var(--color-subtle)",
											fontSize: 11
										},
										width: 48
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
										background: "var(--color-elevated)",
										border: "1px solid var(--color-border)",
										borderRadius: 8
									} }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
										type: "monotone",
										dataKey: "value",
										stroke: "var(--color-accent)",
										fill: "url(#eq)",
										strokeWidth: 2
									})
								]
							})
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "lg:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base",
						children: "PnL par marché"
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "h-56",
						children: stats.byMarket.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
								data: stats.byMarket,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
										stroke: "var(--color-border)",
										vertical: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
										dataKey: "label",
										tick: {
											fill: "var(--color-subtle)",
											fontSize: 11
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
										tick: {
											fill: "var(--color-subtle)",
											fontSize: 11
										},
										width: 40
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
										background: "var(--color-elevated)",
										border: "1px solid var(--color-border)",
										borderRadius: 8
									} }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
										dataKey: "pnl",
										fill: "var(--color-primary)",
										radius: [
											6,
											6,
											0,
											0
										]
									})
								]
							})
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg font-semibold",
					children: "Jour par jour"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 divide-y divide-border rounded-xl border border-border bg-card",
					children: stats.byDay.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "p-6 text-sm text-muted-foreground",
						children: "Pas encore de clôture."
					}) : stats.byDay.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between px-4 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm",
							children: d.day
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("font-mono text-sm tabular-nums", d.pnl >= 0 ? "text-bull" : "text-bear"),
							children: formatPnl(d.pnl)
						})]
					}, d.day))
				})]
			})
		]
	});
}
function Stat({ label, value, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs tracking-wide text-subtle uppercase",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: cn("mt-1 font-mono text-2xl tabular-nums", tone === "bull" && "text-bull", tone === "bear" && "text-bear"),
			children: value
		})]
	}) });
}
function Empty() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-full items-center justify-center text-sm text-muted-foreground",
		children: "Journalisez un trade clos pour voir la courbe."
	});
}
function compute(trades) {
	const closed = [...trades].filter((t) => t.status !== "open").sort((a, b) => new Date(a.closedAt ?? a.createdAt).getTime() - new Date(b.closedAt ?? b.createdAt).getTime());
	const wins = closed.filter((t) => t.status === "win").length;
	const losses = closed.filter((t) => t.status === "loss").length;
	const pnl = closed.reduce((s, t) => s + t.pnl, 0);
	const grossWin = closed.filter((t) => t.pnl > 0).reduce((s, t) => s + t.pnl, 0);
	const grossLoss = Math.abs(closed.filter((t) => t.pnl < 0).reduce((s, t) => s + t.pnl, 0));
	const pf = grossLoss === 0 ? grossWin > 0 ? 99 : 0 : grossWin / grossLoss;
	let streakCount = 0;
	let streakKind = "—";
	for (const t of [...closed].reverse()) {
		if (t.status === "be") continue;
		const k = t.status === "win" ? "W" : "L";
		if (streakKind === "—") streakKind = k;
		if (k !== streakKind) break;
		streakCount += 1;
	}
	let run = 0;
	const equity = closed.map((t, i) => {
		run += t.pnl;
		const d = new Date(t.closedAt ?? t.createdAt);
		return {
			label: `${d.getDate()}/${d.getMonth() + 1}`,
			value: run,
			i
		};
	});
	const marketMap = /* @__PURE__ */ new Map();
	for (const t of closed) marketMap.set(t.market, (marketMap.get(t.market) ?? 0) + t.pnl);
	const byMarket = [...marketMap.entries()].map(([m, v]) => ({
		label: MARKET_LABELS[m],
		pnl: v
	}));
	const dayMap = /* @__PURE__ */ new Map();
	for (const t of closed) {
		const day = new Date(t.closedAt ?? t.createdAt).toLocaleDateString("fr-FR", {
			weekday: "short",
			day: "numeric",
			month: "short"
		});
		dayMap.set(day, (dayMap.get(day) ?? 0) + t.pnl);
	}
	const byDay = [...dayMap.entries()].map(([day, v]) => ({
		day,
		pnl: v
	}));
	return {
		pnl,
		winRate: closed.length ? wins / Math.max(1, wins + losses) * 100 : 0,
		streak: streakKind === "—" ? "—" : `${streakCount}${streakKind}`,
		pf,
		equity,
		byMarket,
		byDay
	};
}
//#endregion
export { DashboardPage as component };
