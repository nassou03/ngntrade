import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLANS, LEGAL_DISCLAIMER } from "@/lib/monetization";

export const Route = createFileRoute("/premium")({ component: PremiumPage });

function PremiumPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-28 md:pb-12">
      <p className="text-xs font-medium tracking-wide text-accent uppercase">
        Offre
      </p>
      <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
        Passe en Premium quand tu es prêt
      </h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Aujourd&apos;hui tout le monde utilise la version gratuite. Premium est
        prêt pour plus tard : plus d&apos;analyses IA, historique cloud, priorités.
        Le paiement (Stripe) se branche quand tu auras un premier revenu.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {PLANS.map((plan) => (
          <article
            key={plan.id}
            className={
              plan.highlighted
                ? "relative rounded-2xl border border-accent/50 bg-card p-6 shadow-[0_0_0_1px_rgba(var(--accent-rgb,0,0,0),0.1)]"
                : "rounded-2xl border border-border bg-card p-6"
            }
          >
            {plan.highlighted ? (
              <Badge variant="accent" className="absolute -top-2.5 right-4">
                <Sparkles className="size-3" />
                Recommandé plus tard
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

      <p className="mt-8 max-w-2xl text-xs leading-relaxed text-subtle">
        {LEGAL_DISCLAIMER}
      </p>
    </div>
  );
}
