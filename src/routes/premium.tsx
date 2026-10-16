import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Check,
  Download,
  Sparkles,
  AlertTriangle,
  ExternalLink,
  Gift,
  Lock,
  Unlock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Label } from "@/components/ui/input";
import {
  PLANS,
  LEGAL_DISCLAIMER,
  PREMIUM_CHECKOUT_URL,
  PREMIUM_PARTNERS,
  PREMIUM_ACCESS_CODE,
  PREMIUM_STORAGE_KEY,
  hasAnyPaymentMethod,
} from "@/lib/monetization";
import { PaymentMethods } from "@/components/premium/payment-methods";
import { toast } from "sonner";

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

function readUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(PREMIUM_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function PremiumPage() {
  const hasCheckout = Boolean(PREMIUM_CHECKOUT_URL.trim());
  const hasPay = hasAnyPaymentMethod();
  const hasAccessCode = Boolean(PREMIUM_ACCESS_CODE.trim());
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");

  useEffect(() => {
    setUnlocked(readUnlocked());
  }, []);

  function unlockWithCode() {
    const expected = PREMIUM_ACCESS_CODE.trim();
    if (!expected) {
      toast.error("Code d’accès non configuré côté serveur.");
      return;
    }
    if (code.trim() === expected) {
      try {
        window.localStorage.setItem(PREMIUM_STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
      setUnlocked(true);
      toast.success("Premium débloqué sur cet appareil");
    } else {
      toast.error("Code incorrect");
    }
  }

  function lockAgain() {
    try {
      window.localStorage.removeItem(PREMIUM_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setUnlocked(false);
    toast.message("Contenu Premium verrouillé à nouveau");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-28 md:pb-12">
      <p className="section-kicker">Offre</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
        Premium & partenaires
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        L&apos;app de base reste gratuite. Premium est{" "}
        <strong className="font-medium text-foreground/90">réservé aux abonnés</strong>{" "}
        : tu vois ce qui est inclus, le contenu complet (EA, guide, paramètres)
        s&apos;ouvre après paiement.{" "}
        <Link to="/offre" className="font-medium text-accent hover:underline">
          Page de vente
        </Link>
      </p>

      {/* Plans — always visible (teaser) */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {PLANS.map((plan) => (
          <article
            key={plan.id}
            className={
              plan.highlighted
                ? "card-lift relative rounded-2xl border border-accent/45 bg-gradient-to-br from-accent/10 via-card to-card p-6 shadow-sm"
                : "card-lift rounded-2xl border border-border/80 bg-card/90 p-6"
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
              <div className="mt-6">
                <PaymentMethods compact />
              </div>
            )}
          </article>
        ))}
      </div>

      {/* Locked vs unlocked content */}
      {!unlocked ? (
        <section className="relative mt-12 overflow-hidden rounded-2xl border border-border/80 bg-card/90">
          <div className="pointer-events-none select-none p-6 blur-[2px] md:p-8" aria-hidden>
            <p className="section-kicker">MetaTrader 5</p>
            <h2 className="mt-1 font-display text-2xl font-semibold">
              EA SMC MultiSetup PRO v5.30
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Fichier .mq5, guide d&apos;installation, paramètres recommandés et
              mises à jour — réservés aux membres Premium.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {EA_PARAMS.slice(0, 4).map((p) => (
                <div
                  key={p.name}
                  className="rounded-xl border border-border bg-elevated/50 px-3 py-2"
                >
                  <p className="text-[11px] text-subtle">{p.name}</p>
                  <p className="mt-0.5 font-mono text-sm">••••</p>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-[2px]">
            <div className="mx-4 max-w-md rounded-2xl border border-border/80 bg-card p-6 text-center shadow-lg">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-accent/30 bg-accent/10">
                <Lock className="size-5 text-accent" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">
                Contenu Premium verrouillé
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Téléchargement EA, guide et paramètres détaillés : uniquement
                après abonnement. Tu peux déjà voir la liste des avantages
                ci-dessus.
              </p>
              <div className="mt-5">
                <PaymentMethods compact />
              </div>
              {hasAccessCode ? (
                <div className="mt-5 space-y-2 border-t border-border/60 pt-5 text-left">
                  <Label htmlFor="premium-code">Déjà abonné ? Entre ton code</Label>
                  <div className="flex gap-2">
                    <Input
                      id="premium-code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Code reçu après paiement"
                      autoComplete="off"
                    />
                    <Button type="button" onClick={unlockWithCode}>
                      <Unlock className="size-4" />
                      OK
                    </Button>
                  </div>
                  <p className="text-[11px] text-subtle">
                    Le code est envoyé après l&apos;achat (email / message).
                  </p>
                </div>
              ) : (
                <p className="mt-4 text-[11px] text-subtle">
                  Après configuration du code d&apos;accès (
                  <code className="text-[10px]">VITE_PREMIUM_ACCESS_CODE</code>
                  ), les abonnés pourront débloquer ici.
                </p>
              )}
            </div>
          </div>
        </section>
      ) : (
        <section className="mt-12 rounded-2xl border border-border/80 bg-card/90 p-6 shadow-sm md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="section-kicker">MetaTrader 5 · Débloqué</p>
              <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
                EA SMC MultiSetup PRO v5.30
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Expert Advisor pour <strong>MetaTrader 5 uniquement</strong>.
                Logique SMC : biais H1, FVG / retest, risque en %, TP partiel,
                break-even auto, sessions Londres / New York.
              </p>
              <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                <Gift className="mt-0.5 size-4 shrink-0 text-accent" />
                <span>
                  Accès membre : fichier .mq5, guide résumé et paramètres
                  recommandés.
                </span>
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button asChild>
                <a href="/downloads/SMC_MultiSetup_PRO_v5_30.mq5" download>
                  <Download className="size-4" />
                  Télécharger le .mq5
                </a>
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={lockAgain}>
                Verrouiller sur cet appareil
              </Button>
            </div>
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
              <li>
                Ouvre MetaTrader 5 → dossier{" "}
                <code className="text-xs">MQL5/Experts</code>
              </li>
              <li>
                Copie{" "}
                <code className="text-xs">SMC_MultiSetup_PRO_v5_30.mq5</code>
              </li>
              <li>Compile dans MetaEditor (F7)</li>
              <li>Attache l&apos;EA sur un graphique</li>
              <li>
                Active le trading algo + teste d&apos;abord en{" "}
                <strong>compte démo</strong>
              </li>
            </ol>
          </div>

          <div className="mt-6 flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-500" />
            <div className="space-y-1 text-muted-foreground">
              <p className="font-medium text-foreground">Avertissement</p>
              <p>
                Cet EA place des ordres réels s&apos;il est activé en réel. Ce
                n&apos;est <strong>pas</strong> un conseil d&apos;investissement.
                Backtest et démo obligatoires.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Affiliation — public (revenu passif) */}
      <section className="mt-12">
        <p className="section-kicker">Affiliation</p>
        <h2 className="mt-1 font-display text-xl font-semibold tracking-tight">
          Ouvrir un compte chez un partenaire
        </h2>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Liens publics. Si tu t&apos;inscris via ces boutons, Ngntrade peut
          recevoir une commission — le prix pour toi ne change pas.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {PREMIUM_PARTNERS.map((p) => (
            <a
              key={p.id}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="card-lift group rounded-2xl border border-border/80 bg-card/90 p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <Badge variant="outline">{p.tag}</Badge>
                <ExternalLink className="size-3.5 text-subtle group-hover:text-accent" />
              </div>
              <p className="mt-3 font-display text-lg font-semibold">{p.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{p.blurb}</p>
            </a>
          ))}
        </div>
      </section>

      <p className="mt-8 max-w-2xl text-xs leading-relaxed text-subtle">
        {LEGAL_DISCLAIMER}
      </p>
    </div>
  );
}
