import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Crosshair,
  LayoutDashboard,
  MessageSquare,
  ScanSearch,
  Shield,
  Sparkles,
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
    title: "Capturez le graphique",
    body: "Symbole, timeframe, niveaux et indicateurs dans une seule image nette.",
  },
  {
    n: "02",
    title: "Déposez et précisez",
    body: "Thèse, risque, session — optionnel mais utile pour cadrer la lecture.",
  },
  {
    n: "03",
    title: "Plan + entrée sniper",
    body: "Biais, niveaux, zone, prix chirurgical, stop structurel et cibles.",
  },
  {
    n: "04",
    title: "Exécutez chez vous",
    body: "Taille et ordres restent sous votre contrôle, chez votre broker.",
  },
];

const FEATURES = [
  {
    icon: ScanSearch,
    title: "Lecture IA du graphique",
    body: "Structure, VWAP, profil de volume — plan rédigé en français.",
  },
  {
    icon: Crosshair,
    title: "Entrée sniper",
    body: "Un prix limit précis dans la zone, avec la raison du niveau.",
  },
  {
    icon: MessageSquare,
    title: "Copilote de session",
    body: "Questionnez le plan, challengez une idée, restez ancré à vos règles.",
  },
  {
    icon: BookOpen,
    title: "Journal de trades",
    body: "Importez un setup depuis l’analyse. Moins de recopies à la main.",
  },
  {
    icon: LayoutDashboard,
    title: "Performance",
    body: "PnL, séries, résultats jour par jour. Ce qui paie, ce qui coûte.",
  },
  {
    icon: Shield,
    title: "Qualité de capture",
    body: "Score de lisibilité de l’image — pas un winrate magique.",
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
    body: "Plus utile qu’un signal Telegram. La zone d’invalidation m’empêche de bouger le stop.",
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
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="pointer-events-none absolute inset-0 hero-mesh" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1.5 text-[11px] font-medium tracking-wide text-muted-foreground backdrop-blur-sm">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-bull opacity-40" />
                <span className="relative inline-flex size-2 rounded-full bg-bull" />
              </span>
              FOREX · CRYPTO · MATIÈRES · INDICES
            </div>
            <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight sm:text-5xl md:text-[3.4rem] md:leading-[1.06]">
              L’IA qui lit vos{" "}
              <span className="bg-gradient-to-r from-accent via-[#b8d9ff] to-bull bg-clip-text text-transparent">
                graphiques
              </span>
              .
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
              Déposez une capture. Recevez biais, niveaux,{" "}
              <strong className="font-medium text-foreground/90">entrée sniper</strong>,
              stop structurel et cibles — plus un score de qualité de l’image.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/analyzer">
                  Ouvrir l’analyzer
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/markets">Marchés live</Link>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge variant="outline" className="border-border/70 font-normal">
                <Crosshair className="mr-1 size-3 text-accent" />
                Sniper
              </Badge>
              <Badge variant="outline" className="border-border/70 font-normal">
                <ScanSearch className="mr-1 size-3 text-accent" />
                Score capture
              </Badge>
              <Badge variant="outline" className="border-border/70 font-normal">
                <Sparkles className="mr-1 size-3 text-accent" />
                EA MT5 Premium
              </Badge>
            </div>
            <p className="mt-5 text-xs text-subtle">
              Lecture éducative. Pas un conseil d’investissement.
            </p>
          </div>

          <div className="animate-fade-up space-y-4 [animation-delay:80ms]">
            <div className="rounded-2xl border border-border/70 bg-card/70 p-1.5 shadow-[0_32px_100px_-40px_rgba(0,0,0,0.95)] backdrop-blur-sm">
              <div className="rounded-xl border border-dashed border-border/70 bg-elevated/25 p-4">
                <Dropzone onFile={onFile} />
              </div>
            </div>
            <MockPlan />
            <p className="text-center text-[11px] text-subtle">
              TradingView, MetaTrader, cTrader — capture nette, axes visibles.
            </p>
          </div>
        </div>

        <div className="relative border-t border-border/40 bg-card/30 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-4 py-3.5">
            <MarketTicker />
          </div>
        </div>
      </section>

      {/* Proofs */}
      <section className="border-b border-border/50">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:grid-cols-3">
          <Proof k="4 classes d’actifs" v="FX, crypto, or, indices" />
          <Proof k="Plan actionnable" v="Zone, sniper, SL, TP, R:R" />
          <Proof k="Vous gardez la main" v="Exécution chez votre broker" />
        </div>
      </section>

      {/* Steps */}
      <section className="border-b border-border/50">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <p className="section-kicker">Parcours</p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            De la capture au plan
          </h2>
          <p className="mt-2 max-w-lg text-sm text-muted-foreground">
            Quatre étapes. Pas de signal aveugle — une lecture structurée à
            valider.
          </p>
          <div className="relative mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="pointer-events-none absolute top-8 right-4 left-4 hidden h-px step-line lg:block" />
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="card-lift relative rounded-2xl border border-border/80 bg-card/85 p-5"
              >
                <span className="inline-flex size-8 items-center justify-center rounded-full border border-accent/30 bg-accent/10 font-mono text-xs font-semibold text-accent">
                  {s.n}
                </span>
                <h3 className="mt-4 font-display text-base font-semibold">
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
      <section className="border-b border-border/50">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <p className="section-kicker">Produit</p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Tout pour structurer une session
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="card-lift group rounded-2xl border border-border/80 bg-card/85 p-5"
              >
                <div className="inline-flex size-11 items-center justify-center rounded-xl border border-border/80 bg-elevated/50 transition-colors group-hover:border-accent/30 group-hover:bg-accent/10">
                  <f.icon className="size-5 text-accent" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">
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
      <section className="border-b border-border/50 bg-card/20">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <p className="section-kicker">Traders</p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Un second regard, pas un gourou
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {QUOTES.map((q) => (
              <blockquote
                key={q.name}
                className="card-lift rounded-2xl border border-border/80 bg-card/90 p-6"
              >
                <p className="text-sm leading-relaxed text-foreground/90">
                  “{q.body}”
                </p>
                <footer className="mt-5 border-t border-border/50 pt-4">
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
        <div className="pointer-events-none absolute inset-0 hero-mesh opacity-60" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 text-center md:py-20">
          <p className="section-kicker">Commencer</p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Envoyez votre prochain graphique
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Gratuit pour démarrer. Premium et affiliations optionnels quand vous
            êtes prêt.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/analyzer">
                Analyser un graphique
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/premium">Voir Premium</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

function Proof({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/40 px-5 py-4 text-center sm:text-left">
      <p className="font-display text-lg font-semibold tracking-tight">{k}</p>
      <p className="mt-1 text-sm text-muted-foreground">{v}</p>
    </div>
  );
}

function MockPlan() {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/90 p-4 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-wider text-subtle uppercase">
            Exemple de plan
          </p>
          <p className="mt-1 font-mono text-sm font-medium">EURUSD · H1</p>
        </div>
        <Badge variant="bull" className="shrink-0">
          Haussier
        </Badge>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-border/50 bg-elevated/40 px-2.5 py-2">
          <p className="text-[10px] text-subtle">Entrée</p>
          <p className="font-mono text-xs tabular-nums">1.1742–1.1758</p>
        </div>
        <div className="rounded-lg border border-border/50 bg-elevated/40 px-2.5 py-2">
          <p className="text-[10px] text-subtle">Stop</p>
          <p className="font-mono text-xs text-bear tabular-nums">1.1718</p>
        </div>
        <div className="rounded-lg border border-border/50 bg-elevated/40 px-2.5 py-2">
          <p className="text-[10px] text-subtle">R:R</p>
          <p className="font-mono text-xs text-bull tabular-nums">2.14</p>
        </div>
      </div>
    </div>
  );
}
