import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { AppShell } from "@/components/layout/app-shell";
import { TooltipProvider } from "@/components/ui/misc";
import { Toaster } from "sonner";
import { Analytics } from "@/components/analytics";
import { GA_ID } from "@/lib/analytics";
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
          "Ngntrade lit vos graphiques de trading. Plan vérifié automatiquement : stop, R:R et confluence contrôlés, graphique annoté, multi-timeframe. Forex, crypto, matières, indices. Outil éducatif.",
      },
      {
        name: "keywords",
        content:
          "analyse graphique trading, forex, crypto, calendrier économique, plan de trade, MetaTrader, sniper entry, Ngntrade",
      },
      { name: "theme-color", content: "#0a1016" },
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
          "Déposez vos captures. Recevez un plan contrôlé (stop, R:R, confluence) et le graphique annoté. Forex, crypto, indices.",
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
      { rel: "icon", type: "image/png", sizes: "64x64", href: "/favicon-64.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/icon-180.png" },
      { rel: "canonical", href: "https://ngntrade.vercel.app/" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Bricolage+Grotesque:opsz,wght@12..96,500;600;700&display=swap",
      },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
    ],
    scripts: [
      {
        children: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${GA_ID}');`,
      },
      {
        async: true,
        src: `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`,
      },
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
        <Analytics />
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
