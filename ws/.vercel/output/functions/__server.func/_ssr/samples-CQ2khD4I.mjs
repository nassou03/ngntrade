import { i as __toESM } from "../_runtime.mjs";
import { t as cn } from "./utils-CLVI9uf9.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as Upload } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/samples-CQ2khD4I.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Dropzone({ onFile, busy, compact }) {
	const [over, setOver] = (0, import_react.useState)(false);
	const id = (0, import_react.useId)();
	const handleFiles = (0, import_react.useCallback)((files) => {
		const file = files?.[0];
		if (!file) return;
		if (!file.type.startsWith("image/")) return;
		onFile(file);
	}, [onFile]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		htmlFor: id,
		onDragOver: (e) => {
			e.preventDefault();
			setOver(true);
		},
		onDragLeave: () => setOver(false),
		onDrop: (e) => {
			e.preventDefault();
			setOver(false);
			handleFiles(e.dataTransfer.files);
		},
		className: cn("flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 text-center transition-[border-color,background-color] duration-fast ease-smooth", compact ? "min-h-40 py-8" : "min-h-56 py-10", over ? "border-accent bg-accent/10" : "border-border bg-elevated/40 hover:border-accent/50", busy && "pointer-events-none opacity-60"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				id,
				type: "file",
				accept: "image/png,image/jpeg,image/webp",
				className: "sr-only",
				onChange: (e) => {
					handleFiles(e.target.files);
					e.currentTarget.value = "";
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mb-3 flex size-12 items-center justify-center rounded-md bg-card border border-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-5 text-accent" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-lg font-semibold",
				children: "Déposez votre graphique"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-sm text-sm text-muted-foreground",
				children: "PNG, JPG ou WebP. Incluez l’axe des prix et l’axe du temps."
			})
		]
	});
}
var MAX_EDGE = 1280;
var JPEG_QUALITY = .72;
var MAX_DATA_URL_CHARS = 14e5;
function loadImage(src) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => resolve(img);
		img.onerror = () => reject(/* @__PURE__ */ new Error("Impossible de lire l’image"));
		img.src = src;
	});
}
async function compressToDataUrl(source) {
	const img = await loadImage(typeof source === "string" ? source : await blobToDataUrl(source));
	const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
	const width = Math.max(1, Math.round(img.width * scale));
	const height = Math.max(1, Math.round(img.height * scale));
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Canvas indisponible");
	ctx.drawImage(img, 0, 0, width, height);
	let quality = JPEG_QUALITY;
	let dataUrl = canvas.toDataURL("image/jpeg", quality);
	while (dataUrl.length > MAX_DATA_URL_CHARS && quality > .4) {
		quality -= .08;
		dataUrl = canvas.toDataURL("image/jpeg", quality);
	}
	if (dataUrl.length > MAX_DATA_URL_CHARS) throw new Error("Image trop lourde — recadrez le graphique et réessayez.");
	return dataUrl;
}
async function makeThumbnail(dataUrl, size = 320) {
	const img = await loadImage(dataUrl);
	const scale = size / Math.max(img.width, img.height);
	const canvas = document.createElement("canvas");
	canvas.width = Math.max(1, Math.round(img.width * scale));
	canvas.height = Math.max(1, Math.round(img.height * scale));
	const ctx = canvas.getContext("2d");
	if (!ctx) return dataUrl;
	ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
	return canvas.toDataURL("image/jpeg", .6);
}
function blobToDataUrl(blob) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result));
		reader.onerror = () => reject(/* @__PURE__ */ new Error("Lecture du fichier impossible"));
		reader.readAsDataURL(blob);
	});
}
async function fetchAsDataUrl(url) {
	const res = await fetch(url);
	if (!res.ok) throw new Error("Exemple indisponible");
	return compressToDataUrl(await res.blob());
}
var SAMPLE_CHARTS = [
	{
		id: "eurusd-h1",
		file: "/samples/eurusd-h1.jpg",
		symbol: "EURUSD",
		market: "forex",
		timeframe: "H1",
		title: "Continuation haussière",
		thesis: "Structure HH/HL, pullback sur moyenne mobile. Je cherche un long de continuation session Londres.",
		session: "london"
	},
	{
		id: "btcusd-h4",
		file: "/samples/btcusd-h4.jpg",
		symbol: "BTCUSD",
		market: "crypto",
		timeframe: "H4",
		title: "Rupture baissière",
		thesis: "Sommet raté puis cassure. Bias short tant que le prix reste sous la zone de breakdown.",
		session: "newyork"
	},
	{
		id: "xauusd-d1",
		file: "/samples/xauusd-d1.jpg",
		symbol: "XAUUSD",
		market: "commodity",
		timeframe: "D1",
		title: "Range de l’or",
		thesis: "Or coincé entre support et résistance. Pas de breakout clair — fade des extrêmes ou wait.",
		session: "newyork"
	},
	{
		id: "nas100-h1",
		file: "/samples/nas100-h1.jpg",
		symbol: "NAS100",
		market: "index",
		timeframe: "H1",
		title: "Breakout d’indice",
		thesis: "Compression puis cassure haussière avec volume. Long au retest de la zone cassée.",
		session: "newyork"
	}
];
//#endregion
export { makeThumbnail as a, fetchAsDataUrl as i, SAMPLE_CHARTS as n, compressToDataUrl as r, Dropzone as t };
