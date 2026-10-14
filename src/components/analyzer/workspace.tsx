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

  const [images, setImages] = useState<{
    h1: string | null;
    m15: string | null;
    m5: string | null;
  }>({ h1: pendingImage, m15: null, m5: null });
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
      setImages((prev) => ({ ...prev, h1: pendingImage }));
      setPending(null);
    }
  }, [pendingImage, setPending]);

  async function loadSlot(slot: "h1" | "m15" | "m5", file: File) {
    try {
      const data = await compressToDataUrl(file);
      setImages((prev) => ({ ...prev, [slot]: data }));
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
      setImages({ h1: data, m15: null, m5: null });
      setMarket(sample.market);
      setSession(sample.session);
      setThesis(sample.thesis);
      setActive(null);
      toast.message("Exemple chargé sur H1 — ajoute M15 et M5 du même actif pour le multi-TF");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Exemple indisponible");
    } finally {
      setBusy(false);
    }
  }

  async function run() {
    const count = [images.h1, images.m15, images.m5].filter(Boolean).length;
    if (count === 0) {
      toast.error("Ajoutez au moins une capture (idéal : H1 + M15 + M5)");
      return;
    }
    if (count < 3) {
      toast.message("Conseil : 3 TF (H1, M15, M5) améliorent le limit et le SL 1 ATR");
    }
    const input: AnalysisInput = {
      market,
      session,
      risk,
      thesis: thesis.trim() || undefined,
    };
    setBusy(true);
    setError(null);
    try {
      const res = await analyzeChart({
        data: {
          images: {
            h1: images.h1 ?? undefined,
            m15: images.m15 ?? undefined,
            m5: images.m5 ?? undefined,
          },
          imageDataUrl: images.h1 ?? images.m15 ?? images.m5 ?? undefined,
          input,
        },
      });
      if (!res.ok) {
        setError(res.error);
        toast.error(res.error);
        return;
      }
      const primary = images.m15 ?? images.h1 ?? images.m5!;
      const thumb = await makeThumbnail(primary);
      addAnalysis({
        id: uid(),
        createdAt: new Date().toISOString(),
        thumbnail: thumb,
        input,
        result: res.analysis,
      });
      toast.success(
        count >= 3 ? "Plan multi-TF prêt (limit + SL ~1 ATR)" : "Plan de trade prêt",
      );
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
            Ajoutez sur Vercel la variable serveur{" "}
            <code className="font-mono text-[11px]">ANTHROPIC_API_KEY</code> (Claude) ou{" "}
            <code className="font-mono text-[11px]">XAI_API_KEY</code> pour activer la lecture des
            graphiques. Les marchés, le journal et le dashboard fonctionnent déjà sans clé IA.
          </p>
        </div>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-kicker">Analyzer</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
            Capture, thèse, plan
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Envoie le même actif en H1, M15 et M5 pour un limit plus fiable et un
            stop calé sur ~1 ATR. Une seule image reste possible, le multi-TF est
            recommandé.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-border/70 bg-card/50 px-4 py-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Multi-timeframe (recommandé)</p>
            <p className="mt-1 text-xs leading-relaxed">
              Même actif sur <strong className="text-foreground/90">H1</strong> (biais),{" "}
              <strong className="text-foreground/90">M15</strong> (zone) et{" "}
              <strong className="text-foreground/90">M5</strong> (limit précis). Le stop vise{" "}
              <strong className="text-foreground/90">~1 ATR</strong> du TF d’exécution.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {(
              [
                { key: "h1" as const, title: "H1", hint: "Biais structurel" },
                { key: "m15" as const, title: "M15", hint: "Zone d’entrée" },
                { key: "m5" as const, title: "M5", hint: "Limit sniper" },
              ] as const
            ).map((slot) => {
              const src = images[slot.key];
              return (
                <div key={slot.key} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold tracking-wide text-accent uppercase">
                      {slot.title}
                    </p>
                    <p className="text-[11px] text-subtle">{slot.hint}</p>
                  </div>
                  {src ? (
                    <div className="relative overflow-hidden rounded-xl border border-border/80 bg-card">
                      <img
                        src={src}
                        alt={`Graphique ${slot.title}`}
                        className="h-36 w-full object-contain bg-background sm:h-40"
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 rounded-md border border-border bg-card/95 px-2 py-1 text-[11px] font-medium hover:bg-elevated"
                        disabled={busy}
                        onClick={() =>
                          setImages((prev) => ({ ...prev, [slot.key]: null }))
                        }
                      >
                        Retirer
                      </button>
                    </div>
                  ) : (
                    <Dropzone
                      compact
                      busy={busy}
                      label={slot.title}
                      hint={slot.hint}
                      onFile={(file) => void loadSlot(slot.key, file)}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2">
            {[images.h1, images.m15, images.m5].some(Boolean) ? (
              <>
                <Button onClick={() => void run()} disabled={busy}>
                  {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                  {busy
                    ? "Lecture multi-TF…"
                    : [images.h1, images.m15, images.m5].filter(Boolean).length >= 3
                      ? "Obtenir le plan multi-TF"
                      : "Obtenir le plan"}
                </Button>
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => {
                    setImages({ h1: null, m15: null, m5: null });
                    setActive(null);
                  }}
                >
                  Tout effacer
                </Button>
              </>
            ) : null}
          </div>
          {busy ? (
            <p className="text-sm text-accent shimmer-text">
              Confluence H1 → M15 → M5, limit et SL ~1 ATR…
            </p>
          ) : null}
          {error ? <p className="text-sm text-bear">{error}</p> : null}
        </div>

        <Card className="border-border/80 bg-card/90 shadow-sm">
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
        "h-9 rounded-full px-3 text-xs font-medium transition-colors",
        active
          ? "nav-pill-active"
          : "bg-elevated/80 text-muted-foreground hover:bg-elevated hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
