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
  hasAnyPaymentMethod,
} from "@/lib/monetization";
import { PaymentMethods } from "@/components/premium/payment-methods";
import {
  validatePremiumCode,
  generatePremiumCode,
  readPremiumSession,
  writePremiumSession,
  clearPremiumSession,
} from "@/lib/premium/codes";
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

function PremiumPage() {
  const hasCheckout = Boolean(PREMIUM_CHECKOUT_URL.trim());
  const hasPay = hasAnyPaymentMethod();
  const hasAccessCode = Boolean(PREMIUM_ACCESS_CODE.trim());
  const [unlocked, setUnlocked] = useState(false);
  const [expiresLabel, setExpiresLabel] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [genDays, setGenDays] = useState(30);
  const [genNote, setGenNote] = useState("");
  const [generated, setGenerated] = useState<string | null>(null);
  const [genExp, setGenExp] = useState<string | null>(null);

  useEffect(() => {
    const s = readPremiumSession();
    if (s) {
      setUnlocked(true);
      if (s.exp > 0) {
        setExpiresLabel(new Date(s.exp * 1000).toLocaleDateString("fr-FR"));
      } else {
        setExpiresLabel(null);
      }
    }
  }, []);

  async function unlockWithCode() {
    const trimmed = code.trim();
    if (!trimmed) {
      toast.error("Entre un code");
      return;
    }
    setBusy(true);
    try {
      const res = await validatePremiumCode({ data: { code: trimmed } });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      writePremiumSession(trimmed, res.exp);
      setUnlocked(true);
      setExpiresLabel(
        res.exp > 0
          ? new Date(res.exp * 1000).toLocaleDateString("fr-FR")
          : null,
      );
      toast.success(
        res.exp > 0
          ? `Premium débloqué jusqu’au ${new Date(res.exp * 1000).toLocaleDateString("fr-FR")}`
          : "Premium débloqué sur cet appareil",
      );
    } catch (e) {
      toast.error("Erreur de validation. Réessaie.");
    } finally {
      setBusy(false);
    }
  }

  function lockAgain() {
    clearPremiumSession();
    setUnlocked(false);
    setExpiresLabel(null);
    toast.message("Contenu Premium verrouillé à nouveau");
  }

  async function onGenerateCode() {
    setBusy(true);
    setGenerated(null);
    try {
      const res = await generatePremiumCode({
        data: {
          adminPassword: adminPass,
          days: genDays,
          note: genNote,
        },
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setGenerated(res.code);
      setGenExp(res.expLabel);
      toast.success(`Code généré (${res.days} jours)`);
    } catch {
      toast.error("Impossible de générer le code");
    } finally {
      setBusy(false);
    }
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

      {/* CASE CODE — toujours visible en haut si non débloqué */}
      {!unlocked ? (
        <section
          id="code-acces"
          className="mt-8 rounded-2xl border-2 border-accent bg-card p-5 shadow-md md:p-6"
        >
          <p className="text-xs font-semibold tracking-wide text-accent uppercase">
            Accès abonné
          </p>
          <h2 className="mt-1 font-display text-xl font-semibold">
            Colle ton code ici
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Après paiement MTN ou crypto, tu reçois le code sur WhatsApp. Colle-le
            ci-dessous pour débloquer le contenu Premium.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Input
              id="premium-code-top"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ex. NGN-PREMIUM-2026"
              autoComplete="off"
              className="h-12 flex-1 text-base"
            />
            <Button
              type="button"
              className="h-12 shrink-0 px-8"
              disabled={busy}
              onClick={() => void unlockWithCode()}
            >
              <Unlock className="size-4" />
              {busy ? "…" : "Débloquer"}
            </Button>
          </div>
          {!hasAccessCode ? (
            <p className="mt-2 text-xs text-warn">
              Attention : configure VITE_PREMIUM_ACCESS_CODE sur Vercel puis
              Redeploy, sinon le code ne pourra pas être validé.
            </p>
          ) : (
            <p className="mt-2 text-xs text-subtle">
              Un seul code pour tous les abonnés. Ne le partage pas publiquement.
            </p>
          )}
        </section>
      ) : (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-bull/30 bg-bull/10 px-4 py-3 text-sm">
          <Unlock className="size-4 text-bull" />
          <span className="font-medium">
            Premium débloqué
            {expiresLabel ? ` jusqu’au ${expiresLabel}` : " sur cet appareil"}.
          </span>
          <Button type="button" size="sm" variant="outline" onClick={lockAgain}>
            Verrouiller
          </Button>
        </div>
      )}

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

      {/* Contenu EA verrouillé / débloqué */}
      {!unlocked ? (
        <section className="mt-10 rounded-2xl border border-border/80 bg-card/90 p-6 md:p-8">
          <div className="flex items-center gap-3">
            <Lock className="size-5 text-accent" />
            <div>
              <h3 className="font-display text-lg font-semibold">
                Téléchargement Premium (verrouillé)
              </h3>
              <p className="text-sm text-muted-foreground">
                Entre ton code en haut de cette page pour voir l’EA et le guide.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Button asChild variant="outline" size="sm">
              <a href="#code-acces">Aller coller mon code</a>
            </Button>
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
      
      {/* Admin : générer un code unique par client */}
      <section className="mt-12 rounded-2xl border border-dashed border-border/80 bg-elevated/20 p-5 md:p-6">
        <button
          type="button"
          className="flex w-full items-center justify-between text-left"
          onClick={() => setAdminOpen((v) => !v)}
        >
          <div>
            <p className="text-xs font-semibold tracking-wide text-subtle uppercase">
              Réservé au propriétaire
            </p>
            <h2 className="font-display text-base font-semibold">
              Générer un code Premium (1 client)
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">
            {adminOpen ? "Masquer" : "Ouvrir"}
          </span>
        </button>
        {adminOpen ? (
          <div className="mt-4 space-y-3 border-t border-border/60 pt-4">
            <p className="text-xs text-muted-foreground">
              Après vérification du paiement, génère un code unique (ex. 30 jours),
              envoie-le sur WhatsApp. Le client le colle en haut de cette page.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="admin-pass">Mot de passe admin</Label>
                <Input
                  id="admin-pass"
                  type="password"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  placeholder="PREMIUM_ADMIN_PASSWORD"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="gen-days">Durée (jours)</Label>
                <Input
                  id="gen-days"
                  type="number"
                  min={1}
                  max={365}
                  value={genDays}
                  onChange={(e) => setGenDays(Number(e.target.value) || 30)}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="gen-note">Note (optionnel, ex. prénom client)</Label>
              <Input
                id="gen-note"
                value={genNote}
                onChange={(e) => setGenNote(e.target.value)}
                placeholder="Jean — MTN 17/10"
                className="mt-1"
              />
            </div>
            <Button
              type="button"
              disabled={busy || !adminPass.trim()}
              onClick={() => void onGenerateCode()}
            >
              Générer le code
            </Button>
            {generated ? (
              <div className="rounded-xl border border-accent/40 bg-background p-4">
                <p className="text-xs text-muted-foreground">
                  Code à envoyer au client
                  {genExp ? ` · valable jusqu’au ${genExp}` : ""}
                </p>
                <code className="mt-2 block break-all font-mono text-sm text-foreground">
                  {generated}
                </code>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="mt-3"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(generated);
                      toast.success("Code copié");
                    } catch {
                      toast.error("Copie impossible");
                    }
                  }}
                >
                  Copier le code
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

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
