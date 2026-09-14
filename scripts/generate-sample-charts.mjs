import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public/samples");

function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildOhlc({ seed, start, bars, drift, vol, pattern }) {
  const rnd = mulberry32(seed);
  const data = [];
  let price = start;
  for (let i = 0; i < bars; i++) {
    const t = i / (bars - 1);
    let extra = 0;
    if (pattern === "uptrend") extra = t * start * 0.018;
    if (pattern === "breakdown") extra = t > 0.62 ? -start * 0.035 * ((t - 0.62) / 0.38) : t * start * 0.01;
    if (pattern === "range") extra = Math.sin(t * Math.PI * 4) * start * 0.012;
    if (pattern === "breakout") extra = t < 0.7 ? Math.sin(t * Math.PI * 6) * start * 0.004 : (t - 0.7) * start * 0.016;
    const shock = (rnd() - 0.48) * vol;
    const open = price;
    const close = price * (1 + drift + shock) + extra * 0.08;
    const high = Math.max(open, close) * (1 + rnd() * vol * 0.55);
    const low = Math.min(open, close) * (1 - rnd() * vol * 0.55);
    const volume = 800 + rnd() * 2200 + (pattern === "breakout" && t > 0.7 ? 1600 : 0);
    data.push({ open, high, low, close, volume });
    price = close;
  }
  return data;
}

const CHARTS = [
  {
    file: "eurusd-h1.jpg",
    title: "EURUSD",
    tf: "H1",
    venue: "FX · Londres",
    decimals: 5,
    ma: true,
    data: buildOhlc({ seed: 11, start: 1.1682, bars: 80, drift: 0.00008, vol: 0.0011, pattern: "uptrend" }),
  },
  {
    file: "btcusd-h4.jpg",
    title: "BTCUSD",
    tf: "H4",
    venue: "Crypto · 24/7",
    decimals: 0,
    ma: true,
    data: buildOhlc({ seed: 22, start: 114800, bars: 72, drift: -0.0004, vol: 0.008, pattern: "breakdown" }),
  },
  {
    file: "xauusd-d1.jpg",
    title: "XAUUSD",
    tf: "D1",
    venue: "Or · Spot",
    decimals: 2,
    ma: true,
    data: buildOhlc({ seed: 33, start: 3388, bars: 64, drift: 0, vol: 0.0042, pattern: "range" }),
  },
  {
    file: "nas100-h1.jpg",
    title: "NAS100",
    tf: "H1",
    venue: "Indice · NY",
    decimals: 1,
    ma: true,
    data: buildOhlc({ seed: 44, start: 20140, bars: 76, drift: 0.00012, vol: 0.0034, pattern: "breakout" }),
  },
];

