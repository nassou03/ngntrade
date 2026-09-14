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
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Exemple indisponible");
    }
  }

  return (
    <main>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
        <div>
          <Badge variant="accent">Forex · Crypto · Matières · Indices</Badge>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
            L’IA qui lit vos graphiques.
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
            Envoyez une capture. Ngntrade renvoie un plan : biais, supports et
            résistances, zone d’entrée, stop, cibles. Vous exécutez où vous tradez déjà.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
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
          <p className="mt-6 text-xs text-subtle">
            Lecture éducative. Pas un conseil d’investissement.
          </p>
        </div>
        <div className="space-y-3">
          <Dropzone onFile={onFile} />
          <MockPlan />
          <p className="text-center text-xs text-subtle">
            TradingView, MetaTrader, cTrader, broker — n’importe quelle capture nette.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-2">
        <MarketTicker />
      </section>

      <section className="border-y border-border bg-card/40">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-3">
          <Proof k="4 marchés" v="FX, crypto, or, indices" />
          <Proof k="Plan structuré" v="Biais, niveaux, R:R" />
          <Proof k="Vous gardez la main" v="Taille et ordres chez vous" />
        </div>
      </section>

      <section className="border-b border-border bg-card/40">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n}>
              <p className="font-mono text-xs text-accent">{s.n}</p>
              <h2 className="mt-2 font-display text-lg font-semibold">{s.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-accent uppercase">Exemples</p>
            <h2 className="mt-1 font-display text-2xl font-semibold">Quatre classes d’actifs</h2>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/analyzer">Tout analyser</Link>
          </Button>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SAMPLE_CHARTS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => void loadSample(s.id)}
              className="group overflow-hidden rounded-xl border border-border bg-card text-left"
            >
              <img
                src={s.file}
                alt={s.symbol}
                className="h-36 w-full object-cover transition-opacity duration-fast group-hover:opacity-90"
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

      <section className="border-t border-border">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-5">
              <f.icon className="size-5 text-accent" />
              <h3 className="mt-3 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-card/30">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <p className="text-xs font-medium tracking-wide text-accent uppercase">Traders</p>
          <h2 className="mt-1 font-display text-2xl font-semibold">Un second regard, pas un gourou</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {QUOTES.map((q) => (
              <blockquote key={q.name} className="rounded-xl border border-border bg-card p-5">
                <p className="text-sm leading-relaxed text-foreground/90">“{q.body}”</p>
                <footer className="mt-4">
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
    <div>
      <p className="font-display text-lg font-semibold">{k}</p>
      <p className="mt-1 text-sm text-muted-foreground">{v}</p>
    </div>
  );
}

function MockPlan() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-sm">EURUSD · H1</p>
          <p className="text-xs text-muted-foreground">Exemple de plan renvoyé</p>
        </div>
        <Badge variant="bull">Haussier</Badge>
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-md bg-elevated px-2 py-2">
          <dt className="text-subtle">Entrée</dt>
          <dd className="mt-0.5 font-mono tabular-nums">1.1742–1.1758</dd>
        </div>
        <div className="rounded-md bg-elevated px-2 py-2">
          <dt className="text-subtle">Stop</dt>
          <dd className="mt-0.5 font-mono tabular-nums text-bear">1.1718</dd>
        </div>
        <div className="rounded-md bg-elevated px-2 py-2">
          <dt className="text-subtle">R:R</dt>
          <dd className="mt-0.5 font-mono tabular-nums">2.14</dd>
        </div>
      </dl>
    </div>
  );
}
