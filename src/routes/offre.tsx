import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Crosshair,
  ExternalLink,
  Lock,
  ScanSearch,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LEGAL_DISCLAIMER,
  PREMIUM_CHECKOUT_URL,
  PLANS,
  WHATSAPP_URL,
} from "@/lib/monetization";

export const Route = createFileRoute("/offre")({ component: OffrePage });

const INCLUDED = [
  {
    icon: Sparkles,
    title: "EA SMC MultiSetup PRO v5.30",
    body: "Fichier MetaTrader 5 : biais H1, FVG / retest, risque %, TP partiel, break-even auto.",
  },
  {
    icon: ScanSearch,
    title: "Guide d’installation",
    body: "Étapes claires pour compiler, attacher l’EA et tester en compte démo.",
  },
  {
    icon: Crosshair,
    title: "Paramètres recommandés",
    body: "Risque, sessions Londres / NY, spread max, structure — prêts à adapter.",
  },
  {
    icon: Zap,
    title: "Mises à jour du pack",
    body: "Accès prioritaire aux nouvelles versions du bot quand elles sortent.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Tu t’abonnes",
    body: "Paiement sécurisé via le lien externe (Gumroad ou équivalent).",
  },
  {
    n: "2",
    title: "Tu reçois ton code",
    body: "Code d’accès envoyé par email / message après confirmation.",
  },
  {
    n: "3",
    title: "Tu débloques Premium",
    body: "Sur la page Premium, entre le code → téléchargement EA + guide.",
  },
];

const FAQ = [
  {
    q: "Est-ce un signal qui garantit des gains ?",
    a: "Non. C’est un outil éducatif et un EA technique. Les marchés comportent un risque de perte. Aucun résultat n’est garanti.",
  },
  {
    q: "L’analyzer gratuit disparaît-il ?",
    a: "Non. L’app de base (analyzer, marchés, journal) reste utilisable gratuitement. Premium ajoute le pack MT5 et le contenu réservé.",
  },
  {
    q: "Sur quel terminal tourne l’EA ?",
    a: "MetaTrader 5 uniquement. Il ne s’exécute pas dans le navigateur Ngntrade.",
  },
  {
    q: "Comment obtenir le contenu après paiement ?",
    a: "Tu reçois un code d’accès. Tu le saisis sur /premium pour déverrouiller le téléchargement sur ton appareil.",
  },
  {
    q: "Puis-je tester avant le réel ?",
    a: "Oui — et c’est obligatoire : compte démo + backtest avant tout capital réel.",
  },
];

