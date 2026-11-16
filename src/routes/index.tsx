import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, ClipboardPaste, X } from "lucide-react";
import { toast } from "sonner";
import { Dropzone } from "@/components/analyzer/dropzone";
import { MarketTicker } from "@/components/markets/ticker";
import { Button } from "@/components/ui/button";
import { compressToDataUrl } from "@/lib/image";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/")({ component: Home });

/* Illustration : bougies H1 fictives, échelle 1,1700 → 1,1800 */
const CANDLES: [number, number, number, number][] = [
  [1.1712, 1.1719, 1.1708, 1.1722], [1.1719, 1.1726, 1.1716, 1.1724], [1.1724, 1.1731, 1.172, 1.1718],
  [1.1718, 1.1723, 1.1711, 1.1721], [1.1721, 1.1733, 1.1719, 1.173], [1.173, 1.1738, 1.1727, 1.1736],
  [1.1736, 1.1744, 1.1731, 1.1741], [1.1741, 1.1747, 1.1734, 1.1737], [1.1737, 1.1749, 1.1735, 1.1746],
  [1.1746, 1.1756, 1.1743, 1.1753], [1.1753, 1.1761, 1.1749, 1.1758], [1.1758, 1.1768, 1.1755, 1.1765],
  [1.1765, 1.1774, 1.1761, 1.1771], [1.1771, 1.1777, 1.1763, 1.1766], [1.1766, 1.177, 1.1755, 1.1759],
  [1.1759, 1.1764, 1.1748, 1.1752], [1.1752, 1.1758, 1.1744, 1.1755], [1.1755, 1.1759, 1.1745, 1.1749],
];
const Y = (p: number) => 270 - ((p - 1.17) / 0.01) * 240;
const LEVELS = [
  { label: "TP2 1.1790", p: 1.179, color: "#0f9d77", dash: true, delay: 1.7 },
  { label: "TP1 1.1775", p: 1.1775, color: "#0f9d77", dash: true, delay: 1.4 },
  { label: "Entrée 1.1748", p: 1.1748, color: "#c2860f", dash: false, delay: 1.0 },
  { label: "Stop 1.1730", p: 1.173, color: "#d4413f", dash: true, delay: 1.2 },
];

function HeroChart() {
  return (
    <div className="chart-paper relative overflow-hidden rounded-2xl shadow-[0_40px_90px_-30px_rgba(0,0,0,0.8)]">
      <div className="flex items-center justify-between border-b border-[#1b263022] px-4 py-2.5 text-xs font-medium">
        <span className="font-mono">EURUSD · H1</span>
        <span className="rounded-full bg-[#0f9d771f] px-2.5 py-0.5 font-semibold text-[#0b7a5c]">
          Setup A · confluence 78 %
        </span>
      </div>
      <svg viewBox="0 0 480 300" className="block w-full" role="img" aria-label="Illustration d'un graphique EURUSD annoté avec entrée, stop et deux objectifs">
        {CANDLES.map(([o, h, l, c], i) => {
          const x = 22 + i * 15.5;
          const up = c >= o;
          const col = up ? "#0f9d77" : "#d4413f";
          return (
            <g key={i}>
              <line x1={x} x2={x} y1={Y(h)} y2={Y(l)} stroke={col} strokeWidth="1.4" />
              <rect x={x - 4.2} width="8.4" y={Math.min(Y(o), Y(c))} height={Math.max(2, Math.abs(Y(o) - Y(c)))} fill={col} />
            </g>
          );
        })}
        {/* zone d'offre/demande retestée */}
        <rect x="190" width="290" y={Y(1.1752)} height={Y(1.1744) - Y(1.1752)} fill="#6fa8ff" opacity="0.18" />
        {LEVELS.map((l) => (
          <g key={l.label}>
            <line
              x1="0" x2="480" y1={Y(l.p)} y2={Y(l.p)}
              pathLength={1}
              stroke={l.color} strokeWidth="1.6"
              className="draw-line"
              style={{ animationDelay: `${l.delay}s` }}
            />
            <g className="draw-label" style={{ animationDelay: `${l.delay + 0.5}s` }}>
              <rect x="300" y={Y(l.p) - 9} width="92" height="18" rx="3" fill={l.color} />
              <text x="346" y={Y(l.p) + 4} textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#fff" fontFamily="IBM Plex Mono, monospace">
                {l.label}
              </text>
            </g>
          </g>
        ))}
      </svg>
      <p className="border-t border-[#1b263022] px-4 py-2 text-[11px] text-[#1b2630b3]">
        Illustration. Les niveaux de votre analyse sont lus sur votre propre capture.
      </p>
    </div>
  );
}

