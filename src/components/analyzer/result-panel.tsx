import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Check,
  CircleHelp,
  Copy,
  Info,
  MessageSquare,
  Minus,
  Plus,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AnnotatedChart } from "@/components/analyzer/annotated-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import {
  BIAS_LABELS,
  DIRECTION_LABELS,
  MARKET_LABELS,
  ZONE_LABELS,
  type ChartAnalysis,
  type Grade,
  type Market,
} from "@/lib/analysis/types";
import { useAppStore } from "@/lib/store";
import { cn, formatPrice } from "@/lib/utils";

const GRADE_META: Record<Grade, { label: string; tone: string; hint: string }> = {
  A: {
    label: "A",
    tone: "border-bull/50 bg-bull/10 text-bull",
    hint: "Setup solide : confluence élevée, R:R valide, plan cohérent.",
  },
  B: {
    label: "B",
    tone: "border-accent/50 bg-accent/10 text-accent",
    hint: "Setup correct : attendez la confirmation avant d'entrer.",
  },
  C: {
    label: "C",
    tone: "border-warn/50 bg-warn/10 text-warn",
    hint: "Setup fragile ou incohérent : à éviter ou à retravailler.",
  },
  none: {
    label: "—",
    tone: "border-border bg-elevated text-muted-foreground",
    hint: "Pas de trade pour l'instant : patience.",
  },
};

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
  image,
}: {
  analysis: ChartAnalysis;
  analysisId?: string;
  image?: string;
}) {
  const addTrade = useAppStore((s) => s.addTrade);
  const [capital, setCapital] = useState("10000");
  const [riskPct, setRiskPct] = useState("0.5");
  const s = analysis.setup;
  const dir = s.direction;
  const entry = s.sniperEntry || (s.entryMin + s.entryMax) / 2;
  const d = decimalsFor(analysis.symbol, analysis.currentPrice || entry);
  const grade: Grade = analysis.grade ?? (dir === "wait" ? "none" : "B");
  const gm = GRADE_META[grade];
  const rrs = analysis.rrs ?? [];
  const BiasIcon =
    analysis.bias === "bullish" ? TrendingUp : analysis.bias === "bearish" ? TrendingDown : Minus;

  const size = useMemo(() => {
    const cap = Number(capital);
    const rp = Number(riskPct);
    if (!cap || !rp || !entry || !s.stopLoss || entry === s.stopLoss) return null;
    return (cap * (rp / 100)) / Math.abs(entry - s.stopLoss);
  }, [capital, riskPct, entry, s.stopLoss]);

  const planText = [
    `${analysis.symbol} ${analysis.timeframe} — ${DIRECTION_LABELS[dir]} (${BIAS_LABELS[analysis.bias]}) · setup ${gm.label}`,
    `Entrée limit ${formatPrice(entry, d)} (zone ${formatPrice(s.entryMin, d)} – ${formatPrice(s.entryMax, d)})`,
    `Stop ${formatPrice(s.stopLoss, d)}`,
    ...s.takeProfits.map(
      (p, i) => `TP${i + 1} ${formatPrice(p, d)}${rrs[i] ? ` (${rrs[i].toFixed(2)}R)` : ""}`,
    ),
    `Invalidation : ${s.invalidation}`,
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
      entry,
      stopLoss: s.stopLoss,
      takeProfit: s.takeProfits[0] ?? s.entryMax,
      size: size ?? 1,
      status: "open",
      pnl: 0,
      notes: analysis.rationale.slice(0, 280),
      analysisId,
    });
    toast.success("Setup ajouté au journal");
  }

  const iq = analysis.imageQuality;
  const score = analysis.confluenceScore;
  const checklist = analysis.confluence ?? [];

  return (
    <div className="space-y-4">
      {/* Verdict */}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
          <div
            className={cn(
              "flex size-20 shrink-0 flex-col items-center justify-center rounded-2xl border-2 font-display",
              gm.tone,
            )}
            aria-label={`Qualité du setup : ${gm.label}`}
          >
            <span className="text-4xl leading-none font-semibold">{gm.label}</span>
            <span className="mt-1 text-[10px] tracking-wide opacity-80">
              {grade === "none" ? "attendre" : "setup"}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">
              {MARKET_LABELS[analysis.market]} · {analysis.timeframe}
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <h3 className="font-mono text-2xl font-semibold tracking-tight">{analysis.symbol}</h3>
              <Badge variant={analysis.bias === "bullish" ? "bull" : analysis.bias === "bearish" ? "bear" : "default"}>
                <BiasIcon className="mr-1 size-3" />
                {BIAS_LABELS[analysis.bias]}
              </Badge>
              <Badge variant={dir === "long" ? "bull" : dir === "short" ? "bear" : "default"}>
                {DIRECTION_LABELS[dir]}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{gm.hint}</p>
            {dir === "wait" && analysis.noTradeReason ? (
              <p className="mt-1 text-sm text-foreground/90">{analysis.noTradeReason}</p>
            ) : null}
          </div>
          {score != null ? (
            <div className="w-full sm:w-44">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">Confluence</span>
                <span className="font-mono text-lg font-semibold tabular-nums">{score}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-elevated">
                <div
                  className={cn("h-full rounded-full", score >= 75 ? "bg-bull" : score >= 55 ? "bg-accent" : "bg-warn")}
                  style={{ width: `${score}%` }}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-subtle">
                Calculée par l'app sur {checklist.length} critères, pas estimée par l'IA.
              </p>
            </div>
          ) : null}
        </div>
        {analysis.warnings?.length ? (
          <ul className="space-y-1.5 border-t border-border bg-elevated/30 px-5 py-3">
            {analysis.warnings.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                {w.level === "error" ? (
                  <X className="mt-0.5 size-4 shrink-0 text-bear" />
                ) : w.level === "warn" ? (
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warn" />
                ) : (
                  <Info className="mt-0.5 size-4 shrink-0 text-accent" />
                )}
                <span className="text-muted-foreground">{w.text}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </Card>

      {image ? <AnnotatedChart src={image} analysis={analysis} decimals={d} /> : null}

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          {/* Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Plan de trade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <PlanRow tone="accent" k="Entrée limit" v={formatPrice(entry, d)} sub={`Zone ${formatPrice(s.entryMin, d)} – ${formatPrice(s.entryMax, d)}`} />
              {s.sniperReason ? <p className="pb-2 text-sm text-muted-foreground">{s.sniperReason}</p> : null}
              <PlanRow tone="bear" k="Stop loss" v={formatPrice(s.stopLoss, d)} sub={analysis.atr ? `ATR ≈ ${formatPrice(analysis.atr, d)}` : undefined} />
              {s.takeProfits.map((tp, i) => (
                <PlanRow
                  key={i}
                  tone="bull"
                  k={`Take profit ${i + 1}`}
                  v={formatPrice(tp, d)}
                  sub={rrs[i] ? `${rrs[i].toFixed(2)} R` : undefined}
                />
              ))}
              <div className="border-t border-border/80 pt-3">
                <p className="text-xs text-muted-foreground">Invalidation</p>
                <p className="mt-0.5 text-sm">{s.invalidation}</p>
              </div>
              <div className="flex flex-wrap gap-2 pt-3">
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

          {/* Scénarios */}
          {analysis.scenarios?.length ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Scénarios</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {analysis.scenarios.map((sc, i) => (
                  <div key={i} className="rounded-xl border border-border bg-elevated/40 p-3.5">
                    <p className={cn("text-xs font-semibold", sc.name === "principal" ? "text-accent" : "text-warn")}>
                      {sc.name === "principal" ? "Principal" : "Alternatif"}
                    </p>
                    <p className="mt-1.5 text-sm">{sc.trigger}</p>
                    {sc.target ? <p className="mt-1.5 text-xs text-muted-foreground">Objectif : {sc.target}</p> : null}
                    {sc.invalidation ? (
                      <p className="mt-1 text-xs text-muted-foreground">Invalidé si : {sc.invalidation}</p>
                    ) : null}
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {/* Lecture */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lecture du marché</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{analysis.trend}</p>
              {analysis.structure?.length ? (
                <ul className="space-y-2">
                  {analysis.structure.map((t, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="mt-0.5 w-10 shrink-0 font-mono text-xs font-semibold text-accent">{t.tf}</span>
                      <span
                        className={cn(
                          "mt-0.5 w-16 shrink-0 text-xs font-medium",
                          t.bias === "bullish" ? "text-bull" : t.bias === "bearish" ? "text-bear" : "text-muted-foreground",
                        )}
                      >
                        {BIAS_LABELS[t.bias]}
                      </span>
                      <span className="text-muted-foreground">{t.note}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="text-sm leading-relaxed text-foreground/90">{analysis.rationale}</p>
              {analysis.sessionNotes ? <p className="text-sm text-muted-foreground">{analysis.sessionNotes}</p> : null}
              {analysis.patterns.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {analysis.patterns.map((p) => (
                    <Badge key={p}>{p}</Badge>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {/* Checklist */}
          {checklist.length ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Checklist de confluence</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-border/70">
                  {checklist.map((c, i) => (
                    <li key={i} className="flex items-start gap-3 py-2.5">
                      <span
                        className={cn(
                          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                          c.status === "pass" && "bg-bull/20 text-bull",
                          c.status === "fail" && "bg-bear/20 text-bear",
                          c.status === "unknown" && "bg-elevated text-subtle",
                        )}
                      >
                        {c.status === "pass" ? (
                          <Check className="size-3" />
                        ) : c.status === "fail" ? (
                          <X className="size-3" />
                        ) : (
                          <CircleHelp className="size-3" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{c.label}</p>
                        {c.note ? <p className="text-xs text-muted-foreground">{c.note}</p> : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}

          {/* Zones & niveaux */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Zones et niveaux</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.zones?.length ? (
                <ul className="space-y-2">
                  {analysis.zones.map((z, i) => (
                    <li key={i} className="flex items-baseline justify-between gap-3 text-sm">
                      <span>
                        <span className="text-foreground">{ZONE_LABELS[z.kind]}</span>
                        {z.tf ? <span className="ml-1.5 text-xs text-subtle">{z.tf}</span> : null}
                      </span>
                      <span className="font-mono text-xs tabular-nums text-muted-foreground">
                        {formatPrice(z.low, d)} – {formatPrice(z.high, d)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="grid grid-cols-2 gap-4">
                <LevelList title="Supports" tone="text-bull" levels={analysis.support} d={d} />
                <LevelList title="Résistances" tone="text-bear" levels={analysis.resistance} d={d} />
              </div>
            </CardContent>
          </Card>

          {/* Taille */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Taille de position</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cap">Capital</Label>
                  <Input id="cap" inputMode="decimal" value={capital} onChange={(e) => setCapital(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="risk">Risque %</Label>
                  <Input id="risk" inputMode="decimal" value={riskPct} onChange={(e) => setRiskPct(e.target.value)} />
                </div>
              </div>
              <p className="font-mono text-sm tabular-nums">
                {size ? `≈ ${size.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} unités` : "Indiquez capital et risque"}
              </p>
              <p className="text-xs text-subtle">Risque en devise ÷ distance entrée–stop. Adaptez au lot de votre broker.</p>
            </CardContent>
          </Card>

          {/* Risques + manques */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldAlert className="size-4 text-warn" />
                Risques et angles morts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-sm text-muted-foreground">
                {analysis.risks.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
              {analysis.missing?.length ? (
                <div>
                  <p className="text-xs font-medium text-foreground">Pour fiabiliser l'analyse, ajoutez :</p>
                  <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                    {analysis.missing.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {iq ? (
                <p className="border-t border-border/70 pt-3 text-xs text-subtle">
                  Lisibilité de la capture : {Math.round(iq.score)}/100
                  {iq.notes ? ` — ${iq.notes}` : ""}
                </p>
              ) : null}
              <p className="text-xs text-subtle">
                Lecture éducative. Vérifiez les niveaux sur votre plateforme avant d’engager du capital.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PlanRow({
  k,
  v,
  sub,
  tone,
}: {
  k: string;
  v: string;
  sub?: string;
  tone: "accent" | "bear" | "bull";
}) {
  const bar = tone === "accent" ? "bg-warn" : tone === "bear" ? "bg-bear" : "bg-bull";
  return (
    <div className="flex items-center gap-3 border-b border-border/70 py-2.5 last:border-0">
      <span className={cn("h-8 w-1 rounded-full", bar)} />
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{k}</p>
        {sub ? <p className="text-[11px] text-subtle">{sub}</p> : null}
      </div>
      <span className="font-mono text-base font-semibold tabular-nums">{v}</span>
    </div>
  );
}

function LevelList({ title, tone, levels, d }: { title: string; tone: string; levels: number[]; d: number }) {
  return (
    <div>
      <p className={cn("mb-2 text-xs font-medium", tone)}>{title}</p>
      <ul className="space-y-1 font-mono text-sm tabular-nums">
        {levels.map((l) => (
          <li key={l}>{formatPrice(l, d)}</li>
        ))}
        {!levels.length ? <li className="text-subtle">—</li> : null}
      </ul>
    </div>
  );
}
