/** Google Analytics 4 — measurement ID */
export const GA_ID =
  (typeof import.meta !== "undefined" &&
    import.meta.env?.VITE_GA_MEASUREMENT_ID) ||
  "G-L4M4W602PB";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackPageview(path: string) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("config", GA_ID, { page_path: path });
}

export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", name, params);
}
