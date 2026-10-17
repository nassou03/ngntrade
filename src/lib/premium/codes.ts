/**
 * Codes Premium signés (un par client) + expiration.
 * Pas de base de données : le code contient sa date de fin et une signature.
 *
 * Vercel (server only, sans VITE_) :
 *   PREMIUM_CODE_SECRET=une-longue-phrase-secrete
 *   PREMIUM_ADMIN_PASSWORD=ton-mot-de-passe-admin
 *
 * Compatibilité : l'ancien VITE_PREMIUM_ACCESS_CODE reste accepté (sans expiration).
 */

import { createServerFn } from "@tanstack/react-start";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const PREMIUM_SESSION_KEY = "ngn_premium_session_v2";

type Session = {
  code: string;
  exp: number; // unix seconds, 0 = no expiry (legacy)
};

function getSecret(): string {
  return (
    process.env.PREMIUM_CODE_SECRET?.trim() ||
    process.env.PREMIUM_ACCESS_CODE?.trim() ||
    process.env.VITE_PREMIUM_ACCESS_CODE?.trim() ||
    ""
  );
}

function getAdminPassword(): string {
  return (
    process.env.PREMIUM_ADMIN_PASSWORD?.trim() ||
    process.env.PREMIUM_CODE_SECRET?.trim() ||
    ""
  );
}

function getLegacyCode(): string {
  return (
    process.env.VITE_PREMIUM_ACCESS_CODE?.trim() ||
    process.env.PREMIUM_ACCESS_CODE?.trim() ||
    ""
  );
}

function b64urlJson(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj), "utf8").toString("base64url");
}

function sign(payloadB64: string, secret: string): string {
  return createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64url")
    .slice(0, 24);
}

function safeEqual(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a);
    const bb = Buffer.from(b);
    if (ba.length !== bb.length) return false;
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

export type VerifyResult =
  | { ok: true; exp: number; legacy?: boolean }
  | { ok: false; error: string };

export function verifyCodeLocal(codeRaw: string): VerifyResult {
  const code = codeRaw.trim();
  if (!code) return { ok: false, error: "Code vide" };

  const legacy = getLegacyCode();
  if (legacy && safeEqual(code, legacy)) {
    return { ok: true, exp: 0, legacy: true };
  }

  const secret = getSecret();
  if (!secret) {
    return {
      ok: false,
      error:
        "Système de codes non configuré (PREMIUM_CODE_SECRET manquant sur Vercel).",
    };
  }

  // Format: NGN1.<payload>.<sig>
  const parts = code.split(".");
  if (parts.length !== 3 || parts[0] !== "NGN1") {
    return { ok: false, error: "Code invalide ou expiré" };
  }
  const [, payloadB64, sig] = parts;
  const expected = sign(payloadB64, secret);
  if (!safeEqual(sig, expected)) {
    return { ok: false, error: "Code invalide ou falsifié" };
  }

  let data: { e?: number; i?: string };
  try {
    data = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
  } catch {
    return { ok: false, error: "Code illisible" };
  }
  const exp = typeof data.e === "number" ? data.e : 0;
  const now = Math.floor(Date.now() / 1000);
  if (exp > 0 && now > exp) {
    return { ok: false, error: "Code expiré — demande un nouveau code après paiement" };
  }
  return { ok: true, exp };
}

export function createSignedCode(days: number, note: string): string {
  const secret = getSecret();
  if (!secret) throw new Error("PREMIUM_CODE_SECRET manquant");
  const exp = Math.floor(Date.now() / 1000) + Math.max(1, days) * 86400;
  const id = randomBytes(4).toString("hex");
  const payloadB64 = b64urlJson({
    e: exp,
    i: id,
    n: (note || "").slice(0, 40),
  });
  const sig = sign(payloadB64, secret);
  return `NGN1.${payloadB64}.${sig}`;
}

export const validatePremiumCode = createServerFn({ method: "POST" })
  .validator((input: { code: string }) => input)
  .handler(async ({ data }) => {
    return verifyCodeLocal(data.code);
  });

export const generatePremiumCode = createServerFn({ method: "POST" })
  .validator((input: { adminPassword: string; days?: number; note?: string }) => input)
  .handler(async ({ data }) => {
    const admin = getAdminPassword();
    if (!admin) {
      return {
        ok: false as const,
        error:
          "Configure PREMIUM_ADMIN_PASSWORD (et PREMIUM_CODE_SECRET) sur Vercel.",
      };
    }
    if (!safeEqual(data.adminPassword.trim(), admin)) {
      return { ok: false as const, error: "Mot de passe admin incorrect" };
    }
    const secret = getSecret();
    if (!secret) {
      return { ok: false as const, error: "PREMIUM_CODE_SECRET manquant" };
    }
    const days = Math.min(365, Math.max(1, data.days ?? 30));
    const code = createSignedCode(days, data.note ?? "");
    const exp = Math.floor(Date.now() / 1000) + days * 86400;
    return {
      ok: true as const,
      code,
      exp,
      expLabel: new Date(exp * 1000).toISOString().slice(0, 10),
      days,
    };
  });

/** Client helpers */
export function readPremiumSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PREMIUM_SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Session;
    if (!s?.code) return null;
    if (s.exp > 0 && Math.floor(Date.now() / 1000) > s.exp) {
      window.localStorage.removeItem(PREMIUM_SESSION_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

export function writePremiumSession(code: string, exp: number) {
  const s: Session = { code, exp };
  window.localStorage.setItem(PREMIUM_SESSION_KEY, JSON.stringify(s));
  // compat ancienne clé
  window.localStorage.setItem("ngn_premium_unlocked", "1");
}

export function clearPremiumSession() {
  try {
    window.localStorage.removeItem(PREMIUM_SESSION_KEY);
    window.localStorage.removeItem("ngn_premium_unlocked");
  } catch {
    /* ignore */
  }
}
