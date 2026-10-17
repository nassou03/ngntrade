export type Impact = "high" | "medium" | "low";

export type MacroEvent = {
  id: string;
  at: string;
  currency: string;
  title: string;
  impact: Impact;
  actual?: string;
  forecast?: string;
  previous?: string;
  market: string;
  /** Lecture éducative attendue avant / après la sortie */
  playbook: string;
};

export const CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CNY",
  "AUD",
  "CAD",
] as const;

export const MACRO_EVENTS: MacroEvent[] = [
  {
    id: "cpi-us-oct",
    at: "2026-10-15T12:30:00.000Z",
    currency: "USD",
    title: "CPI US (YoY)",
    impact: "high",
    forecast: "2.7%",
    previous: "2.8%",
    actual: "2.6%",
    market: "USD, or, NAS100, BTC",
    playbook:
      "Inflation US = driver n°1 des taux réels. Sous le consensus → USD souvent plus faible, or et tech en soutien. Au-dessus → USD fort, pression sur indices risqués. Éviter les nouvelles positions 15 min avant / 15 min après.",
  },
  {
    id: "core-cpi-oct",
    at: "2026-10-15T12:30:00.000Z",
    currency: "USD",
    title: "Core CPI (MoM)",
    impact: "high",
    forecast: "0.2%",
    previous: "0.2%",
    actual: "0.2%",
    market: "USD, indices",
    playbook:
      "Le core guide la Fed plus que le headline. Inline = volatilité courte puis retour technique. Surprise ≥0,1 pt = mouvement directionnel possible sur DXY et yields.",
  },
  {
    id: "ecb-minutes",
    at: "2026-10-16T12:30:00.000Z",
    currency: "EUR",
    title: "Comptes rendus BCE",
    impact: "medium",
    market: "EURUSD, DAX",
    playbook:
      "Ton plus hawkish que le prix → EUR haussier. Ton dovish / division du Conseil → EUR sous pression. Mouvement souvent plus contenu qu’une décision de taux.",
  },
  {
    id: "eia-oct16",
    at: "2026-10-16T14:30:00.000Z",
    currency: "USD",
    title: "Stocks de pétrole EIA",
    impact: "medium",
    forecast: "-1.2M",
    previous: "-0.8M",
    market: "WTI, USDCAD",
    playbook:
      "Draw plus fort que prévu → WTI en hausse. Build inattendu → WTI baisse. Impact limité hors énergie sauf mouvement extrême.",
  },
  {
    id: "jobless-oct16",
    at: "2026-10-16T12:30:00.000Z",
    currency: "USD",
    title: "Inscriptions chômage US",
    impact: "medium",
    forecast: "228K",
    previous: "223K",
    market: "USD",
    playbook:
      "Hausse nette vs consensus = signal de ralentissement (USD souvent plus faible). Baisse nette = marché du travail solide (USD soutenu). Moins volatil que NFP.",
  },
  {
    id: "uk-cpi",
    at: "2026-10-15T06:00:00.000Z",
    currency: "GBP",
    title: "CPI Royaume-Uni (YoY)",
    impact: "high",
    forecast: "2.9%",
    previous: "3.1%",
    actual: "2.8%",
    market: "GBPUSD, UK100",
    playbook:
      "Inflation UK guide la BoE. Sous consensus → GBP plus faible, espoir de baisse de taux. Au-dessus → GBP plus ferme. Surveiller le core si publié en même temps.",
  },
  {
    id: "china-gdp",
    at: "2026-10-17T02:00:00.000Z",
    currency: "CNY",
    title: "PIB Chine (YoY)",
    impact: "high",
    forecast: "4.8%",
    previous: "4.7%",
    market: "AUD, cuivre, indices Asie",
    playbook:
      "Surprise positive → AUD, cuivre et indices Asie souvent soutenus. Déception → pression risk-off sur les actifs liés à la Chine. Peu d’impact direct EUR/USD.",
  },
  {
    id: "retail-us",
    at: "2026-10-17T12:30:00.000Z",
    currency: "USD",
    title: "Ventes au détail US",
    impact: "high",
    forecast: "0.3%",
    previous: "0.4%",
    market: "USD, indices",
    playbook:
      "Consommation US = pilier de la croissance. Fort vs consensus → USD et indices cycliques. Faible → crainte de ralentissement, possible soutien de l’or.",
  },
  {
    id: "michigan",
    at: "2026-10-17T14:00:00.000Z",
    currency: "USD",
    title: "Confiance Michigan (prélim.)",
    impact: "medium",
    forecast: "70.5",
    previous: "69.8",
    market: "USD",
    playbook:
      "Indicateur de sentiment. Écart important sur les anticipations d’inflation (5 ans) peut bouger les taux plus que l’indice global.",
  },
  {
    id: "boj-speak",
    at: "2026-10-20T05:00:00.000Z",
    currency: "JPY",
    title: "Discours BoJ",
    impact: "medium",
    market: "USDJPY, USD",
    playbook:
      "Ton restrictif → JPY plus fort (USDJPY baisse). Status quo dovish → JPY faible. Volatilité souvent concentrée dans les minutes qui suivent les titres Reuters.",
  },
  {
    id: "pmi-eu",
    at: "2026-10-23T08:00:00.000Z",
    currency: "EUR",
    title: "PMI composite zone euro (flash)",
    impact: "high",
    forecast: "50.2",
    previous: "49.8",
    market: "EUR, DAX",
    playbook:
      "Passage au-dessus de 50 = expansion → EUR et DAX souvent soutenus. Retour sous 50 = contraction → pression EUR. Watch manufacturing vs services.",
  },
  {
    id: "pmi-us",
    at: "2026-10-23T13:45:00.000Z",
    currency: "USD",
    title: "PMI services US (flash)",
    impact: "high",
    forecast: "51.0",
    previous: "50.6",
    market: "USD, NAS100",
    playbook:
      "Services = gros du PIB US. Surprise à la hausse → USD et equities. À la baisse → risk-off possible si le chiffre casse 50.",
  },
  {
    id: "gdp-us",
    at: "2026-10-30T12:30:00.000Z",
    currency: "USD",
    title: "PIB US (avance, QoQ annualisé)",
    impact: "high",
    forecast: "2.4%",
    previous: "2.1%",
    market: "USD, indices",
    playbook:
      "Lecture de croissance. Au-dessus du consensus + consommation solide → USD ferme. Déception forte → pression sur le dollar et soutien rates-sensitive.",
  },
  {
    id: "pce-us",
    at: "2026-10-31T12:30:00.000Z",
    currency: "USD",
    title: "Core PCE (MoM)",
    impact: "high",
    forecast: "0.2%",
    previous: "0.2%",
    market: "USD, or, indices",
    playbook:
      "Mesure d’inflation préférée de la Fed. C’est le high impact « rates ». Surprise hawkish = USD/or réaction inverse classique. Planifier hors fenêtre de release.",
  },
  {
    id: "nfp-nov",
    at: "2026-11-07T13:30:00.000Z",
    currency: "USD",
    title: "Non-Farm Payrolls",
    impact: "high",
    forecast: "140K",
    previous: "148K",
    market: "USD, indices, or, BTC",
    playbook:
      "NFP = max volatilité USD. Écart >50K vs consensus = mouvement violent possible. Ne pas laisser de positions non protégées à l’approche de 13:30 UTC. Attendre le digeste 5–15 min.",
  },
  {
    id: "unrate-nov",
    at: "2026-11-07T13:30:00.000Z",
    currency: "USD",
    title: "Taux de chômage US",
    impact: "high",
    forecast: "4.2%",
    previous: "4.1%",
    market: "USD",
    playbook:
      "Hausse du chômage = signal soft (USD souvent plus faible). Baisse = marché du travail tendu. Lu avec les salaires horaires moyens.",
  },
  {
    id: "fomc-nov",
    at: "2026-11-05T18:00:00.000Z",
    currency: "USD",
    title: "Décision de taux FOMC",
    impact: "high",
    forecast: "4.00%",
    previous: "4.25%",
    market: "USD, or, indices, BTC",
    playbook:
      "Décision + dots + conf Powell. Le mouvement vient souvent du ton (press conference) plus que du taux lui-même si celui-ci est déjà pricé. Fenêtre 18:00–19:30 UTC très agitée.",
  },
  {
    id: "ecb-nov",
    at: "2026-10-30T12:15:00.000Z",
    currency: "EUR",
    title: "Décision de taux BCE",
    impact: "high",
    forecast: "2.00%",
    previous: "2.00%",
    market: "EUR, DAX",
    playbook:
      "Si le taux est inchangé, c’est le communiqué + Lagarde qui dirigent EURUSD. Hawkish hold → EUR up. Ouverture de porte à une baisse → EUR down.",
  },
  {
    id: "boe-nov",
    at: "2026-11-06T12:00:00.000Z",
    currency: "GBP",
    title: "Décision BoE",
    impact: "high",
    forecast: "4.00%",
    previous: "4.00%",
    market: "GBPUSD, UK100",
    playbook:
      "Votes du MPC et ton du gouverneur comptent autant que le taux. Divergence vs BCE/Fed = mouvement cross GBP.",
  },
  {
    id: "cad-cpi",
    at: "2026-10-21T12:30:00.000Z",
    currency: "CAD",
    title: "CPI Canada (YoY)",
    impact: "medium",
    forecast: "2.1%",
    previous: "2.0%",
    market: "USDCAD, WTI",
    playbook:
      "Inflation CAD influence la BoC. Surprise haute → CAD plus fort (USDCAD down). Lier aussi au pétrole si WTI bouge le même jour.",
  },
  {
    id: "aud-emp",
    at: "2026-10-16T00:30:00.000Z",
    currency: "AUD",
    title: "Emploi Australie",
    impact: "high",
    forecast: "25.0K",
    previous: "18.0K",
    actual: "32.0K",
    market: "AUDUSD, indices Asie",
    playbook:
      "Emploi AU très suivi pour la RBA. Fort vs consensus → AUD haussier. Faible → AUD sous pression. Corrélation fréquente avec le sentiment Chine.",
  },
  {
    id: "jpy-cpi",
    at: "2026-10-24T23:30:00.000Z",
    currency: "JPY",
    title: "CPI Tokyo (YoY)",
    impact: "medium",
    forecast: "2.3%",
    previous: "2.5%",
    market: "USDJPY",
    playbook:
      "Proxy d’inflation nationale. Persistante au-dessus de 2 % alimente les paris de resserrement BoJ → JPY plus fort.",
  },
];

