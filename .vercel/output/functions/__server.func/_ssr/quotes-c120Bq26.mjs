import { t as createServerFn } from "./ssr.mjs";
import { t as INSTRUMENTS } from "./instruments-CJYxfVJS.mjs";
import { t as createServerRpc } from "./createServerRpc-A6pJPYTF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/quotes-c120Bq26.js
var getMarketQuotes_createServerFn_handler = createServerRpc({
	id: "fcf76b8becc651d4310caa9328bc51371066ed5c24815216cdd465822b1319f8",
	name: "getMarketQuotes",
	filename: "src/lib/markets/quotes.ts"
}, (opts) => getMarketQuotes.__executeServer(opts));
var getMarketQuotes = createServerFn({ method: "GET" }).handler(getMarketQuotes_createServerFn_handler, async () => {
	const quotes = {};
	for (const ins of INSTRUMENTS) quotes[ins.symbol] = {
		price: ins.fallback,
		change: ins.fallbackChange
	};
	try {
		const [fxRes, cgRes] = await Promise.all([fetch("https://api.frankfurter.app/latest?from=USD&to=EUR,GBP,JPY,CHF,CAD,AUD", { signal: AbortSignal.timeout(4e3) }), fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,ripple&vs_currencies=usd&include_24hr_change=true", { signal: AbortSignal.timeout(4e3) })]);
		if (fxRes.ok) {
			const r = (await fxRes.json()).rates ?? {};
			if (r.EUR) quotes.EURUSD = {
				price: 1 / r.EUR,
				change: quotes.EURUSD.change
			};
			if (r.GBP) quotes.GBPUSD = {
				price: 1 / r.GBP,
				change: quotes.GBPUSD.change
			};
			if (r.JPY) quotes.USDJPY = {
				price: r.JPY,
				change: quotes.USDJPY.change
			};
			if (r.CHF) quotes.USDCHF = {
				price: r.CHF,
				change: quotes.USDCHF.change
			};
			if (r.AUD) quotes.AUDUSD = {
				price: 1 / r.AUD,
				change: quotes.AUDUSD.change
			};
			if (r.CAD) quotes.USDCAD = {
				price: r.CAD,
				change: quotes.USDCAD.change
			};
			if (r.GBP && r.JPY) quotes.GBPJPY = {
				price: r.JPY / r.GBP,
				change: quotes.GBPJPY.change
			};
			if (r.EUR && r.GBP) quotes.EURGBP = {
				price: r.GBP / r.EUR,
				change: quotes.EURGBP.change
			};
		}
		if (cgRes.ok) {
			const cg = await cgRes.json();
			for (const [id, symbol] of Object.entries({
				bitcoin: "BTCUSD",
				ethereum: "ETHUSD",
				solana: "SOLUSD",
				ripple: "XRPUSD"
			})) {
				const row = cg[id];
				if (row?.usd) quotes[symbol] = {
					price: row.usd,
					change: row.usd_24h_change ?? quotes[symbol].change
				};
			}
		}
	} catch {}
	return quotes;
});
//#endregion
export { getMarketQuotes_createServerFn_handler };