function pageHtml(chart) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  html, body { margin: 0; background: #0c0e12; }
  canvas { display: block; }
</style>
</head>
<body>
<canvas id="c" width="1280" height="720"></canvas>
<script>
const chart = ${JSON.stringify(chart)};
const data = chart.data;
const c = document.getElementById("c");
const ctx = c.getContext("2d");
const W = c.width, H = c.height;
const pad = { t: 64, r: 92, b: 92, l: 28 };
const volH = 86;
const plotH = H - pad.t - pad.b - volH - 12;
const plotW = W - pad.l - pad.r;

ctx.fillStyle = "#0c0e12";
ctx.fillRect(0, 0, W, H);

const highs = data.map(d => d.high);
const lows = data.map(d => d.low);
const min = Math.min(...lows);
const max = Math.max(...highs);
const span = (max - min) || 1;
const yPad = span * 0.08;
const yMin = min - yPad;
const yMax = max + yPad;
const ySpan = yMax - yMin;
const maxVol = Math.max(...data.map(d => d.volume));

function y(p) { return pad.t + (1 - (p - yMin) / ySpan) * plotH; }
function x(i) { return pad.l + (i + 0.5) * (plotW / data.length); }

ctx.strokeStyle = "rgba(232,234,239,0.06)";
ctx.lineWidth = 1;
ctx.font = "12px 'IBM Plex Mono', ui-monospace, monospace";
ctx.fillStyle = "#6b7380";
const ticks = 6;
for (let i = 0; i <= ticks; i++) {
  const p = yMin + (ySpan * i) / ticks;
  const yy = y(p);
  ctx.beginPath();
  ctx.moveTo(pad.l, yy);
  ctx.lineTo(W - pad.r, yy);
  ctx.stroke();
  ctx.fillText(p.toLocaleString("en-US", { minimumFractionDigits: chart.decimals, maximumFractionDigits: chart.decimals }), W - pad.r + 10, yy + 4);
}

ctx.fillStyle = "#9eb4c8";
ctx.font = "600 22px 'IBM Plex Sans', sans-serif";
ctx.fillText(chart.title, 28, 34);
ctx.fillStyle = "#6b7380";
ctx.font = "13px 'IBM Plex Sans', sans-serif";
ctx.fillText(chart.tf + "  ·  " + chart.venue + "  ·  Ngntrade", 28, 52);

const last = data[data.length - 1];
const upLast = last.close >= last.open;
ctx.fillStyle = upLast ? "#5d9b7a" : "#c46a6a";
ctx.font = "600 20px 'IBM Plex Mono', monospace";
ctx.fillText(last.close.toLocaleString("en-US", { minimumFractionDigits: chart.decimals, maximumFractionDigits: chart.decimals }), 280, 36);

const slot = plotW / data.length;
const bodyW = Math.max(3, slot * 0.62);

if (chart.ma) {
  const period = 12;
  ctx.beginPath();
  ctx.strokeStyle = "#9eb4c8";
  ctx.lineWidth = 1.4;
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const ma = slice.reduce((s, d) => s + d.close, 0) / period;
    const xx = x(i);
    const yy = y(ma);
    if (i === period - 1) ctx.moveTo(xx, yy);
    else ctx.lineTo(xx, yy);
  }
  ctx.stroke();
}

for (let i = 0; i < data.length; i++) {
  const d = data[i];
  const xx = x(i);
  const bull = d.close >= d.open;
  ctx.strokeStyle = bull ? "#5d9b7a" : "#c46a6a";
  ctx.fillStyle = bull ? "#5d9b7a" : "#c46a6a";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(xx, y(d.high));
  ctx.lineTo(xx, y(d.low));
  ctx.stroke();
  const top = y(Math.max(d.open, d.close));
  const bot = y(Math.min(d.open, d.close));
  const h = Math.max(1.5, bot - top);
  ctx.fillRect(xx - bodyW / 2, top, bodyW, h);
}

const volTop = pad.t + plotH + 18;
for (let i = 0; i < data.length; i++) {
  const d = data[i];
  const xx = x(i);
  const h = (d.volume / maxVol) * volH;
  ctx.fillStyle = d.close >= d.open ? "rgba(93,155,122,0.45)" : "rgba(196,106,106,0.45)";
  ctx.fillRect(xx - bodyW / 2, volTop + volH - h, bodyW, h);
}

ctx.strokeStyle = upLast ? "rgba(93,155,122,0.45)" : "rgba(196,106,106,0.45)";
ctx.setLineDash([4, 4]);
ctx.beginPath();
ctx.moveTo(pad.l, y(last.close));
ctx.lineTo(W - pad.r, y(last.close));
ctx.stroke();
ctx.setLineDash([]);

ctx.fillStyle = "#6b7380";
ctx.font = "11px 'IBM Plex Mono', monospace";
const labels = 8;
for (let i = 0; i < labels; i++) {
  const idx = Math.round((i / (labels - 1)) * (data.length - 1));
  ctx.fillText(String(idx), x(idx) - 6, H - 18);
}

ctx.fillStyle = "#3a404c";
ctx.font = "11px 'IBM Plex Sans', sans-serif";
ctx.fillText("Échantillon Ngntrade — axes prix et temps visibles", 28, H - 18);
</script>
</body>
</html>`;
}

const browser = await chromium.launch();
await mkdir(outDir, { recursive: true });

for (const chart of CHARTS) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.setContent(pageHtml(chart), { waitUntil: "networkidle" });
  const buf = await page.locator("canvas").screenshot({ type: "jpeg", quality: 86 });
  await writeFile(join(outDir, chart.file), buf);
  await page.close();
  console.log("wrote", chart.file);
}

await browser.close();