/** Parse un nombre depuis "148K", "2.8%", "-1.2M" */
export function parseMacroNumber(raw?: string): number | null {
  if (!raw) return null;
  const s = raw.trim().replace(/\s/g, "").replace(",", ".");
  const m = s.match(/^([+-]?\d+(?:\.\d+)?)(K|M|B|%)?$/i);
  if (!m) return null;
  let n = parseFloat(m[1]);
  const u = (m[2] || "").toUpperCase();
  if (u === "K") n *= 1_000;
  if (u === "M") n *= 1_000_000;
  if (u === "B") n *= 1_000_000_000;
  return n;
}

export type Surprise = "beat" | "miss" | "inline" | "pending";

/**
 * Compare réel vs consensus (éducatif, pas un signal).
 * Pour chômage / inscriptions, "plus haut" = miss économique classique.
 */
export function getSurprise(event: MacroEvent): {
  kind: Surprise;
  label: string;
  resultText: string;
} {
  if (event.actual == null || event.forecast == null) {
    return {
      kind: "pending",
      label: "En attente",
      resultText:
        "Chiffre non publié ou non renseigné. Utilise le playbook pour anticiper les scénarios consensus / surprise.",
    };
  }
  const a = parseMacroNumber(event.actual);
  const f = parseMacroNumber(event.forecast);
  if (a == null || f == null) {
    return {
      kind: "pending",
      label: "Lecture manuelle",
      resultText: `Réel ${event.actual} vs consensus ${event.forecast} — compare qualitativement selon l’indicateur.`,
    };
  }
  const invert =
    /chômage|jobless|inscriptions chômage|unemployment/i.test(event.title);
  const tol = Math.max(Math.abs(f) * 0.02, f === 0 ? 0.05 : Math.abs(f) * 0.01);
  const diff = a - f;
  if (Math.abs(diff) <= tol) {
    return {
      kind: "inline",
      label: "Inline",
      resultText: `Réel aligné sur le consensus (${event.actual} ≈ ${event.forecast}). Volatilité souvent courte : le marché digère puis revient vers les niveaux techniques.`,
    };
  }
  const beat = invert ? diff < 0 : diff > 0;
  if (beat) {
    return {
      kind: "beat",
      label: invert ? "Meilleur que prévu" : "Au-dessus du consensus",
      resultText: `Surprise haussière sur l’indicateur (${event.actual} vs ${event.forecast}). En règle générale : devise liée plus soutenue si l’indicateur est « fort » pour la banque centrale ; indices selon le régime risk-on/off du jour.`,
    };
  }
  return {
    kind: "miss",
    label: invert ? "Pire que prévu" : "Sous le consensus",
    resultText: `Surprise baissière (${event.actual} vs ${event.forecast}). Devise souvent plus faible si le chiffre contredit un scénario hawkish ; l’or peut réagir à l’inverse du USD sur les data US.`,
  };
}

export function eventsOnDay(isoDate: string) {
  return MACRO_EVENTS.filter((e) => e.at.slice(0, 10) === isoDate);
}
