import type {
  ChartAnalysis,
  ConfluenceItem,
  Grade,
  OverlayAxis,
  PlanWarning,
} from "./types";

/**
 * Contrôles déterministes appliqués APRÈS la réponse de l'IA.
 * L'IA lit le graphique ; l'application vérifie l'arithmétique et la cohérence.
 */

export function priceToY(price: number, axis: OverlayAxis): number | null {
  if (!axis.reliable) return null;
  const { y1, p1, y2, p2, log } = axis;
  const f = log ? Math.log : (v: number) => v;
  if (log && (price <= 0 || p1 <= 0 || p2 <= 0)) return null;
  const d = f(p2) - f(p1);
  if (!Number.isFinite(d) || d === 0) return null;
  const y = y1 + ((f(price) - f(p1)) * (y2 - y1)) / d;
  if (!Number.isFinite(y)) return null;
  return y;
}

export function confluenceScore(items: ConfluenceItem[] | undefined): number | undefined {
  if (!items || items.length === 0) return undefined;
  let pts = 0;
  for (const it of items) {
    if (it.status === "pass") pts += 1;
    else if (it.status === "unknown") pts += 0.35;
  }
  return Math.round((pts / items.length) * 100);
}

export function checkPlan(a: ChartAnalysis): {
  warnings: PlanWarning[];
  rrs: number[];
  riskReward: number;
  confluenceScore: number | undefined;
  confluence: ConfluenceItem[] | undefined;
  grade: Grade;
} {
  const w: PlanWarning[] = [];
  const s = a.setup;
  const dir = s.direction;
  const entry = s.sniperEntry || (s.entryMin + s.entryMax) / 2;
  let rrs: number[] = [];
  let atrK: number | null = null;
  // En « wait », les prix décrivent le scénario surveillé : on les contrôle aussi.
  const planDir = dir !== "wait" ? dir : s.watchDirection;

  if (planDir) {
    const sl = s.stopLoss;
    const tps = s.takeProfits;
    if (!entry || !sl) {
      w.push({ level: "error", text: "Entrée ou stop manquant : le plan n'est pas exploitable." });
    } else {
      const slOk = planDir === "long" ? sl < entry : sl > entry;
      if (!slOk) {
        w.push({
          level: "error",
          text: `Le stop (${sl}) est du mauvais côté de l'entrée pour un ${planDir === "long" ? "achat" : "vente"}.`,
        });
      }
      const wrongTp = tps.filter((tp) => (planDir === "long" ? tp <= entry : tp >= entry));
      if (wrongTp.length) {
        w.push({
          level: "error",
          text: "Au moins une cible est du mauvais côté de l'entrée — ignorez-la.",
        });
      }
      const risk = Math.abs(entry - sl);
      if (risk > 0 && slOk) {
        rrs = tps
          .filter((tp) => (planDir === "long" ? tp > entry : tp < entry))
          .map((tp) => Math.round((Math.abs(tp - entry) / risk) * 100) / 100);
        if (rrs.length && rrs[0] < 1) {
          w.push({ level: "warn", text: `R:R vers TP1 de ${rrs[0].toFixed(2)} : sous 1R, le trade coûte plus qu'il ne rapporte.` });
        } else if (rrs.length && rrs[0] < 1.5) {
          w.push({ level: "info", text: `R:R vers TP1 de ${rrs[0].toFixed(2)} : sous 1,5R, visez la cible suivante pour valider.` });
        }
        if (!rrs.length) w.push({ level: "warn", text: "Aucune cible valide : définissez vos objectifs avant d'entrer." });
        if (rrs.length && rrs[0] > 6) {
          w.push({ level: "info", text: `R:R vers TP1 de ${rrs[0].toFixed(1)} : très élevé, souvent le signe d'un stop trop serré.` });
        }
        if (a.atr && a.atr > 0) {
          const k = risk / a.atr;
          atrK = k;
          if (k < 0.7 || k > 1.6) {
            const sugSl = planDir === "long" ? entry - a.atr : entry + a.atr;
            const sugRr = rrs.length ? Math.round((Math.abs(tps.filter((tp) => (planDir === "long" ? tp > entry : tp < entry))[0] - entry) / a.atr) * 100) / 100 : 0;
            w.push({
              level: "warn",
              text:
                (k < 0.7
                  ? `Stop très serré : ${k.toFixed(2)} ATR, risque de sortie sur le bruit.`
                  : `Stop large : ${k.toFixed(2)} ATR, réduisez la taille de position.`) +
                ` Repère à 1 ATR : ${Math.round(sugSl * 100) / 100}${sugRr ? ` (R:R vers TP1 ≈ ${sugRr.toFixed(2)})` : ""}.`,
            });
          }
        }
      }
      if (a.currentPrice > 0 && Math.abs(entry - a.currentPrice) / a.currentPrice > 0.03) {
        w.push({
          level: "warn",
          text: "L'entrée est à plus de 3 % du prix lu : vérifiez l'échelle de l'axe sur votre graphique.",
        });
      }
      if (s.entryMin && s.entryMax && (entry < Math.min(s.entryMin, s.entryMax) * 0.9999 || entry > Math.max(s.entryMin, s.entryMax) * 1.0001)) {
        w.push({ level: "info", text: "L'entrée sniper est hors de la zone d'entrée indiquée." });
      }
    }
  }

  if (a.imageQuality?.tradeability === "low") {
    w.push({ level: "warn", text: "Capture difficile à lire : refaites-la avec prix et temps visibles." });
  }
  if (a.overlay && !a.overlay.axis.reliable) {
    w.push({ level: "info", text: "Axe des prix non calibrable : le graphique annoté n'est pas affiché." });
  }

  // Deux critères sont recalculés par l'app : ils écrasent l'avis de l'IA quand les chiffres existent.
  const confluence = a.confluence?.map((c) => {
    if (c.id === "rr_min" && rrs.length) {
      const ok = rrs[0] >= 1.5;
      return { ...c, status: ok ? ("pass" as const) : ("fail" as const), note: `R:R vers TP1 = ${rrs[0].toFixed(2)} (calculé par l'app).` };
    }
    if (c.id === "atr_stop" && atrK != null) {
      const ok = atrK >= 0.7 && atrK <= 1.6;
      return { ...c, status: ok ? ("pass" as const) : ("fail" as const), note: `Stop = ${atrK.toFixed(2)} ATR (calculé par l'app).` };
    }
    return c;
  });
  const score = confluenceScore(confluence);
  const atrBad = atrK != null && (atrK < 0.7 || atrK > 1.6);
  const hasError = w.some((x) => x.level === "error");
  let grade: Grade = "C";
  if (dir === "wait") grade = "none";
  else if (!hasError && !atrBad && (score ?? 0) >= 75 && (rrs[0] ?? 0) >= 1.5) grade = "A";
  else if (!hasError && (score ?? 0) >= 55 && (rrs[0] ?? 0) >= 1) grade = "B";

  return {
    warnings: w,
    rrs,
    riskReward: rrs[0] ?? 0,
    confluenceScore: score,
    confluence,
    grade,
  };
}
