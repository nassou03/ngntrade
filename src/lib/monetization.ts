/**
 * Revenus passifs sans coût de départ.
 * - Hébergement : Vercel Hobby (gratuit)
 * - Marchés : API gratuites
 * - IA : ANTHROPIC_API_KEY (Claude) ou XAI_API_KEY
 * - Affiliés : VITE_AFFILIATE_* (voir PARTNERS)
 * - Premium : lien externe VITE_PREMIUM_CHECKOUT (Gumroad / Lemon Squeezy / etc.)
 */

export type Partner = {
  id: string;
  name: string;
  blurb: string;
  href: string;
  tag: string;
};

export type Plan = {
  id: "free" | "premium";
  name: string;
  tagline: string;
  priceLabel: string;
  period?: string;
  highlighted?: boolean;
  features: string[];
};

function envLink(key: string, fallback: string) {
  if (typeof import.meta !== "undefined" && import.meta.env?.[key]) {
    return String(import.meta.env[key]);
  }
  return fallback;
}

/**
 * Lien de paiement Premium (Gumroad, BuyMeACoffee, Lemon Squeezy…).
 * Vercel → Environment Variables → VITE_PREMIUM_CHECKOUT = https://...
 * Puis Redeploy.
 */
export const PREMIUM_CHECKOUT_URL = envLink(
  "VITE_PREMIUM_CHECKOUT",
  "",
);

/**
 * Code d'accès livré après achat (email Gumroad / message manuel).
 * Vercel → VITE_PREMIUM_ACCESS_CODE = ton-code-secret
 */
export const PREMIUM_ACCESS_CODE = envLink(
  "VITE_PREMIUM_ACCESS_CODE",
  "",
);

export const PREMIUM_STORAGE_KEY = "ngn_premium_unlocked";

/**
 * Bouton WhatsApp flottant.
 * Vercel → VITE_WHATSAPP_URL = https://wa.me/33700000000?text=Bonjour
 * (indicatif pays sans + ni 00, ex. 33 pour la France, 225 pour la Côte d'Ivoire)
 */
export const WHATSAPP_URL = envLink("VITE_WHATSAPP_URL", "");

export type PaymentMethodId =
  | "checkout"
  | "mtn"
  | "crypto"
  | "api";

export type PaymentMethod = {
  id: PaymentMethodId;
  label: string;
  description: string;
  /** Lien externe (Gumroad, NOWPayments, CinetPay…) */
  href?: string;
  /** Infos à copier (numéro MoMo, adresse wallet) */
  detail?: string;
  /** Label du détail (ex. Numéro MTN) */
  detailLabel?: string;
  enabled: boolean;
};

/**
 * Moyens de paiement Premium — tout configurable via variables Vercel.
 *
 * Carte / Gumroad :
 *   VITE_PREMIUM_CHECKOUT=https://...
 *
 * MTN Mobile Money (manuel ou lien CinetPay/Flutterwave) :
 *   VITE_PAY_MTN_NUMBER=22901XXXXXXX
 *   VITE_PAY_MTN_NAME=Ton Nom
 *   VITE_PAY_MTN_URL=https://...   (optionnel — lien API agrégateur)
 *
 * Crypto :
 *   VITE_PAY_CRYPTO_URL=https://nowpayments.io/...
 *   VITE_PAY_CRYPTO_ADDRESS=TXxx...   (USDT TRC20 ou autre)
 *   VITE_PAY_CRYPTO_NETWORK=USDT TRC20
 *
 * Agrégateur / API (CinetPay, Paystack, Flutterwave, Stripe…) :
 *   VITE_PAY_API_URL=https://checkout...
 *   VITE_PAY_API_LABEL=CinetPay
 */
