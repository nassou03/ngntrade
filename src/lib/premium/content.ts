/**
 * Contenu Premium éditorial — playbook + fiches setups.
 * Pour mettre à jour le playbook sans redeploy : localStorage clé ngn_playbook_override
 * (section Admin sur /premium).
 */

export type SetupSheet = {
  id: string;
  title: string;
  session: string;
  bias: string;
  conditions: string[];
  entry: string;
  stop: string;
  targets: string;
  invalidation: string;
  mistakes: string[];
};

export const PLAYBOOK_DEFAULT = {
  updatedLabel: "Mise à jour type — adapte selon le calendrier du jour",
  bias:
    "Attendre confirmation H1 (structure + EMA). Éviter les 15 premières minutes de Londres et de NY si volatilité extrême (NFP, FOMC).",
  pairs: [
    "XAUUSD — privilégier si dollar faible / risk-on après data US",
    "EURUSD — focus killzone Londres (07:00–11:00 UTC)",
    "NAS100 / US30 — après open NY si biais H1 clair",
  ],
  avoid: [
    "Ne pas trader 30 min avant / après news High Impact (voir Calendrier)",
    "Pas d’entrée contre structure H1 sans confluence M15",
    "Spread large ou session morte (Asie pure sur indices US)",
  ],
  checklist: [
    "Biais H1 noté (bull / bear / range)",
    "Zone M15 identifiée (FVG / OB / S/R)",
    "SL ~1 ATR, R:R minimum 1:2 vers TP1",
    "News High du jour cochées",
  ],
};

export const SETUP_SHEETS: SetupSheet[] = [
  {
    id: "fvg-retest",
    title: "FVG + retest",
    session: "Londres ou NY",
    bias: "Aligné H1",
    conditions: [
      "Displacement fort créant un Fair Value Gap",
      "Prix revient combler partiellement le FVG (35–70 %)",
      "Pas de news High dans les 30 minutes",
    ],
    entry: "Limit dans le FVG (zone médiane) après réaction M5/M15",
    stop: "Au-delà du FVG / swing local · ~1 ATR",
    targets: "TP1 = 2R (50 %) · TP2 = 4R ou prochain S/R H1",
    invalidation: "Clôture M15 de l’autre côté du FVG avec volume",
    mistakes: [
      "Entrer au premier touch sans réaction",
      "SL trop serré dans le bruit",
      "Contre tendance H1 forte",
    ],
  },
  {
    id: "break-retest-h1",
    title: "Break & retest H1",
    session: "Londres (FX) · NY (indices)",
    bias: "Breakout structure H1",
    conditions: [
      "Cassure claire d’un swing H1 (corps de bougie)",
      "Retest de l’ancien niveau devenu support/résistance",
      "Confluence M15 (rejection, pin, engulfing)",
    ],
    entry: "Limit sur le retest ou market après confirmation M15",
    stop: "Sous/over le retest + buffer · ~1 ATR",
    targets: "Prochain swing H1 · TP partiel à 2R",
    invalidation: "Retest raté : clôture H1 de retour dans le range",
    mistakes: [
      "Chasser la cassure sans retest",
      "Ignorer un range H1 large",
      "Oversizing sur indices à l’open",
    ],
  },
  {
    id: "killzone-london",
    title: "Killzone Londres",
    session: "07:00–11:00 UTC",
    bias: "Continuation ou retournement selon Asian range",
    conditions: [
      "Asian range marqué",
      "Liquidité au-dessus/sous le range balayée",
      "Entrée dans le sens du déplacement post-sweep",
    ],
    entry: "Après sweep + displacement · limit sur pullback M15",
    stop: "Au-delà du sweep · ~1 ATR",
    targets: "Extension du range ×1.5–2 ou S/R H1",
    invalidation: "Prix revient durablement dans l’Asian range",
    mistakes: [
      "Trader avant 07:00 UTC par habitude",
      "Pas de plan si news UK/EU High",
      "Trop de trades dans la même killzone",
    ],
  },
  {
    id: "killzone-ny",
    title: "Killzone New York",
    session: "13:00–18:00 UTC",
    bias: "Souvent continuation Londres ou reversal post-data",
    conditions: [
      "Biais H1 noté avant 13:00",
      "Open NY : éviter les 5–15 premières minutes si chaos",
      "Setup M15 clair après stabilisation",
    ],
    entry: "FVG / OB M15 dans le sens H1",
    stop: "~1 ATR au-delà de la zone",
    targets: "2R puis structure H1",
    invalidation: "Structure M15 cassée contre le plan",
    mistakes: [
      "FOMO à l’open",
      "Trader NFP / FOMC sans règle stricte",
      "Oublier le spread sur XAU à l’open",
    ],
  },
  {
    id: "ob-mitigation",
    title: "Order Block mitigation",
    session: "Toutes (meilleur L/NY)",
    bias: "Aligné H1",
    conditions: [
      "Order Block H1 ou M15 non mitigé",
      "Approche en pullback (pas en chute libre)",
      "Confirmation M5 (rejection)",
    ],
    entry: "Limit dans l’OB (50–70 % de la zone)",
    stop: "Au-delà de l’OB · ~1 ATR",
    targets: "Liquidity pool opposé · 2R minimum",
    invalidation: "Mitigation complète + clôture hors zone",
    mistakes: [
      "OB trop large sans zone précise",
      "Contre un displacement violent",
      "Pas de confluence timeframe",
    ],
  },
];

