import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dropzone } from "@/components/analyzer/dropzone";
import { ResultPanel } from "@/components/analyzer/result-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { analyzeChart, getAiStatus } from "@/lib/analysis/server";
import { useQuery } from "@tanstack/react-query";
import type { AnalysisInput, Market, Session } from "@/lib/analysis/types";
import { MARKET_LABELS, SESSION_LABELS } from "@/lib/analysis/types";
import { fetchAsDataUrl, compressToDataUrl, makeThumbnail } from "@/lib/image";
import { SAMPLE_CHARTS } from "@/lib/samples";
import { useAppStore } from "@/lib/store";
import { cn, uid } from "@/lib/utils";

const MARKETS: (Market | "auto")[] = ["auto", "forex", "crypto", "commodity", "index"];
const SESSIONS: Session[] = ["any", "asia", "london", "newyork", "overlap"];
const RISKS = ["0.25%", "0.5%", "1%", "2%"];

export function AnalyzerWorkspace() {
  const pendingImage = useAppStore((s) => s.pendingImage);
  const pendingInput = useAppStore((s) => s.pendingInput);
  const setPending = useAppStore((s) => s.setPending);
  const addAnalysis = useAppStore((s) => s.addAnalysis);
  const analyses = useAppStore((s) => s.analyses);
  const activeId = useAppStore((s) => s.activeAnalysisId);
  const setActive = useAppStore((s) => s.setActiveAnalysis);

  const [image, setImage] = useState<string | null>(pendingImage);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [market, setMarket] = useState<Market | "auto">(pendingInput?.market ?? "auto");
  const [session, setSession] = useState<Session>(pendingInput?.session ?? "any");
  const [risk, setRisk] = useState(pendingInput?.risk ?? "0.5%");
  const [thesis, setThesis] = useState(pendingInput?.thesis ?? "");

  const active = analyses.find((a) => a.id === activeId);
  const { data: aiStatus } = useQuery({
    queryKey: ["ai-status"],
    queryFn: () => getAiStatus(),
    staleTime: 60_000,
  });

  useEffect(() => {
    if (pendingImage) {
      setImage(pendingImage);
      setPending(null);
    }
  }, [pendingImage, setPending]);

  async function loadFile(file: File) {
    try {
      const data = await compressToDataUrl(file);
      setImage(data);
      setError(null);
      setActive(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Image illisible");
    }
  }

  async function loadSample(id: string) {
    const sample = SAMPLE_CHARTS.find((s) => s.id === id);
    if (!sample) return;
    setBusy(true);
    setError(null);
    try {
      const data = await fetchAsDataUrl(sample.file);
      setImage(data);
      setMarket(sample.market);
      setSession(sample.session);
      setThesis(sample.thesis);
      setActive(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Exemple indisponible");
    } finally {
      setBusy(false);
    }
  }

  async function run() {
    if (!image) {
      toast.error("Ajoutez d’abord une capture");
      return;
    }
    const input: AnalysisInput = { market, session, risk, thesis: thesis.trim() || undefined };
    setBusy(true);
    setError(null);
    try {
      const res = await analyzeChart({ data: { imageDataUrl: image, input } });
      if (!res.ok) {
        setError(res.error);
        toast.error(res.error);
        return;
      }
      const thumb = await makeThumbnail(image);
      addAnalysis({
        id: uid(),
        createdAt: new Date().toISOString(),
        thumbnail: thumb,
        input,
        result: res.analysis,
      });
      toast.success("Plan de trade prêt");
    } catch {
      setError("Analyse interrompue");
      toast.error("Analyse interrompue");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 pb-28 md:pb-12">
      {aiStatus && !aiStatus.configured ? (
        <div className="rounded-xl border border-border bg-elevated/80 px-4 py-3 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Analyse IA en attente de configuration</p>
          <p className="mt-1 text-xs leading-relaxed">
            Ajoutez la variable d&apos;environnement serveur <code className="font-mono text-[11px]">XAI_API_KEY</code>{" "}
            (crédits xAI) pour activer la lecture des graphiques. Les marchés live, le journal et le
            dashboard fonctionnent déjà sans clé payante.
          </p>
        </div>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-wide text-accent uppercase">Analyzer</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            Capture, thèse, plan
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Envoyez un graphique TradingView, MT4/MT5 ou broker. Ngntrade lit la structure et
            renvoie biais, niveaux et un plan exécutable chez vous.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="space-y-4">
          {image ? (
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <img
                src={image}
                alt="Graphique à analyser"
                className="max-h-[420px] w-full object-contain bg-background"
              />
            </div>
          ) : (
            <Dropzone onFile={loadFile} busy={busy} />
          )}
          <div className="flex flex-wrap gap-2">
            {image ? (
              <>
                <Button onClick={run} disabled={busy}>
                  {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                  {busy ? "Lecture du graphique…" : "Obtenir le plan"}
                </Button>
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => {
                    setImage(null);
                    setActive(null);
                  }}
                >
                  Changer d’image
                </Button>
              </>
            ) : null}
          </div>
          {busy ? (
            <p className="text-sm text-accent shimmer-text">
              Lecture des bougies, niveaux et structure…
            </p>
          ) : null}
          {error ? <p className="text-sm text-bear">{error}</p> : null}
        </div>

        <Card>
          <CardContent className="space-y-4 p-5">
            <div className="space-y-1.5">
              <Label>Marché</Label>
              <div className="flex flex-wrap gap-1.5">
                {MARKETS.map((m) => (
                  <Chip key={m} active={market === m} onClick={() => setMarket(m)}>
                    {MARKET_LABELS[m]}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Session</Label>
              <div className="flex flex-wrap gap-1.5">
                {SESSIONS.map((s) => (
                  <Chip key={s} active={session === s} onClick={() => setSession(s)}>
                    {SESSION_LABELS[s]}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Risque</Label>
              <div className="flex flex-wrap gap-1.5">
                {RISKS.map((r) => (
                  <Chip key={r} active={risk === r} onClick={() => setRisk(r)}>
                    {r}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="thesis">Votre lecture (optionnel)</Label>
              <Textarea
                id="thesis"
                value={thesis}
                onChange={(e) => setThesis(e.target.value)}
                placeholder="Thèse, niveaux que vous suivez, ce que vous voulez valider…"
                maxLength={500}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <section>
        <h2 className="font-display text-lg font-semibold">Pas de capture sous la main</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Quatre exemples — un par classe d’actifs — pour tester le moteur.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SAMPLE_CHARTS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => void loadSample(s.id)}
              className="group overflow-hidden rounded-xl border border-border bg-card text-left transition-colors duration-quick ease-smooth hover:border-accent/50"
            >
              <img
                src={s.file}
                alt={s.symbol}
                className="h-28 w-full object-cover opacity-90 group-hover:opacity-100"
              />
              <div className="p-3">
                <p className="font-mono text-sm">{s.symbol}</p>
                <p className="text-xs text-muted-foreground">
                  {s.timeframe} · {s.title}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {active ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold">Plan reçu</h2>
            <Badge>{new Date(active.createdAt).toLocaleString("fr-FR")}</Badge>
          </div>
          <ResultPanel analysis={active.result} analysisId={active.id} />
        </section>
      ) : null}

      {analyses.length ? (
        <section>
          <h2 className="font-display text-lg font-semibold">Historique</h2>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
            {analyses.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setActive(a.id)}
                className={cn(
                  "w-40 shrink-0 overflow-hidden rounded-lg border text-left transition-colors duration-quick",
                  a.id === activeId ? "border-accent" : "border-border",
                )}
              >
                <img src={a.thumbnail} alt="" className="h-20 w-full object-cover" />
                <div className="p-2">
                  <p className="font-mono text-xs">{a.result.symbol}</p>
                  <p className="text-[11px] text-muted-foreground">{a.result.timeframe}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 rounded-full px-3 text-xs font-medium transition-colors duration-quick",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-elevated text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