function OffrePage() {
  const premium = PLANS.find((p) => p.id === "premium");
  const hasCheckout = Boolean(PREMIUM_CHECKOUT_URL.trim());

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="pointer-events-none absolute inset-0 hero-mesh" />
        <div className="relative mx-auto max-w-3xl px-4 py-16 text-center md:py-24">
          <Badge variant="accent" className="mx-auto">
            <Lock className="size-3" />
            Pack Premium · Accès réservé
          </Badge>
          <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight sm:text-5xl md:leading-[1.08]">
            Le pack MT5 pour structurer tes{" "}
            <span className="bg-gradient-to-r from-accent via-[#b8d9ff] to-bull bg-clip-text text-transparent">
              sessions
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            EA SMC, guide d’installation et paramètres recommandés. Tu vois ce
            qui est inclus ici ; le contenu se débloque après abonnement.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {hasCheckout ? (
              <Button asChild size="lg">
                <a
                  href={PREMIUM_CHECKOUT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  S’abonner maintenant
                  <ExternalLink className="size-4" />
                </a>
              </Button>
            ) : (
              <Button size="lg" disabled>
                Paiement bientôt disponible
              </Button>
            )}
            <Button asChild size="lg" variant="outline">
              <Link to="/premium">
                Voir Premium
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          {premium ? (
            <p className="mt-5 font-mono text-sm text-muted-foreground">
              {premium.priceLabel}
              {premium.period ? ` / ${premium.period}` : ""} · sans engagement
              long terme affiché sur la page de paiement
            </p>
          ) : null}
          <p className="mt-3 text-xs text-subtle">
            Lecture éducative. Pas un conseil d’investissement.
          </p>
        </div>
      </section>

      {/* Included */}
      <section className="border-b border-border/50">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <p className="section-kicker">Inclus</p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Ce que tu obtiens avec Premium
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {INCLUDED.map((item) => (
              <div
                key={item.title}
                className="card-lift rounded-2xl border border-border/80 bg-card/90 p-5"
              >
                <div className="inline-flex size-11 items-center justify-center rounded-xl border border-border/80 bg-elevated/50">
                  <item.icon className="size-5 text-accent" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="border-b border-border/50 bg-card/20">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <p className="section-kicker">Parcours</p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Comment ça marche
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="card-lift rounded-2xl border border-border/80 bg-card/90 p-5"
              >
                <span className="inline-flex size-8 items-center justify-center rounded-full border border-accent/30 bg-accent/10 font-mono text-sm font-semibold text-accent">
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

      {/* Pricing box */}
      <section className="border-b border-border/50">
        <div className="mx-auto max-w-lg px-4 py-16 md:py-20">
          <div className="card-lift relative rounded-2xl border border-accent/45 bg-gradient-to-br from-accent/10 via-card to-card p-8 shadow-sm">
            <Badge variant="accent" className="absolute -top-2.5 right-6">
              <Sparkles className="size-3" />
              Premium
            </Badge>
            <h2 className="font-display text-2xl font-semibold">
              {premium?.name ?? "Premium"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {premium?.tagline}
            </p>
            <p className="mt-6 font-mono text-4xl tabular-nums">
              {premium?.priceLabel ?? "9,90 €"}
              {premium?.period ? (
                <span className="text-base text-muted-foreground">
                  {" "}
                  / {premium.period}
                </span>
              ) : null}
            </p>
            <ul className="mt-6 space-y-2">
              {(premium?.features ?? []).map((f) => (
                <li key={f} className="flex gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            {hasCheckout ? (
              <Button asChild className="mt-8 w-full" size="lg">
                <a
                  href={PREMIUM_CHECKOUT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="size-4" />
                  Payer et s’abonner
                </a>
              </Button>
            ) : (
              <Button className="mt-8 w-full" size="lg" disabled>
                Lien de paiement à configurer
              </Button>
            )}
            <p className="mt-3 text-center text-[11px] text-subtle">
              Après paiement → code → déblocage sur /premium
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-border/50">
        <div className="mx-auto max-w-3xl px-4 py-16 md:py-20">
          <p className="section-kicker">FAQ</p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Questions fréquentes
          </h2>
          <div className="mt-10 space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-border/80 bg-card/90 px-5 py-4"
              >
                <summary className="cursor-pointer list-none font-medium marker:content-none">
                  <span className="flex items-center justify-between gap-3">
                    {item.q}
                    <span className="text-subtle transition group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 hero-mesh opacity-50" />
        <div className="relative mx-auto max-w-3xl px-4 py-16 text-center md:py-20">
          <Shield className="mx-auto size-8 text-accent" />
          <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Prêt à débloquer le pack ?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            L’app gratuite reste là. Premium, c’est le pack MT5 + contenu
            réservé — activé seulement après abonnement.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {hasCheckout ? (
              <Button asChild size="lg">
                <a
                  href={PREMIUM_CHECKOUT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  S’abonner
                  <ExternalLink className="size-4" />
                </a>
              </Button>
            ) : (
              <Button asChild size="lg">
                <Link to="/premium">Aller à Premium</Link>
              </Button>
            )}
            <Button asChild size="lg" variant="outline">
              <Link to="/analyzer">Continuer gratuitement</Link>
            </Button>
            {WHATSAPP_URL.trim() ? (
              <Button asChild size="lg" variant="outline" className="border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/10">
                <a href={WHATSAPP_URL.trim()} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              </Button>
            ) : null}
          </div>
          <p className="mx-auto mt-8 max-w-xl text-xs leading-relaxed text-subtle">
            {LEGAL_DISCLAIMER}
          </p>
        </div>
      </section>
    </main>
  );
}
