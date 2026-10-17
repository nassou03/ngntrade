import { useState } from "react";
import { Check, Copy, ExternalLink, Smartphone, Bitcoin, CreditCard, Webhook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ENABLED_PAYMENT_METHODS,
  WHATSAPP_URL,
  type PaymentMethod,
} from "@/lib/monetization";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ICONS = {
  checkout: CreditCard,
  mtn: Smartphone,
  crypto: Bitcoin,
  api: Webhook,
} as const;

export function PaymentMethods({
  className,
  compact,
}: {
  className?: string;
  compact?: boolean;
}) {
  const methods = ENABLED_PAYMENT_METHODS;
  if (methods.length === 0) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-border/80 bg-card/80 p-5 text-sm text-muted-foreground",
          className,
        )}
      >
        <p className="font-medium text-foreground">Paiement bientôt disponible</p>
        <p className="mt-2 text-xs leading-relaxed">
          Configure sur Vercel :{" "}
          <code className="text-[10px]">VITE_PREMIUM_CHECKOUT</code>,{" "}
          <code className="text-[10px]">VITE_PAY_MTN_NUMBER</code>,{" "}
          <code className="text-[10px]">VITE_PAY_CRYPTO_URL</code> ou{" "}
          <code className="text-[10px]">VITE_PAY_API_URL</code>, puis Redeploy.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">
          Choisir un mode de paiement
        </p>
        <Badge variant="outline">{methods.length} option{methods.length > 1 ? "s" : ""}</Badge>
      </div>
      <div className={cn("grid gap-3", compact ? "sm:grid-cols-1" : "sm:grid-cols-2")}>
        {methods.map((m) => (
          <PaymentCard key={m.id} method={m} />
        ))}
      </div>
      {WHATSAPP_URL.trim() ? (
        <p className="text-[11px] text-subtle">
          Après MTN ou crypto : envoie la capture de paiement sur{" "}
          <a
            href={WHATSAPP_URL.trim()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            WhatsApp
          </a>{" "}
          pour recevoir ton code d’accès Premium.
        </p>
      ) : (
        <p className="text-[11px] text-subtle">
          Après paiement manuel (MTN / crypto), envoie la preuve au support pour
          recevoir le code. Configure aussi{" "}
          <code className="text-[10px]">VITE_WHATSAPP_URL</code>.
        </p>
      )}
    </div>
  );
}

function PaymentCard({ method }: { method: PaymentMethod }) {
  const Icon = ICONS[method.id] ?? CreditCard;
  const [copied, setCopied] = useState(false);

  async function copyDetail() {
    if (!method.detail) return;
    try {
      await navigator.clipboard.writeText(method.detail);
      setCopied(true);
      toast.success("Copié");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copie impossible");
    }
  }

  return (
    <div className="card-lift flex flex-col rounded-2xl border border-border/80 bg-card/90 p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-elevated/60">
          <Icon className="size-4 text-accent" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-semibold">{method.label}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {method.description}
          </p>
        </div>
      </div>
      {method.detail ? (
        <div className="mt-3 rounded-xl border border-border/60 bg-elevated/40 px-3 py-2">
          <p className="text-[10px] tracking-wide text-subtle uppercase">
            {method.detailLabel ?? "Détail"}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate font-mono text-xs">
              {method.detail}
            </code>
            <Button type="button" size="sm" variant="ghost" onClick={() => void copyDetail()}>
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            </Button>
          </div>
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {method.href ? (
          <Button asChild size="sm" className="flex-1">
            <a href={method.href} target="_blank" rel="noopener noreferrer">
              Payer
              <ExternalLink className="size-3.5" />
            </a>
          </Button>
        ) : method.detail ? (
          <Button type="button" size="sm" className="flex-1" onClick={() => void copyDetail()}>
            {copied ? "Copié" : "Copier pour payer"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
