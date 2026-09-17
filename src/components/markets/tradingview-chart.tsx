import { useEffect, useRef } from "react";

/** Map Ngntrade symbols → TradingView symbol ids */
export const TV_SYMBOLS: Record<string, string> = {
  EURUSD: "FX:EURUSD",
  GBPUSD: "FX:GBPUSD",
  USDJPY: "FX:USDJPY",
  USDCHF: "FX:USDCHF",
  AUDUSD: "FX:AUDUSD",
  USDCAD: "FX:USDCAD",
  NZDUSD: "FX:NZDUSD",
  EURJPY: "FX:EURJPY",
  GBPJPY: "FX:GBPJPY",
  EURGBP: "FX:EURGBP",
  BTCUSD: "BINANCE:BTCUSDT",
  ETHUSD: "BINANCE:ETHUSDT",
  SOLUSD: "BINANCE:SOLUSDT",
  XRPUSD: "BINANCE:XRPUSDT",
  XAUUSD: "OANDA:XAUUSD",
  XAGUSD: "OANDA:XAGUSD",
  WTI: "TVC:USOIL",
  BRENT: "TVC:UKOIL",
  COPPER: "COMEX:HG1!",
  NATGAS: "NYMEX:NG1!",
  NAS100: "CAPITALCOM:US100",
  US500: "CAPITALCOM:US500",
  US30: "CAPITALCOM:US30",
  GER40: "XETR:DAX",
  UK100: "TVC:UKX",
  JPN225: "TVC:NI225",
};

declare global {
  interface Window {
    TradingView?: {
      widget: new (options: Record<string, unknown>) => unknown;
    };
  }
}

let tvScriptPromise: Promise<void> | null = null;

function loadTradingViewScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.TradingView) return Promise.resolve();
  if (tvScriptPromise) return tvScriptPromise;
  tvScriptPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById("tradingview-widget-script");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      if (window.TradingView) resolve();
      return;
    }
    const script = document.createElement("script");
    script.id = "tradingview-widget-script";
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("TradingView script failed"));
    document.head.appendChild(script);
  });
  return tvScriptPromise;
}

type Props = {
  /** Ngntrade symbol, e.g. EURUSD */
  symbol: string;
  height?: number;
};

/**
 * Advanced chart embed (free TradingView widget).
 * Click a market card to change the symbol.
 */
export function TradingViewChart({ symbol, height = 480 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tvSymbol = TV_SYMBOLS[symbol] ?? `FX:${symbol}`;

  useEffect(() => {
    let cancelled = false;
    const host = containerRef.current;
    if (!host) return;

    host.innerHTML = "";
    const widgetId = `tv_${symbol}_${Date.now()}`;
    const mount = document.createElement("div");
    mount.id = widgetId;
    mount.style.height = "100%";
    mount.style.width = "100%";
    host.appendChild(mount);

    void loadTradingViewScript()
      .then(() => {
        if (cancelled || !window.TradingView) return;
        // eslint-disable-next-line no-new
        new window.TradingView.widget({
          autosize: true,
          symbol: tvSymbol,
          interval: "60",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "fr",
          toolbar_bg: "#0a0a0b",
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          container_id: widgetId,
          backgroundColor: "rgba(10, 10, 11, 1)",
          gridColor: "rgba(42, 46, 57, 0.5)",
          allow_symbol_change: true,
          details: false,
          hotlist: false,
          calendar: false,
          studies: ["STD;SMA"],
        });
      })
      .catch(() => {
        if (!cancelled && host) {
          host.innerHTML =
            '<p class="p-4 text-sm text-muted-foreground">Graphique TradingView indisponible pour le moment.</p>';
        }
      });

    return () => {
      cancelled = true;
      if (host) host.innerHTML = "";
    };
  }, [symbol, tvSymbol]);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <p className="text-xs font-medium text-muted-foreground">
          Graphique · <span className="font-mono text-foreground">{symbol}</span>
          <span className="ml-2 text-subtle">({tvSymbol})</span>
        </p>
        <a
          href={`https://www.tradingview.com/chart/?symbol=${encodeURIComponent(tvSymbol)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-accent hover:underline"
        >
          Ouvrir sur TradingView
        </a>
      </div>
      <div ref={containerRef} style={{ height }} className="w-full" />
    </div>
  );
}
