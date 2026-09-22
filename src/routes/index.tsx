import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CandlestickChart,
  LayoutDashboard,
  MessageSquare,
  Shield,
} from "lucide-react";
import { Dropzone } from "@/components/analyzer/dropzone";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { compressToDataUrl, fetchAsDataUrl } from "@/lib/image";
import { SAMPLE_CHARTS } from "@/lib/samples";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import { MarketTicker } from "@/components/markets/ticker";

export const Route = createFileRoute("/")({ component: Home });

const STEPS = [
  {
    n: "01",
    title: "Capturez le graphique",
    body: "Symbole, timeframe, niveaux et indicateurs dans une seule image.",
  },
  {
    n: "02",
    title: "Déposez et précisez votre lecture",
    body: "Thèse, risque, session. Court et clair.",
  },
  {
    n: "03",
    title: "Recevez un plan utilisable",
    body: "Biais structuré, niveaux, entrée, stop, cibles — à vérifier avant le capital.",
  },
  {
    n: "04",
    title: "Exécutez chez votre broker",
    body: "Taille et ordres restent sous votre contrôle.",
  },
];

const FEATURES = [
  {
    icon: CandlestickChart,
    title: "L’IA lit vos graphiques",
    body: "Niveaux, biais et plan rédigé. Forex, crypto, matières premières, indices.",
  },
  {
    icon: MessageSquare,
    title: "Copilote de session",
    body: "Questionnez le plan, challengez une idée, restez ancré à vos règles.",
  },
  {
    icon: BookOpen,
    title: "Journal de trades",
    body: "Importez un setup depuis l’analyse. Plus de recopies à la main.",
  },
  {
    icon: LayoutDashboard,
    title: "Tableau de performance",
    body: "PnL, séries, résultats jour par jour. Ce qui paie, ce qui coûte.",
  },
  {
    icon: CalendarDays,
    title: "Calendrier macro",
    body: "NFP, CPI, FOMC, BCE — planifiez autour de la volatilité.",
  },
  {
    icon: Shield,
    title: "Risque d’abord",
    body: "Invalidation, taille de position, scénario qui tue le compte.",
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

  async function loadSample(id: string) {
    const sample = SAMPLE_CHARTS.find((s) => s.id === id);
    if (!sample) return;
    try {
      const data = await fetchAsDataUrl(sample.file);
      setPending(data, {
        market: sample.market,
        session: sample.session,
        thesis: sample.thesis,
      });
      void navigate({ to: "/analyzer" });
    } catch {
      toast.error("Échantillon indisponible");
    }
  }

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_color-mix(in_oklab,var(--color-accent)_8%,transparent),_transparent_55%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-2 md:items-center md:py-20">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-elevated/50 px-3 py-1 text-[11px] font-medium tracking-wide text-muted-foreground">
              <span className="size-1.5 rounded-full bg-bull" />
              FOREX · CRYPTO · MATIÈRES · INDICES
            </div>
            <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight sm:text-5xl md:text-[3.25rem] md:leading-[1.08]">
              L’IA qui lit vos{" "}
              <span className="bg-gradient-to-r from-accent to-bull bg-clip-text text-transparent">
                graphiques
              </span>
              .
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
              Envoyez une capture. Ngntrade renvoie un plan : biais, supports et
              résistances, zone d’entrée, stop, cibles. Vous exécutez où vous
              tradez déjà.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/analyzer">
                  Ouvrir l’analyzer
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/markets">Voir les marchés</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-subtle">
              Lecture éducative. Pas un conseil d’investissement.
            </p>
          </div>

          <div className="animate-fade-up space-y-4 [animation-delay:80ms]">
            <div className="rounded-2xl border border-border/80 bg-card/80 p-1 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.9)]">
              <div className="rounded-xl border border-dashed border-border/80 bg-elevated/30 p-4">
                <Dropzone onFile={onFile} />
              </div>
            </div>
            <MockPlan />
            <p className="text-center text-[11px] text-subtle">
              TradingView, MetaTrader, cTrader, broker — n’importe quelle capture nette.
            </p>
          </div>
        </div>

        <div className="border-t border-border/50 bg-card/20">
          <div className="mx-auto max-w-6xl px-4 py-4">
            <MarketTicker />
          </div>
        </div>
      </section>

      {/* Proofs */}
      <section className="border-b border-border/60">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
          <Proof k="4 marchés" v="FX, crypto, or, indices" />
          <Proof k="Plan structuré" v="Biais, niveaux, R:R" />
          <Proof k="Vous gardez la main" v="Taille et ordres chez vous" />
        </div>
      </section>

      {/* Steps */}
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="section-kicker">Parcours</p>
          <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
            De la capture au plan
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="card-lift relative rounded-2xl border border-border bg-card/80 p-5"
              >
                <span className="font-mono text-xs text-accent">{s.n}</span>
                <h3 className="mt-3 font-display text-base font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="section-kicker">Produit</p>
          <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
            Tout pour structurer une session
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="card-lift rounded-2xl border border-border bg-card/80 p-5"
              >
                <div className="inline-flex size-10 items-center justify-center rounded-xl border border-border bg-elevated/60">
                  <f.icon className="size-5 text-accent" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quotes */}
      <section className="bg-card/25">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="section-kicker">Traders</p>
          <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
            Un second regard, pas un gourou
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {QUOTES.map((q) => (
              <blockquote
                key={q.name}
                className="card-lift rounded-2xl border border-border bg-card/90 p-6"
              >
                <p className="text-sm leading-relaxed text-foreground/90">
                  “{q.body}”
                </p>
                <footer className="mt-5 border-t border-border/60 pt-4">
                  <p className="text-sm font-medium">{q.name}</p>
                  <p className="text-xs text-subtle">{q.role}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Proof({ k, v }: { k: string; v: string }) {
  return (
    <div className="text-center sm:text-left">
      <p className="font-display text-xl font-semibold tracking-tight sm:text-2xl">{k}</p>
      <p className="mt-1 text-sm text-muted-foreground">{v}</p>
    </div>
  );
}

function MockPlan() {
  return (
    <div className="rounded-2xl border border-border/80 bg-card/90 p-4 shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-sm">EURUSD · H1</p>
          <p className="text-xs text-muted-foreground">Exemple de plan renvoyé</p>
        </div>
        <Badge variant="bull">Haussier</Badge>
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-lg border border-border/50 bg-elevated/80 px-2.5 py-2.5">
          <dt className="text-subtle">Entrée</dt>
          <dd className="mt-0.5 font-mono tabular-nums">1.1742–1.1758</dd>
        </div>
        <div className="rounded-lg border border-border/50 bg-elevated/80 px-2.5 py-2.5">
          <dt className="text-subtle">Stop</dt>
          <dd className="mt-0.5 font-mono tabular-nums text-bear">1.1718</dd>
        </div>
        <div className="rounded-lg border border-border/50 bg-elevated/80 px-2.5 py-2.5">
          <dt className="text-subtle">R:R</dt>
          <dd className="mt-0.5 font-mono tabular-nums text-bull">2.14</dd>
        </div>
      </dl>
    </div>
  );
}
