import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Crosshair,
  Layers,
  LayoutDashboard,
  MessageSquare,
  ScanSearch,
  Shield,
  Sparkles,
  Target,
} from "lucide-react";
import { Dropzone } from "@/components/analyzer/dropzone";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { compressToDataUrl } from "@/lib/image";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import { MarketTicker } from "@/components/markets/ticker";

export const Route = createFileRoute("/")({ component: Home });

const STEPS = [
  {
    n: "01",
    title: "Capturez H1 · M15 · M5",
    body: "Même actif sur trois timeframes pour une confluence claire.",
  },
  {
    n: "02",
    title: "Déposez et précisez",
    body: "Thèse, risque, session — optionnel, pour cadrer la lecture.",
  },
  {
    n: "03",
    title: "Plan + limit sniper",
    body: "Biais, niveaux, prix limit, stop ~1 ATR et cibles structurées.",
  },
  {
    n: "04",
    title: "Exécutez chez vous",
    body: "Taille et ordres restent sous votre contrôle, chez votre broker.",
  },
];

const FEATURES = [
  {
    icon: Layers,
    title: "Multi-timeframe",
    body: "H1 pour le biais, M15 pour la zone, M5 pour le limit précis.",
  },
  {
    icon: Crosshair,
    title: "Entrée sniper",
    body: "Un prix limit unique, justifié par la structure visible.",
  },
  {
    icon: Target,
    title: "Stop ~1 ATR",
    body: "Distance de risque calée sur la volatilité du TF d’exécution.",
  },
  {
    icon: ScanSearch,
    title: "Score de capture",
    body: "Lisibilité de l’image notée — pas un winrate inventé.",
  },
  {
    icon: MessageSquare,
    title: "Copilote de session",
    body: "Questionnez le plan et restez ancré à vos règles.",
  },
  {
    icon: BookOpen,
    title: "Journal & performance",
    body: "Importez un setup, suivez ce qui paie et ce qui coûte.",
  },
];

const QUOTES = [
  {
    name: "Amira K.",
    role: "Forex · Londres",
    body: "Le plan est lisible en trente secondes. Je vérifie les niveaux sur MT5, je taille, j’exécute.",
  },
  {
    name: "Leo M.",
    role: "Crypto · swing",
    body: "Plus utile qu’un signal Telegram. L’invalidation m’empêche de bouger le stop.",
  },
  {
    name: "Nadia R.",
    role: "Indices · cash open",
    body: "Le copilote challenge ma thèse avant le open NY. Moins de FOMO, plus de R:R tenus.",
  },
];

