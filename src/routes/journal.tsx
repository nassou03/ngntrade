import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input, Label, Textarea } from "@/components/ui/input";
import type { Market, Trade, TradeStatus } from "@/lib/analysis/types";
import { DIRECTION_LABELS, MARKET_LABELS } from "@/lib/analysis/types";
import { useAppStore } from "@/lib/store";
import { cn, formatPrice } from "@/lib/utils";

export const Route = createFileRoute("/journal")({ component: JournalPage });

const STATUSES: { id: TradeStatus; label: string }[] = [
  { id: "open", label: "Ouvert" },
  { id: "win", label: "Gain" },
  { id: "loss", label: "Perte" },
  { id: "be", label: "BE" },
];

function JournalPage() {
  const trades = useAppStore((s) => s.trades);
  const seedDemo = useAppStore((s) => s.seedDemo);
  const clearDemo = useAppStore((s) => s.clearDemo);
  const addTrade = useAppStore((s) => s.addTrade);
  const updateTrade = useAppStore((s) => s.updateTrade);
  const removeTrade = useAppStore((s) => s.removeTrade);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    seedDemo();
  }, [seedDemo]);

  const hasDemo = trades.some((t) => t.id.startsWith("demo-"));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-28 md:pb-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-wide text-accent uppercase">Journal</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            Vos exécutions
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Pas de connexion broker ici : vous journalisez depuis un plan Ngntrade, ou à la main.
          </p>
        </div>
        <div className="flex gap-2">
          {hasDemo ? (
            <Button variant="outline" size="sm" onClick={clearDemo}>
              Retirer la démo
            </Button>
          ) : null}
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            Ajouter
          </Button>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        {trades.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              Aucun trade. Analysez un graphique puis journalisez le setup, ou ajoutez une ligne.
            </CardContent>
          </Card>
        ) : (
          trades.map((t) => (
            <article
              key={t.id}
              className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-mono text-sm">{t.symbol}</p>
                  <Badge>{MARKET_LABELS[t.market]}</Badge>
                  <Badge variant={t.direction === "long" ? "bull" : "bear"}>
                    {DIRECTION_LABELS[t.direction]}
                  </Badge>
                  <StatusBadge status={t.status} />
                </div>
                <p className="mt-2 font-mono text-xs text-muted-foreground tabular-nums">
                  Entrée {formatPrice(t.entry)} · SL {formatPrice(t.stopLoss)} · TP{" "}
                  {formatPrice(t.takeProfit)} · Taille {t.size}
                </p>
                {t.notes ? (
                  <p className="mt-1 text-sm text-muted-foreground">{t.notes}</p>
                ) : null}
              </div>
              <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                {t.status === "open" ? (
                  <p className="font-mono text-sm tabular-nums text-subtle">—</p>
                ) : (
                  <label className="flex items-center gap-2">
                    <span className="sr-only">PnL</span>
                    <input
                      className={cn(
                        "h-9 w-28 rounded-md border border-input bg-elevated px-2 text-right font-mono text-sm tabular-nums",
                        t.pnl > 0 && "text-bull",
                        t.pnl < 0 && "text-bear",
                      )}
                      defaultValue={t.pnl}
                      inputMode="decimal"
                      onBlur={(e) => {
                        const n = Number(e.target.value);
                        if (Number.isFinite(n)) updateTrade(t.id, { pnl: n });
                      }}
                    />
                  </label>
                )}
                <div className="flex gap-1">
                  {STATUSES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={cn(
                        "h-8 rounded-md px-2 text-[10px] uppercase tracking-wide",
                        t.status === s.id
                          ? "bg-elevated text-foreground"
                          : "text-subtle hover:text-foreground",
                      )}
                      onClick={() =>
                        updateTrade(t.id, {
                          status: s.id,
                          closedAt:
                            s.id === "open" ? undefined : new Date().toISOString(),
                        })
                      }
                    >
                      {s.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="size-8 text-subtle hover:text-bear"
                    aria-label="Supprimer"
                    onClick={() => {
                      removeTrade(t.id);
                      toast("Ligne retirée");
                    }}
                  >
                    <Trash2 className="mx-auto size-4" />
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      <TradeDialog
        open={open}
        onOpenChange={setOpen}
        onSave={(trade) => {
          addTrade(trade);
          setOpen(false);
          toast.success("Trade ajouté");
        }}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: TradeStatus }) {
  if (status === "win") return <Badge variant="bull">Gain</Badge>;
  if (status === "loss") return <Badge variant="bear">Perte</Badge>;
  if (status === "be") return <Badge variant="warn">BE</Badge>;
  return <Badge>Ouvert</Badge>;
}

function TradeDialog({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (t: Omit<Trade, "id">) => void;
}) {
  const [symbol, setSymbol] = useState("EURUSD");
  const [market, setMarket] = useState<Market>("forex");
  const [direction, setDirection] = useState<"long" | "short">("long");
  const [entry, setEntry] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [size, setSize] = useState("1");
  const [pnl, setPnl] = useState("0");
  const [notes, setNotes] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau trade</DialogTitle>
          <DialogDescription>Une ligne, un risque, une thèse.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            onSave({
              createdAt: new Date().toISOString(),
              symbol: symbol.toUpperCase(),
              market,
              direction,
              entry: Number(entry),
              stopLoss: Number(stopLoss),
              takeProfit: Number(takeProfit),
              size: Number(size) || 1,
              status: "open",
              pnl: Number(pnl) || 0,
              notes,
            });
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <Field label="Symbole">
              <Input value={symbol} onChange={(e) => setSymbol(e.target.value)} required />
            </Field>
            <Field label="Marché">
              <select
                className="flex h-11 w-full rounded-md border border-input bg-elevated px-3 text-sm"
                value={market}
                onChange={(e) => setMarket(e.target.value as Market)}
              >
                <option value="forex">Forex</option>
                <option value="crypto">Crypto</option>
                <option value="commodity">Matière</option>
                <option value="index">Indice</option>
              </select>
            </Field>
            <Field label="Direction">
              <select
                className="flex h-11 w-full rounded-md border border-input bg-elevated px-3 text-sm"
                value={direction}
                onChange={(e) => setDirection(e.target.value as "long" | "short")}
              >
                <option value="long">Achat</option>
                <option value="short">Vente</option>
              </select>
            </Field>
            <Field label="Taille">
              <Input value={size} onChange={(e) => setSize(e.target.value)} />
            </Field>
            <Field label="Entrée">
              <Input value={entry} onChange={(e) => setEntry(e.target.value)} required />
            </Field>
            <Field label="Stop">
              <Input value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} required />
            </Field>
            <Field label="TP">
              <Input value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)} />
            </Field>
            <Field label="PnL (si clos)">
              <Input value={pnl} onChange={(e) => setPnl(e.target.value)} />
            </Field>
          </div>
          <Field label="Notes">
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
          <Button type="submit" className="w-full">
            Enregistrer
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
