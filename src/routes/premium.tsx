import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Download, Sparkles, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLANS, LEGAL_DISCLAIMER } from "@/lib/monetization";

export const Route = createFileRoute("/premium")({ component: PremiumPage });

const EA_PARAMS = [
  { name: "Risque par trade", value: "1 %" },
  { name: "TP1 / TP2 (R:R)", value: "2R / 4R" },
  { name: "Clôture partielle TP1", value: "50 %" },
  { name: "Break-even auto au TP1", value: "Oui" },
  { name: "ATR pour stop", value: "14 · facteur 0,7" },
  { name: "Sessions (UTC)", value: "Londres 7–11 · NY 13–18" },
  { name: "Spread max", value: "70 points" },
  { name: "Timeframe biais", value: "H1 (EMA 50)" },
];

function PremiumPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-28 md:pb-12">
      <p className="text-xs font-medium tracking-wide text-accent uppercase">
        Offre
      </p>
      <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
        Premium & outils MT5
      </h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        La version gratuite reste utilisable. Premium prépare analyses IA,
        historique cloud, et l&apos;accès au bot SMC pour MetaTrader 5.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {PLANS.map((plan) => (
          <article
            key={plan.id}
            className={
              plan.highlighted
                ? "relative rounded-2xl border border-accent/50 bg-card p-6"
                : "rounded-2xl border border-border bg-card p-6"
            }
          >
            {plan.highlighted ? (
              <Badge variant="accent" className="absolute -top-2.5 right-4">
                <Sparkles className="size-3" />
                Premium
              </Badge>
            ) : null}
            <h2 className="font-display text-xl font-semibold">{plan.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
            <p className="mt-4 font-mono text-3xl tabular-nums">
              {plan.priceLabel}
              {plan.period ? (
                <span className="text-sm text-muted-foreground">
                  {" "}
                  / {plan.period}
                </span>
              ) : null}
            </p>
            <ul className="mt-6 space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            {plan.id === "free" ? (
              <Button asChild className="mt-6 w-full" variant="outline">
                <Link to="/analyzer">Continuer gratuitement</Link>
              </Button>
            ) : (
              <Button className="mt-6 w-full" disabled>
                Bientôt — Stripe à brancher
              </Button>
            )}
          </article>
        ))}
      </div>

      {/* EA SMC section */}
      <section className="mt-12 rounded-2xl border border-border bg-card p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-accent uppercase">
              MetaTrader 5
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
              EA SMC MultiSetup PRO v5.30
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Expert Advisor pour <strong>MetaTrader 5 uniquement</strong>. Il
              ne s&apos;exécute pas dans le navigateur Ngntrade. Logique SMC :
              biais H1, swing, FVG / retest, risque en %, TP partiel, break-even
              auto, filtre de session Londres / New York.
            </p>
          </div>
          <Button asChild>
            <a
              href="/downloads/SMC_MultiSetup_PRO_v5_30.mq5"
              download
            >
              <Download className="size-4" />
              Télécharger le .mq5
            </a>
          </Button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {EA_PARAMS.map((p) => (
            <div
              key={p.name}
              className="rounded-xl border border-border bg-elevated/50 px-3 py-2"
            >
              <p className="text-[11px] text-subtle">{p.name}</p>
              <p className="mt-0.5 font-mono text-sm tabular-nums">{p.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-2 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Installation (résumé)</p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Ouvre MetaTrader 5 → dossier <code className="text-xs">MQL5/Experts</code></li>
            <li>Copie le fichier <code className="text-xs">SMC_MultiSetup_PRO_v5_30.mq5</code></li>
            <li>Compile dans MetaEditor (F7)</li>
            <li>Attache l&apos;EA sur un graphique (ex. M15 / H1 selon ton plan)</li>
            <li>Active le trading algo + teste d&apos;abord en <strong>compte démo</strong></li>
          </ol>
        </div>

        <div className="mt-6 flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-500" />
          <div className="space-y-1 text-muted-foreground">
            <p className="font-medium text-foreground">Avertissement important</p>
            <p>
              Cet EA place des ordres réels sur ton compte broker s&apos;il est
              activé en réel. Ce n&apos;est <strong>pas</strong> un conseil
              d&apos;investissement. Aucun bot ne garantit de gains. Risque de
              perte en capital. Backtest et démo obligatoires avant tout compte
              réel. Tu restes seul responsable de l&apos;usage.
            </p>
          </div>
        </div>
      </section>

      <p className="mt-8 max-w-2xl text-xs leading-relaxed text-subtle">
        {LEGAL_DISCLAIMER}
      </p>
    </div>
  );
}
