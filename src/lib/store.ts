import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AnalysisInput,
  AnalysisRecord,
  ChatMessage,
  CopilotTone,
  Trade,
} from "@/lib/analysis/types";
import { uid } from "@/lib/utils";

const DEMO_TRADES: Trade[] = [
  {
    id: "demo-1",
    createdAt: "2026-09-08T08:12:00.000Z",
    closedAt: "2026-09-08T11:40:00.000Z",
    symbol: "EURUSD",
    market: "forex",
    direction: "long",
    entry: 1.1742,
    stopLoss: 1.1718,
    takeProfit: 1.1796,
    size: 1.2,
    status: "win",
    pnl: 186,
    notes: "Continuation Londres, sortie TP2 partielle.",
  },
  {
    id: "demo-2",
    createdAt: "2026-09-08T14:05:00.000Z",
    closedAt: "2026-09-08T15:10:00.000Z",
    symbol: "NAS100",
    market: "index",
    direction: "long",
    entry: 20280,
    stopLoss: 20190,
    takeProfit: 20440,
    size: 0.4,
    status: "win",
    pnl: 248,
    notes: "Breakout cash open NY.",
  },
  {
    id: "demo-3",
    createdAt: "2026-09-09T09:22:00.000Z",
    closedAt: "2026-09-09T10:04:00.000Z",
    symbol: "XAUUSD",
    market: "commodity",
    direction: "short",
    entry: 3412,
    stopLoss: 3428,
    takeProfit: 3378,
    size: 0.3,
    status: "loss",
    pnl: -96,
    notes: "Fade trop tôt dans le range.",
  },
  {
    id: "demo-4",
    createdAt: "2026-09-09T16:40:00.000Z",
    closedAt: "2026-09-09T18:15:00.000Z",
    symbol: "BTCUSD",
    market: "crypto",
    direction: "short",
    entry: 112400,
    stopLoss: 113350,
    takeProfit: 110200,
    size: 0.05,
    status: "win",
    pnl: 312,
    notes: "Cassure H4 tenue.",
  },
  {
    id: "demo-5",
    createdAt: "2026-09-10T07:50:00.000Z",
    symbol: "GBPJPY",
    market: "forex",
    direction: "long",
    entry: 198.42,
    stopLoss: 197.85,
    takeProfit: 199.6,
    size: 0.6,
    status: "open",
    pnl: 0,
    notes: "Reprise de demande Asie.",
  },
];

type AppState = {
  analyses: AnalysisRecord[];
  trades: Trade[];
  demoSeeded: boolean;
  pendingImage: string | null;
  pendingInput: AnalysisInput | null;
  activeAnalysisId: string | null;
  messages: ChatMessage[];
  tone: CopilotTone;
  setPending: (image: string | null, input?: AnalysisInput | null) => void;
  addAnalysis: (record: AnalysisRecord) => void;
  setActiveAnalysis: (id: string | null) => void;
  addTrade: (trade: Omit<Trade, "id">) => void;
  updateTrade: (id: string, patch: Partial<Trade>) => void;
  removeTrade: (id: string) => void;
  seedDemo: () => void;
  clearDemo: () => void;
  addMessage: (msg: Omit<ChatMessage, "id" | "createdAt">) => void;
  clearMessages: () => void;
  setTone: (tone: CopilotTone) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      analyses: [],
      trades: [],
      demoSeeded: false,
      pendingImage: null,
      pendingInput: null,
      activeAnalysisId: null,
      messages: [],
      tone: "analyst",
      setPending: (image, input) =>
        set({ pendingImage: image, pendingInput: input ?? get().pendingInput }),
      addAnalysis: (record) =>
        set((s) => ({
          analyses: [record, ...s.analyses].slice(0, 24),
          activeAnalysisId: record.id,
          pendingImage: null,
        })),
      setActiveAnalysis: (id) => set({ activeAnalysisId: id }),
      addTrade: (trade) =>
        set((s) => ({ trades: [{ ...trade, id: uid() }, ...s.trades] })),
      updateTrade: (id, patch) =>
        set((s) => ({
          trades: s.trades.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      removeTrade: (id) =>
        set((s) => ({ trades: s.trades.filter((t) => t.id !== id) })),
      seedDemo: () => {
        if (get().demoSeeded || get().trades.length) return;
        set({ trades: DEMO_TRADES, demoSeeded: true });
      },
      clearDemo: () =>
        set({
          trades: get().trades.filter((t) => !t.id.startsWith("demo-")),
          demoSeeded: true,
        }),
      addMessage: (msg) =>
        set((s) => ({
          messages: [
            ...s.messages,
            { ...msg, id: uid(), createdAt: new Date().toISOString() },
          ].slice(-24),
        })),
      clearMessages: () => set({ messages: [] }),
      setTone: (tone) => set({ tone }),
    }),
    {
      name: "ngntrade-v1",
      partialize: (s) => ({
        analyses: s.analyses,
        trades: s.trades,
        demoSeeded: s.demoSeeded,
        activeAnalysisId: s.activeAnalysisId,
        tone: s.tone,
      }),
    },
  ),
);