function buildPaymentMethods(): PaymentMethod[] {
  const checkout = PREMIUM_CHECKOUT_URL.trim();
  const mtnNumber = envLink("VITE_PAY_MTN_NUMBER", "").trim();
  const mtnName = envLink("VITE_PAY_MTN_NAME", "").trim();
  const mtnUrl = envLink("VITE_PAY_MTN_URL", "").trim();
  const cryptoUrl = envLink("VITE_PAY_CRYPTO_URL", "").trim();
  const cryptoAddress = envLink("VITE_PAY_CRYPTO_ADDRESS", "").trim();
  const cryptoNetwork = envLink("VITE_PAY_CRYPTO_NETWORK", "USDT / BTC").trim();
  const apiUrl = envLink("VITE_PAY_API_URL", "").trim();
  const apiLabel = envLink("VITE_PAY_API_LABEL", "Paiement API").trim();

  const methods: PaymentMethod[] = [
    {
      id: "checkout",
      label: "Carte / Gumroad",
      description: "Paiement en ligne sécurisé (carte, PayPal selon le prestataire).",
      href: checkout || undefined,
      enabled: Boolean(checkout),
    },
    {
      id: "mtn",
      label: "MTN Mobile Money",
      description: mtnName
        ? `Envoie le montant à ${mtnName}, puis envoie la preuve sur WhatsApp pour recevoir ton code.`
        : "Mobile Money MTN — configure le numéro sur Vercel, puis envoie la preuve pour le code d’accès.",
      href: mtnUrl || undefined,
      detail: mtnNumber || undefined,
      detailLabel: mtnNumber ? "Numéro MTN MoMo" : undefined,
      enabled: Boolean(mtnNumber || mtnUrl),
    },
    {
      id: "crypto",
      label: "Cryptomonnaie",
      description: `Paiement crypto (${cryptoNetwork}). Après confirmation réseau, tu reçois le code d’accès.`,
      href: cryptoUrl || undefined,
      detail: cryptoAddress || undefined,
      detailLabel: cryptoAddress ? `Adresse ${cryptoNetwork}` : undefined,
      enabled: Boolean(cryptoUrl || cryptoAddress),
    },
    {
      id: "api",
      label: apiLabel || "Paiement API",
      description:
        "Checkout via agrégateur (CinetPay, Flutterwave, Paystack, Stripe…).",
      href: apiUrl || undefined,
      enabled: Boolean(apiUrl),
    },
  ];
  return methods;
}

export const PAYMENT_METHODS = buildPaymentMethods();

export const ENABLED_PAYMENT_METHODS = PAYMENT_METHODS.filter((m) => m.enabled);

export function hasAnyPaymentMethod() {
  return ENABLED_PAYMENT_METHODS.length > 0;
}


export const PARTNERS: Partner[] = [
  {
    id: "xm",
    name: "XM",
    blurb: "Broker Forex & CFD — compte démo et exécution.",
    href: envLink("VITE_AFFILIATE_XM", "https://www.xm.com"),
    tag: "Forex",
  },
  {
    id: "binance",
    name: "Binance",
    blurb: "Exchange crypto — spot, futures, compte débutant.",
    href: envLink("VITE_AFFILIATE_BINANCE", "https://www.binance.com"),
    tag: "Crypto",
  },
  {
    id: "exness",
    name: "Exness",
    blurb: "Broker Forex & CFD — exécution et compte démo.",
    href: envLink("VITE_AFFILIATE_EXNESS", "https://www.exness.com"),
    tag: "Forex",
  },
  {
    id: "broker-fx",
    name: "Autre broker",
    blurb: "Lien générique si tu as un 4ᵉ partenaire Forex/CFD.",
    href: envLink(
      "VITE_AFFILIATE_BROKER",
      "https://www.google.com/search?q=broker+forex+affiliation",
    ),
    tag: "Affiliation",
  },
  {
    id: "prop",
    name: "Prop firm / challenge",
    blurb: "Programme partenaire prop firm quand tu en as un.",
    href: envLink(
      "VITE_AFFILIATE_PROP",
      "https://www.google.com/search?q=prop+firm+affiliation",
    ),
    tag: "Prop",
  },
  {
    id: "data",
    name: "TradingView",
    blurb: "Charting pro — programme partenaire souvent gratuit.",
    href: envLink("VITE_AFFILIATE_CHART", "https://www.tradingview.com"),
    tag: "Outils",
  },
];

/** Partenaires mis en avant sur la page Premium (les 3 brokers principaux). */
export const PREMIUM_PARTNERS = PARTNERS.filter((p) =>
  ["xm", "binance", "exness"].includes(p.id),
);

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Gratuit",
    tagline: "Pour démarrer et apprendre — sans carte bancaire.",
    priceLabel: "0 €",
    features: [
      "Marchés live (forex, crypto, matières, indices)",
      "Analyzer IA selon tes crédits Claude / xAI",
      "Journal et performance (local)",
      "Calendrier de sessions",
      "Copilote de session",
      "Liens partenaires brokers",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Pack outils MT5 + support contenu — paiement externe.",
    priceLabel: "9,90 €",
    period: "mois",
    highlighted: true,
    features: [
      "Tout le plan Gratuit",
      "EA SMC MultiSetup PRO v5.30 (.mq5)",
      "Guide d’installation MetaTrader 5",
      "Paramètres recommandés (risque / sessions)",
      "Mises à jour du bot quand disponibles",
      "Accès prioritaire aux nouveaux outils",
    ],
  },
];

export const LEGAL_DISCLAIMER =
  "Ngntrade fournit une aide à la lecture technique à but éducatif. Ce n’est pas un conseil en investissement, ni une recommandation d’achat ou de vente. Les marchés comportent un risque de perte en capital. Les liens affiliés peuvent générer une commission pour Ngntrade sans coût supplémentaire pour vous. L’EA MT5 place des ordres s’il est activé en réel : backtest et compte démo obligatoires. Vous restez seul responsable de vos décisions.";
