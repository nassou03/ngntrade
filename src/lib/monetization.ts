/**
 * Revenus passifs sans coût de départ.
 * - Hébergement : Vercel Hobby (gratuit)
 * - Marchés : API gratuites
 * - IA : XAI_API_KEY (crédits xAI)
 * - Affiliés : VITE_AFFILIATE_* (voir PARTNERS)
 * - Premium : page /premium prête ; Stripe plus tard
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
 * Liens partenaires affichés dans le footer.
 * Configure chaque URL sur Vercel → Environment Variables, puis Redeploy.
 *
 * Variables supportées :
 * - VITE_AFFILIATE_XM
 * - VITE_AFFILIATE_BINANCE
 * - VITE_AFFILIATE_OKX
 * - VITE_AFFILIATE_BROKER (générique / autre broker)
 * - VITE_AFFILIATE_PROP
 * - VITE_AFFILIATE_CHART
 */
export const PARTNERS: Partner[] = [
  {
    id: "xm",
    name: "XM",
    blurb: "Broker Forex & CFD — compte démo et exécution.",
    href: envLink(
      "VITE_AFFILIATE_XM",
      "https://www.xm.com",
    ),
    tag: "Forex",
  },
  {
    id: "binance",
    name: "Binance",
    blurb: "Exchange crypto — spot, futures, compte débutant.",
    href: envLink(
      "VITE_AFFILIATE_BINANCE",
      "https://www.binance.com",
    ),
    tag: "Crypto",
  },
  {
    id: "okx",
    name: "OKX",
    blurb: "Exchange crypto & dérivés — alternative multi-produits.",
    href: envLink(
      "VITE_AFFILIATE_OKX",
      "https://www.okx.com",
    ),
    tag: "Crypto",
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

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Gratuit",
    tagline: "Pour démarrer et apprendre.",
    priceLabel: "0 €",
    features: [
      "Marchés live (forex, crypto, matières, indices)",
      "Journal et dashboard locaux",
      "Calendrier de sessions",
      "Analyses IA selon tes crédits xAI",
      "Copilote de session",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Quand le trafic et les affiliations tournent.",
    priceLabel: "9,90 €",
    period: "mois",
    highlighted: true,
    features: [
      "Tout le plan Gratuit",
      "Quota d’analyses IA inclus (à brancher)",
      "Historique cloud (auth + DB plus tard)",
      "Priorité de traitement",
      "Sans liens d’affiliation imposés",
    ],
  },
];

export const LEGAL_DISCLAIMER =
  "Ngntrade fournit une aide à la lecture technique à but éducatif. Ce n’est pas un conseil en investissement, ni une recommandation d’achat ou de vente. Les marchés comportent un risque de perte en capital. Vous restez seul responsable de vos décisions.";