function Home() {
  const navigate = useNavigate();
  const setPending = useAppStore((s) => s.setPending);

  async function onFile(file: File) {
    try {
      const data = await compressToDataUrl(file);
      setPending(data);
      void navigate({ to: "/analyzer" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Image illisible");
    }
  }

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="pointer-events-none absolute inset-0 hero-mesh" />
        <div className="pointer-events-none absolute inset-0 hero-grid opacity-[0.35]" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-2 md:items-center md:gap-14 md:py-24 lg:py-28">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[11px] font-medium tracking-[0.12em] text-muted-foreground backdrop-blur-md">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-bull opacity-40" />
                <span className="relative inline-flex size-2 rounded-full bg-bull shadow-[0_0_8px_var(--color-bull)]" />
              </span>
              FOREX · CRYPTO · MATIÈRES · INDICES
            </div>

            <h1 className="mt-7 font-display text-[2.6rem] font-semibold tracking-[-0.03em] sm:text-5xl md:text-[3.5rem] md:leading-[1.05]">
              L’IA qui lit vos{" "}
              <span className="bg-gradient-to-r from-[#9ec9ff] via-[#c8e2ff] to-[#5eead4] bg-clip-text text-transparent">
                graphiques
              </span>
              .
            </h1>

            <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-muted-foreground">
              Multi-TF, entrée{" "}
              <strong className="font-medium text-foreground/90">limit sniper</strong>,
              stop{" "}
              <strong className="font-medium text-foreground/90">~1 ATR</strong>.
              Un plan clair — vous gardez l’exécution.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 px-6 text-[15px] shadow-[0_0_32px_-8px_color-mix(in_oklab,var(--color-accent)_55%,transparent)]">
                <Link to="/analyzer">
                  Ouvrir l’analyzer
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 border-white/15 bg-white/[0.03] px-6 text-[15px] backdrop-blur-sm hover:bg-white/[0.06]">
                <Link to="/markets">Marchés live</Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-medium text-muted-foreground">
                <Layers className="size-3 text-accent" />
                H1 · M15 · M5
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-medium text-muted-foreground">
                <Crosshair className="size-3 text-accent" />
                Limit sniper
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-medium text-muted-foreground">
                <Sparkles className="size-3 text-accent" />
                Pack MT5
              </span>
            </div>

            <p className="mt-6 text-xs text-subtle">
              Lecture éducative. Pas un conseil d’investissement.
            </p>
          </div>

          <div className="animate-fade-up relative space-y-4 [animation-delay:90ms]">
            <div className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-accent/20 via-transparent to-bull/10 blur-2xl" />
            <div className="relative rounded-[1.35rem] border border-white/10 bg-card/80 p-1.5 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.95)] backdrop-blur-xl">
              <div className="rounded-[1.1rem] border border-dashed border-white/10 bg-elevated/20 p-4">
                <Dropzone onFile={onFile} />
              </div>
            </div>
            <MockPlan />
            <p className="text-center text-[11px] tracking-wide text-subtle">
              TradingView · MetaTrader · cTrader — axes visibles
            </p>
          </div>
        </div>

        <div className="relative border-t border-white/5 bg-black/20 backdrop-blur-md">
          <div className="mx-auto max-w-6xl px-4 py-3.5">
            <MarketTicker />
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-b border-border/40">
        <div className="mx-auto grid max-w-6xl gap-px bg-border/40 sm:grid-cols-3">
          <Stat k="4 classes d’actifs" v="FX, crypto, or, indices" />
          <Stat k="Plan actionnable" v="Zone, sniper, SL ~1 ATR, TP" />
          <Stat k="Vous gardez la main" v="Exécution chez votre broker" />
        </div>
      </section>

      {/* Steps */}
      <section className="border-b border-border/40">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-24">
          <p className="section-kicker">Parcours</p>
          <h2 className="mt-3 max-w-lg font-display text-3xl font-semibold tracking-tight sm:text-[2.1rem]">
            De la capture au plan exécutable
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Quatre étapes. Pas de signal aveugle — une lecture structurée à
            valider avant le capital.
          </p>
          <div className="relative mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="pointer-events-none absolute top-9 right-6 left-6 hidden h-px bg-gradient-to-r from-accent/50 via-border to-transparent lg:block" />
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="card-lift group relative rounded-2xl border border-white/8 bg-card/70 p-6 backdrop-blur-sm"
              >
                <span className="inline-flex size-9 items-center justify-center rounded-full border border-accent/25 bg-accent/10 font-mono text-xs font-semibold text-accent shadow-[0_0_20px_-6px_var(--color-accent)]">
                  {s.n}
                </span>
                <h3 className="mt-5 font-display text-base font-semibold tracking-tight">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-border/40">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-24">
          <p className="section-kicker">Produit</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-[2.1rem]">
            Tout pour structurer une session
          </h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="card-lift group rounded-2xl border border-white/8 bg-gradient-to-b from-card/90 to-card/50 p-6"
              >
                <div className="inline-flex size-12 items-center justify-center rounded-xl border border-white/10 bg-elevated/60 transition-all duration-fast group-hover:border-accent/35 group-hover:bg-accent/10 group-hover:shadow-[0_0_24px_-8px_var(--color-accent)]">
                  <f.icon className="size-5 text-accent" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold tracking-tight">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quotes */}
      <section className="border-b border-border/40 bg-card/15">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-24">
          <p className="section-kicker">Traders</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-[2.1rem]">
            Un second regard, pas un gourou
          </h2>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {QUOTES.map((q) => (
              <blockquote
                key={q.name}
                className="card-lift flex flex-col rounded-2xl border border-white/8 bg-card/80 p-6"
              >
                <p className="flex-1 text-[15px] leading-relaxed text-foreground/90">
                  “{q.body}”
                </p>
                <footer className="mt-6 border-t border-white/8 pt-4">
                  <p className="text-sm font-medium">{q.name}</p>
                  <p className="text-xs text-subtle">{q.role}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 hero-mesh opacity-70" />
        <div className="pointer-events-none absolute inset-0 hero-grid opacity-20" />
        <div className="relative mx-auto max-w-3xl px-4 py-20 text-center md:py-28">
          <p className="section-kicker">Commencer</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-[2.25rem]">
            Envoyez votre prochain graphique
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Gratuit pour démarrer. Premium et affiliations optionnels quand vous
            êtes prêt.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="h-12 px-6 shadow-[0_0_32px_-8px_color-mix(in_oklab,var(--color-accent)_50%,transparent)]">
              <Link to="/analyzer">
                Analyser un graphique
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 border-white/15 bg-white/[0.03] px-6">
              <Link to="/offre">Voir l’offre</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="bg-background/90 px-6 py-8 text-center sm:text-left">
      <p className="font-display text-lg font-semibold tracking-tight">{k}</p>
      <p className="mt-1.5 text-sm text-muted-foreground">{v}</p>
    </div>
  );
}

function MockPlan() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-card/90 p-5 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)] backdrop-blur-md">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.14em] text-subtle uppercase">
            Exemple de plan
          </p>
          <p className="mt-1.5 font-mono text-sm font-medium tracking-tight">
            EURUSD · H1
          </p>
        </div>
        <Badge variant="bull" className="shrink-0">
          Haussier
        </Badge>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-white/8 bg-elevated/50 px-3 py-2.5">
          <p className="text-[10px] tracking-wide text-subtle uppercase">Entrée</p>
          <p className="mt-0.5 font-mono text-xs tabular-nums">1.1742–1.1758</p>
        </div>
        <div className="rounded-xl border border-white/8 bg-elevated/50 px-3 py-2.5">
          <p className="text-[10px] tracking-wide text-subtle uppercase">Stop</p>
          <p className="mt-0.5 font-mono text-xs text-bear tabular-nums">1.1718</p>
        </div>
        <div className="rounded-xl border border-white/8 bg-elevated/50 px-3 py-2.5">
          <p className="text-[10px] tracking-wide text-subtle uppercase">R:R</p>
          <p className="mt-0.5 font-mono text-xs text-bull tabular-nums">2.14</p>
        </div>
      </div>
    </div>
  );
}
