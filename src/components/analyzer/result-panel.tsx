import { Link } from "@tanstack/react-router";
import {
  Copy,
  MessageSquare,
  Plus,
  ShieldAlert,
  Target,
  TrendingDown,
  TrendingUp,
  Minus,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import {
  BIAS_LABELS,
  DIRECTION_LABELS,
  MARKET_LABELS,
  type ChartAnalysis,
  type Market,
} from "@/lib/analysis/types";
import { cn, formatPrice } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { useMemo, useState } from "react";

function biasIcon(bias: ChartAnalysis["bias"]) {
  if (bias === "bullish") return TrendingUp;
  if (bias === "bearish") return TrendingDown;
  return Minus;
}

function decimalsFor(symbol: string, price: number) {
  if (price >= 1000) return 1;
  if (price >= 100) return 2;
  if (symbol.includes("JPY")) return 3;
  if (price < 2) return 5;
  return 2;
}

export function ResultPanel({
  analysis,
  analysisId,
}: {
  analysis: ChartAnalysis;
  analysisId?: string;
}) {
  const addTrade = useAppStore((s) => s.addTrade);
  const [capital, setCapital] = useState("10000");
  const [riskPct, setRiskPct] = useState("0.5");
  const d = decimalsFor(analysis.symbol, analysis.currentPrice || analysis.setup.entryMin);
  const BiasIcon = biasIcon(analysis.bias);
  const dir = analysis.setup.direction;

  const size = useMemo(() => {
    const cap = Number(capital);
    const rp = Number(riskPct);
    const entry = (analysis.setup.entryMin + analysis.setup.entryMax) / 2;
    const sl = analysis.setup.stopLoss;
    if (!cap || !rp || !entry || !sl || entry === sl) return null;
    const riskAmt = cap * (rp / 100);
    const dist = Math.abs(entry - sl);
    return riskAmt / dist;
  }, [capital, riskPct, analysis]);

  const planText = [
    `${analysis.symbol} ${analysis.timeframe} — ${DIRECTION_LABELS[dir]} (${BIAS_LABELS[analysis.bias]})`,
    `Entrée ${formatPrice(analysis.setup.entryMin, d)} – ${formatPrice(analysis.setup.entryMax, d)}`,
    `Stop ${formatPrice(analysis.setup.stopLoss, d)}`,
    `TP ${analysis.setup.takeProfits.map((p) => formatPrice(p, d)).join(" / ")}`,
    `R:R ${analysis.setup.riskReward.toFixed(2)}`,
    analysis.setup.invalidation,
  ].join("\n");

  function saveToJournal() {
    if (dir === "wait") {
      toast("Pas de trade à journaliser — le plan dit d’attendre.");
      return;
    }
    const market = analysis.market === "unknown" ? "forex" : (analysis.market as Market);
    addTrade({
      createdAt: new Date().toISOString(),
      symbol: analysis.symbol,
      market,
      direction: dir,
      entry: (analysis.setup.entryMin + analysis.setup.entryMax) / 2,
      stopLoss: analysis.setup.stopLoss,
      takeProfit: analysis.setup.takeProfits[0] ?? analysis.setup.entryMax,
      size: size ?? 1,
      status: "open",
      pnl: 0,
      notes: analysis.rationale.slice(0, 280),
      analysisId,
    });
    toast.success("Setup ajouté au journal");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4">
        <Card className="p-0">
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium tracking-wide text-subtle uppercase">
                {MARKET_LABELS[analysis.market]} · {analysis.timeframe}
              </p>
              <CardTitle className="mt-1 font-mono text-2xl tracking-tight">
                {analysis.symbol}
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{analysis.trend}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge
                variant={
                  analysis.bias === "bullish"
                    ? "bull"
                    : analysis.bias === "bearish"
                      ? "bear"
                      : "default"
                }
              >
                <BiasIcon className="mr-1 size-3" />
                {BIAS_LABELS[analysis.bias]}
              </Badge>
              <p className="font-mono text-xs text-muted-foreground tabular-nums">
                Score {Math.round(analysis.score)} · Conf. {Math.round(analysis.confidence)}%
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Prix lu" value={formatPrice(analysis.currentPrice, d)} />
              <Stat
                label="Direction"
                value={DIRECTION_LABELS[dir]}
                tone={dir === "long" ? "bull" : dir === "short" ? "bear" : "muted"}
              />
              <Stat label="R:R" value={analysis.setup.riskReward.toFixed(2)} />
              <Stat
                label="Stop"
                value={formatPrice(analysis.setup.stopLoss, d)}
                tone="bear"
              />
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">{analysis.rationale}</p>
            {analysis.patterns.length ? (
              <div className="flex flex-wrap gap-1.5">
                {analysis.patterns.map((p) => (
                  <Badge key={p}>{p}</Badge>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="size-4 text-accent" />
              Plan de trade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Row
              k="Zone d’entrée"
              v={`${formatPrice(analysis.setup.entryMin, d)} – ${formatPrice(analysis.setup.entryMax, d)}`}
            />
            <Row k="Stop loss" v={formatPrice(analysis.setup.stopLoss, d)} />
            {analysis.setup.takeProfits.map((tp, i) => (
              <Row key={i} k={`Take profit ${i + 1}`} v={formatPrice(tp, d)} />
            ))}
            <Row k="Invalidation" v={analysis.setup.invalidation} />
            {analysis.sessionNotes ? (
              <p className="text-sm text-muted-foreground">{analysis.sessionNotes}</p>
            ) : null}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  void navigator.clipboard.writeText(planText);
                  toast.success("Plan copié");
                }}
              >
                <Copy className="size-4" />
                Copier le plan
              </Button>
              <Button size="sm" variant="secondary" onClick={saveToJournal}>
                <Plus className="size-4" />
                Journaliser
              </Button>
              <Button size="sm" asChild>
                <Link to="/copilot">
                  <MessageSquare className="size-4" />
                  Interroger le copilote
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Niveaux</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-2 text-xs font-medium tracking-wide text-bull uppercase">
                Supports
              </p>
              <ul className="space-y-1 font-mono text-sm tabular-nums">
                {analysis.support.map((lvl) => (
                  <li key={lvl}>{formatPrice(lvl, d)}</li>
                ))}
                {!analysis.support.length ? (
                  <li className="text-subtle">—</li>
                ) : null}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium tracking-wide text-bear uppercase">
                Résistances
              </p>
              <ul className="space-y-1 font-mono text-sm tabular-nums">
                {analysis.resistance.map((lvl) => (
                  <li key={lvl}>{formatPrice(lvl, d)}</li>
                ))}
                {!analysis.resistance.length ? (
                  <li className="text-subtle">—</li>
                ) : null}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Taille de position</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="cap">Capital</Label>
                <Input
                  id="cap"
                  inputMode="decimal"
                  value={capital}
                  onChange={(e) => setCapital(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="risk">Risque %</Label>
                <Input
                  id="risk"
                  inputMode="decimal"
                  value={riskPct}
                  onChange={(e) => setRiskPct(e.target.value)}
                />
              </div>
            </div>
            <p className="font-mono text-sm tabular-nums">
              {size
                ? `≈ ${size.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} unités`
                : "Indiquez capital et risque"}
            </p>
            <p className="text-xs text-subtle">
              Calcul simple : risque $ / distance entrée–stop. Adaptez au lot de votre broker.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldAlert className="size-4 text-warn" />
              Risques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {analysis.risks.map((r) => (
                <li key={r} className="leading-snug">
                  {r}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-subtle">
              Lecture éducative. Vérifiez les niveaux sur votre plateforme avant d’engager du capital.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "muted",
}: {
  label: string;
  value: string;
  tone?: "bull" | "bear" | "muted";
}) {
  return (
    <div className="rounded-md bg-elevated px-3 py-2">
      <p className="text-[11px] tracking-wide text-subtle uppercase">{label}</p>
      <p
        className={cn(
          "mt-0.5 font-mono text-sm tabular-nums",
          tone === "bull" && "text-bull",
          tone === "bear" && "text-bear",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/80 py-2 last:border-0">
      <span className="text-xs text-muted-foreground">{k}</span>
      <span className="text-right font-mono text-sm tabular-nums">{v}</span>
    </div>
  );
}