const READS = [
  "Symbole, timeframe et échelle de l'axe des prix",
  "Structure sur chaque timeframe : cassures, retournements, liquidité",
  "Zones : order blocks, FVG, supports, résistances",
  "Entrée, stop et objectifs, avec un scénario alternatif",
];
const CHECKS = [
  "Le stop est du bon côté de l'entrée, les cibles aussi",
  "Le R:R est recalculé depuis les prix, pas repris de l'IA",
  "La distance du stop est comparée à l'ATR",
  "9 critères de confluence notés pour donner la note A, B ou C",
];

const STEPS = [
  { t: "Déposez vos captures", b: "Un à quatre timeframes du même actif. Vous pouvez aussi coller depuis le presse-papiers." },
  { t: "Choisissez votre style", b: "Scalping, intraday ou swing, et la méthode : Smart Money, price action ou indicateurs." },
  { t: "Lisez le plan contrôlé", b: "Note du setup, checklist, scénarios, et le graphique annoté à télécharger." },
  { t: "Exécutez chez votre broker", b: "L'outil ne passe aucun ordre. La taille de position reste à votre main." },
];

const FEATURES = [
  ["Graphique annoté", "Entrée, stop, objectifs et zones tracés sur votre capture, exportables en image."],
  ["Plan vérifié", "Cohérence des prix contrôlée par du code, pas par la confiance de l'IA."],
  ["Checklist de confluence", "Chaque critère est validé, refusé ou inconnu. Rien n'est inventé pour remplir une case."],
  ["Scénario alternatif", "Ce qu'il se passe si le scénario principal échoue, avant d'entrer."],
  ["Copilote de session", "Posez vos questions sur le plan, en mode analyste, mentor ou risk manager."],
  ["Journal et performance", "Un clic pour journaliser le setup, puis suivre ce qui rapporte."],
] as const;

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
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="pointer-events-none absolute inset-0 hero-mesh" />
        <div className="pointer-events-none absolute inset-0 hero-grid opacity-30" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-14 md:grid-cols-[1fr_1.05fr] md:items-center md:gap-14 md:py-20">
          <div>
            <h1 className="font-display text-[2.5rem] leading-[1.04] font-semibold tracking-[-0.03em] sm:text-5xl lg:text-[3.6rem]">
              Votre capture devient un plan de trade vérifié.
            </h1>
            <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-muted-foreground">
              L'IA lit le graphique. L'application contrôle ensuite le plan : stop, R:R et
              confluence. Vous recevez le tout tracé sur votre propre image.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 px-6 text-[15px]">
                <Link to="/analyzer">
                  Analyser une capture
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6 text-[15px]">
                <Link to="/markets">Voir les marchés</Link>
              </Button>
            </div>
            <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
              <ClipboardPaste className="size-4 text-accent" />
              Copiez un graphique sur TradingView ou MT5, puis collez-le avec Ctrl+V.
            </p>
            <p className="mt-6 text-xs text-subtle">Lecture éducative. Pas un conseil d'investissement.</p>
          </div>

          <div className="space-y-4">
            <HeroChart />
            <div className="rounded-2xl border border-border bg-card/70 p-1.5">
              <Dropzone onFile={onFile} compact label="Ou déposez votre graphique ici" hint="PNG, JPG ou WebP, avec l'axe des prix visible." />
            </div>
          </div>
        </div>
        <div className="relative border-t border-border/50 bg-black/20">
          <div className="mx-auto max-w-6xl px-4 py-3.5">
            <MarketTicker />
          </div>
        </div>
      </section>

      {/* Différence : lire vs vérifier */}
      <section className="border-b border-border/50">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <h2 className="max-w-xl font-display text-3xl font-semibold tracking-tight sm:text-[2.1rem]">
            Une IA qui lit, un code qui vérifie.
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Un modèle de langage peut se tromper de côté sur un stop ou calculer un R:R faux.
            Chaque plan passe donc par des contrôles automatiques avant d'arriver à l'écran.
          </p>
          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2">
            <div className="bg-card p-6 md:p-8">
              <h3 className="font-display text-lg font-semibold">Ce que l'IA lit sur votre capture</h3>
              <ul className="mt-4 space-y-3">
                {READS.map((r) => (
                  <li key={r} className="flex gap-3 text-sm text-muted-foreground">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent"><Check className="size-3" /></span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card p-6 md:p-8">
              <h3 className="font-display text-lg font-semibold">Ce que l'application vérifie</h3>
              <ul className="mt-4 space-y-3">
                {CHECKS.map((r) => (
                  <li key={r} className="flex gap-3 text-sm text-muted-foreground">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-bull/15 text-bull"><Check className="size-3" /></span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Parcours */}
      <section className="border-b border-border/50">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-[0.8fr_1.2fr] md:py-20">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-[2.1rem]">De la capture à l'ordre, en quatre étapes.</h2>
            <p className="mt-3 max-w-sm text-muted-foreground">Pas de signal aveugle : un plan à relire avant de risquer du capital.</p>
          </div>
          <ol className="divide-y divide-border/70 border-y border-border/70">
            {STEPS.map((s, i) => (
              <li key={s.t} className="flex gap-5 py-5">
                <span className="font-mono text-sm text-accent tabular-nums">{i + 1}</span>
                <div>
                  <h3 className="font-display text-lg font-semibold tracking-tight">{s.t}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.b}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Fonctions */}
      <section className="border-b border-border/50">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <h2 className="max-w-lg font-display text-3xl font-semibold tracking-tight sm:text-[2.1rem]">Tout pour structurer une session.</h2>
          <dl className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(([t, b]) => (
              <div key={t} className="border-t border-border pt-4">
                <dt className="font-display text-lg font-semibold tracking-tight">{t}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{b}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Démo vidéo */}
      <section className="border-b border-border/50 bg-black/20">
        <div className="mx-auto max-w-4xl px-4 py-14 md:py-18">
          <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">Voir l'outil en 1 minute 15</h2>
          <div className="mt-6 overflow-hidden rounded-2xl border border-border">
            <video className="aspect-video w-full bg-black object-cover" src="/demo/ngntrade-demo.mp4" poster="/demo/poster.jpg" controls playsInline preload="none" aria-label="Démo Ngntrade avec voix off" />
          </div>
        </div>
      </section>

      {/* Limites assumées */}
      <section className="border-b border-border/50">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-2 md:py-20">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-[2.1rem]">Ce que l'outil ne fait pas.</h2>
            <p className="mt-3 max-w-md text-muted-foreground">Un second regard honnête vaut mieux qu'une promesse de gains.</p>
          </div>
          <ul className="space-y-3 text-sm text-muted-foreground">
            {[
              "Il ne promet aucun taux de réussite et ne garantit aucun résultat.",
              "Il ne passe aucun ordre et n'accède à aucun compte de trading.",
              "Il peut mal lire un axe flou : la lisibilité de votre capture est signalée, et le graphique annoté n'est affiché que si l'axe est calibrable.",
              "Il dit « pas de trade » quand le setup n'est pas là.",
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <X className="mt-0.5 size-4 shrink-0 text-subtle" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 hero-mesh opacity-70" />
        <div className="relative mx-auto max-w-3xl px-4 py-20 text-center md:py-24">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-[2.25rem]">Envoyez votre prochain graphique.</h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">Gratuit pour démarrer. Premium optionnel quand vous êtes prêt.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="h-12 px-6">
              <Link to="/analyzer">Analyser une capture<ArrowRight className="size-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6">
              <Link to="/offre">Voir l'offre</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
