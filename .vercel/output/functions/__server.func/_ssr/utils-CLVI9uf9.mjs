import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/utils-CLVI9uf9.js
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function formatPrice(value, decimals = 2) {
	if (!Number.isFinite(value)) return "—";
	return value.toLocaleString("fr-FR", {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals
	});
}
function formatPct(value, digits = 2) {
	return `${value > 0 ? "+" : ""}${value.toFixed(digits)}%`;
}
function formatPnl(value, currency = "USD") {
	return `${value > 0 ? "+" : ""}${value.toLocaleString("fr-FR", {
		style: "currency",
		currency,
		maximumFractionDigits: 2
	})}`;
}
function uid() {
	return crypto.randomUUID();
}
//#endregion
export { uid as a, formatPrice as i, formatPct as n, formatPnl as r, cn as t };
