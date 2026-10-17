import { i as __toESM } from "../_runtime.mjs";
import { i as formatPrice, n as formatPct, t as cn } from "./utils-CLVI9uf9.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as Button } from "./router-DDtmUGdU.mjs";
import { t as Badge } from "./badge-DVTfkXrm.mjs";
import { i as MARKET_LABELS, r as MARKETS } from "./types-CA2WmqyP.mjs";
import { t as createServerFn } from "./ssr.mjs";
import { t as createSsrRpc } from "./createSsrRpc-C1p7zOu_.mjs";
import { t as INSTRUMENTS } from "./instruments-CJYxfVJS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/markets-Ch-BuB7h.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var getMarketQuotes = createServerFn({ method: "GET" }).handler(createSsrRpc("fcf76b8becc651d4310caa9328bc51371066ed5c24815216cdd465822b1319f8"));
function MarketsPage() {
	const [tab, setTab] = (0, import_react.useState)("all");
	const { data } = useQuery({
		queryKey: ["quotes"],
		queryFn: () => getMarketQuotes()
	});
	const list = tab === "all" ? INSTRUMENTS : INSTRUMENTS.filter((i) => i.market === tab);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl px-4 py-8 pb-28 md:pb-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-wide text-accent uppercase",
				children: "Watchlist"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-1 font-display text-3xl font-semibold tracking-tight",
				children: "Quatre marchés, un analyzer"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-xl text-sm text-muted-foreground",
				children: "Forex, cryptomonnaies, matières premières, indices. Les prix crypto et change sont lus en direct quand le réseau le permet — le reste est indicatif."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-wrap gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
					active: tab === "all",
					onClick: () => setTab("all"),
					children: "Tous"
				}), MARKETS.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
					active: tab === m,
					onClick: () => setTab(m),
					children: MARKET_LABELS[m]
				}, m))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
				children: list.map((ins) => {
					const q = data?.[ins.symbol] ?? {
						price: ins.fallback,
						change: ins.fallbackChange
					};
					const up = q.change >= 0;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-xl border border-border bg-card p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-mono text-sm",
									children: ins.symbol
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: ins.name
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: MARKET_LABELS[ins.market] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 font-mono text-2xl tabular-nums",
								children: formatPrice(q.price, ins.decimals)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: cn("mt-1 font-mono text-xs tabular-nums", up ? "text-bull" : "text-bear"),
								children: formatPct(q.change)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "ghost",
								size: "sm",
								className: "mt-3 px-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/analyzer",
									children: "Analyser une capture"
								})
							})
						]
					}, ins.symbol);
				})
			})
		]
	});
}
function Chip({ active, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: cn("h-9 rounded-full px-3 text-xs font-medium", active ? "bg-primary text-primary-foreground" : "bg-elevated text-muted-foreground"),
		children
	});
}
//#endregion
export { MarketsPage as component };