export const DISCIPLINE_CHECKS = [
  { id: "plan", label: "J’ai un plan écrit (biais + zone + SL) avant l’entrée" },
  { id: "rr", label: "R:R minimum 1:2 respecté" },
  { id: "news", label: "Calendrier coché (pas de news High imminente)" },
  { id: "size", label: "Taille de position ≤ risque prévu (ex. 1 %)" },
  { id: "emotion", label: "Pas de revenge trade / FOMO" },
  { id: "session", label: "Session adaptée au setup (Londres / NY)" },
] as const;

export const PLAYBOOK_OVERRIDE_KEY = "ngn_playbook_override";
export const DISCIPLINE_KEY = "ngn_discipline_daily";

export type DisciplineDay = {
  date: string; // YYYY-MM-DD
  checks: Record<string, boolean>;
};

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function loadDiscipline(date = todayKey()): DisciplineDay {
  try {
    const raw = localStorage.getItem(DISCIPLINE_KEY);
    if (!raw) return { date, checks: {} };
    const all = JSON.parse(raw) as Record<string, DisciplineDay>;
    return all[date] ?? { date, checks: {} };
  } catch {
    return { date, checks: {} };
  }
}

export function saveDiscipline(day: DisciplineDay) {
  try {
    const raw = localStorage.getItem(DISCIPLINE_KEY);
    const all = raw ? (JSON.parse(raw) as Record<string, DisciplineDay>) : {};
    all[day.date] = day;
    // keep ~30 days
    const keys = Object.keys(all).sort();
    while (keys.length > 30) {
      delete all[keys.shift()!];
    }
    localStorage.setItem(DISCIPLINE_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

export function disciplineScore(checks: Record<string, boolean>): number {
  const total = DISCIPLINE_CHECKS.length;
  const ok = DISCIPLINE_CHECKS.filter((c) => checks[c.id]).length;
  return Math.round((ok / total) * 100);
}

export function loadPlaybookOverride(): Partial<typeof PLAYBOOK_DEFAULT> | null {
  try {
    const raw = localStorage.getItem(PLAYBOOK_OVERRIDE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<typeof PLAYBOOK_DEFAULT>;
  } catch {
    return null;
  }
}

export function savePlaybookOverride(data: Partial<typeof PLAYBOOK_DEFAULT>) {
  localStorage.setItem(PLAYBOOK_OVERRIDE_KEY, JSON.stringify(data));
}
