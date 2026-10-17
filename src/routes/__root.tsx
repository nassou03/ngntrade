import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { AppShell } from "@/components/layout/app-shell";
import { TooltipProvider } from "@/components/ui/misc";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";

const APP_NAME = "Ngntrade";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        title:
          "Ngntrade — Analyse de graphiques trading (Forex, Crypto, Indices)",
      },
      {
        name: "description",
        content:
          "Ngntrade lit vos graphiques de trading. Multi-timeframe H1 M15 M5, entrée sniper, stop ~1 ATR, calendrier économique. Forex, crypto, matières, indices. Outil éducatif.",
      },
      {
        name: "keywords",
        content:
          "analyse graphique trading, forex, crypto, calendrier économique, plan de trade, MetaTrader, sniper entry, Ngntrade",
      },
      { name: "theme-color", content: "#08090c" },
      { name: "robots", content: "index, follow" },
      // Fichier HTML aussi servi via middleware; meta en secours si fourni
      {
        name: "google-site-verification",
        content: (typeof import.meta !== "undefined" && import.meta.env?.VITE_GOOGLE_SITE_VERIFICATION)
          ? String(import.meta.env.VITE_GOOGLE_SITE_VERIFICATION)
          : "google5e20f56775f7a85d",
      },
      { name: "googlebot", content: "index, follow" },
      {
        property: "og:title",
        content: "Ngntrade — plan de trade depuis vos graphiques",
      },
      {
        property: "og:description",
        content:
          "Déposez H1, M15, M5. Recevez biais, limit sniper, stop ~1 ATR et cibles. Forex · Crypto · Indices.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://ngntrade.vercel.app/" },
      { property: "og:locale", content: "fr_FR" },
      { property: "og:site_name", content: "Ngntrade" },
      { property: "og:image", content: "https://ngntrade.vercel.app/og.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Ngntrade — analyse de graphiques trading",
      },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "canonical", href: "https://ngntrade.vercel.app/" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Syne:wght@500;600;700&display=swap",
      },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="fr" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <TooltipProvider>
            <AppShell>
              <Outlet />
            </AppShell>
          </TooltipProvider>
        </AuthProvider>
        <Toaster theme="dark" position="bottom-right" richColors closeButton />
        <Scripts />
      </body>
    </html>
  );
}
