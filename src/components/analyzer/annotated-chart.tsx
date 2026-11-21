import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { priceToY } from "@/lib/analysis/plan-check";
import { ZONE_LABELS, type ChartAnalysis } from "@/lib/analysis/types";
import { formatPrice } from "@/lib/utils";

type Line = { key: string; label: string; price: number; y: number; color: string };
type Band = { key: string; label: string; y1: number; y2: number; color: string };

const COLORS = {
  entry: "#f2b24b",
  sl: "#f0676b",
  tp: "#35d0a5",
  zone: "#6fa8ff",
};

export function AnnotatedChart({
  src,
  analysis,
  decimals,
}: {
  src: string;
  analysis: ChartAnalysis;
  decimals: number;
}) {
  const [showZones, setShowZones] = useState(true);
  // Décalage vertical manuel (en % de la hauteur) pour corriger une calibration approximative.
  const [dy, setDy] = useState(0);
  const off = dy / 100;
  const axis = analysis.overlay?.axis;

  const { lines, bands, outOfFrame } = useMemo(() => {
    const lines: Line[] = [];
    const bands: Band[] = [];
    let outOfFrame = 0;
    if (!axis?.reliable) return { lines, bands, outOfFrame };
    const s = analysis.setup;
    const inFrame = (y: number | null): y is number => y != null && y > -0.02 && y < 1.02;
    const push = (key: string, label: string, price: number, color: string) => {
      if (!price) return;
      const y = priceToY(price, axis);
      if (!inFrame(y)) {
        outOfFrame++;
        return;
      }
      lines.push({ key, label, price, y: Math.min(1, Math.max(0, y)), color });
    };
    if (s.direction !== "wait" || s.sniperEntry) {
      push("entry", s.direction === "wait" ? "Attente" : "Entrée", s.sniperEntry, COLORS.entry);
    }
    if (s.direction !== "wait") {
      push("sl", "Stop", s.stopLoss, COLORS.sl);
      s.takeProfits.forEach((tp, i) => push(`tp${i}`, `TP${i + 1}`, tp, COLORS.tp));
    }
    // On garde les 4 zones les plus proches du prix pour éviter de surcharger le graphique.
    const ref = s.sniperEntry || analysis.currentPrice;
    const nearest = [...(analysis.zones ?? []).entries()]
      .sort(
        (x, y) =>
          Math.abs((x[1].low + x[1].high) / 2 - ref) - Math.abs((y[1].low + y[1].high) / 2 - ref),
      )
      .slice(0, 4);
    for (const [i, z] of nearest) {
      const ya = priceToY(z.low, axis);
      const yb = priceToY(z.high, axis);
      if (!inFrame(ya) || !inFrame(yb)) continue;
      bands.push({
        key: `z${i}`,
        label: ZONE_LABELS[z.kind],
        y1: Math.max(0, Math.min(ya, yb)),
        y2: Math.min(1, Math.max(ya, yb)),
        color: COLORS.zone,
      });
    }
    return { lines, bands, outOfFrame };
  }, [analysis, axis]);

  if (!axis?.reliable || (lines.length === 0 && bands.length === 0)) return null;

  async function download() {
    try {
      const img = new Image();
      img.src = src;
      await img.decode();
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const fs = Math.max(12, Math.round(c.width / 70));
      ctx.font = `600 ${fs}px sans-serif`;
      ctx.textBaseline = "middle";
      if (showZones) {
        for (const b of bands) {
          ctx.fillStyle = `${b.color}33`;
          ctx.fillRect(0, (b.y1 + off) * c.height, c.width, Math.max(2, (b.y2 - b.y1) * c.height));
        }
      }
      for (const l of lines) {
        const y = (l.y + off) * c.height;
        ctx.strokeStyle = l.color;
        ctx.lineWidth = Math.max(1.5, c.width / 700);
        ctx.setLineDash(l.key.startsWith("tp") || l.key === "sl" ? [10, 6] : []);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(c.width, y);
        ctx.stroke();
        const text = `${l.label} ${formatPrice(l.price, decimals)}`;
        const w = ctx.measureText(text).width + fs;
        ctx.fillStyle = l.color;
        ctx.fillRect(8, y - fs * 0.85, w, fs * 1.7);
        ctx.fillStyle = "#0b1117";
        ctx.fillText(text, 8 + fs / 2, y);
      }
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = `500 ${Math.round(fs * 0.8)}px sans-serif`;
      ctx.fillText("Ngntrade · lecture indicative", 10, c.height - fs);
      const a = document.createElement("a");
      a.href = c.toDataURL("image/png");
      a.download = `ngntrade-${analysis.symbol}-${analysis.timeframe}.png`;
      a.click();
    } catch {
      toast.error("Export impossible");
    }
  }

  return (
    <figure className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="relative">
        <img src={src} alt={`Graphique annoté ${analysis.symbol}`} className="block w-full" />
        {showZones
          ? bands.map((b) => (
              <div
                key={b.key}
                className="pointer-events-none absolute inset-x-0 border-y border-accent/40 bg-accent/15"
                style={{ top: `${(b.y1 + off) * 100}%`, height: `${Math.max(0.4, (b.y2 - b.y1) * 100)}%` }}
              >
                <span className="absolute left-1 top-0 rounded-sm bg-background/80 px-1 text-[10px] leading-4 text-accent">
                  {b.label}
                </span>
              </div>
            ))
          : null}
        {lines.map((l) => (
          <div
            key={l.key}
            className="pointer-events-none absolute inset-x-0"
            style={{ top: `${(l.y + off) * 100}%` }}
          >
            <div
              className="w-full"
              style={{
                borderTop: `1.5px ${l.key === "entry" ? "solid" : "dashed"} ${l.color}`,
              }}
            />
            <span
              className="absolute left-1.5 -translate-y-1/2 rounded-sm px-1.5 font-mono text-[10px] font-semibold leading-4 text-[#0b1117]"
              style={{ background: l.color }}
            >
              {l.label} {formatPrice(l.price, decimals)}
            </span>
          </div>
        ))}
      </div>
      <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
        <span>
          Positions déduites de l'axe des prix par l'IA : indicatives. Si les lignes sont décalées, utilisez « Ajuster » (double-clic pour remettre à zéro).
          {outOfFrame ? ` ${outOfFrame} niveau(x) hors cadre.` : ""}
        </span>
        <span className="flex items-center gap-2">
          <label className="flex items-center gap-1.5" title="Décale tous les niveaux si l'alignement est imprécis">
            Ajuster
            <input
              type="range"
              min={-8}
              max={8}
              step={0.25}
              value={dy}
              onChange={(e) => setDy(Number(e.target.value))}
              onDoubleClick={() => setDy(0)}
              className="w-24 accent-[var(--color-accent)]"
              aria-label="Décalage vertical des niveaux"
            />
          </label>
          {bands.length ? (
            <label className="flex cursor-pointer items-center gap-1.5">
              <input
                type="checkbox"
                checked={showZones}
                onChange={(e) => setShowZones(e.target.checked)}
                className="accent-[var(--color-accent)]"
              />
              Zones
            </label>
          ) : null}
          <Button size="sm" variant="secondary" onClick={() => void download()}>
            <Download className="size-3.5" />
            Image
          </Button>
        </span>
      </figcaption>
    </figure>
  );
}
