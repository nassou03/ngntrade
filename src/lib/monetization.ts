/**
 * Revenus passifs sans coût de départ.
 * - Hébergement : Vercel Hobby (gratuit)
 * - Marchés : API gratuites
 * - IA : XAI_API_KEY (crédits xAI)
 * - Affiliés : VITE_AFFILIATE_BROKER / _PROP / _CHART
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

/** Liens partenaires — remplace par tes URLs d'affiliation. */
export const PARTNERS: Partner[] = [
  {
    id: "broker-fx",
    name: "Broker Forex / CFD",
    blurb: "Compte démo + exécution. Colle ton lien d'affiliation.",
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
    tag: "Affiliation",
  },
  {
    id: "data",
    name: "Outils charting",
    blurb: "TradingView et équivalents : programme partenaire souvent gratuit.",
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
