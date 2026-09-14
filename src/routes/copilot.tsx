import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { askCopilot } from "@/lib/analysis/server";
import { TONE_LABELS, type CopilotTone } from "@/lib/analysis/types";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/copilot")({ component: CopilotPage });

const TONES: CopilotTone[] = ["analyst", "mentor", "risk"];

const STARTERS = [
  "Le setup est-il assez propre pour risquer 0,5 % ?",
  "Quel est le scénario qui invalide ce plan ?",
  "Comment gérer un news high-impact pendant le trade ?",
  "Où partieler si le premier TP est trop loin ?",
];

function CopilotPage() {
  const messages = useAppStore((s) => s.messages);
  const addMessage = useAppStore((s) => s.addMessage);
  const clearMessages = useAppStore((s) => s.clearMessages);
  const tone = useAppStore((s) => s.tone);
  const setTone = useAppStore((s) => s.setTone);
  const analyses = useAppStore((s) => s.analyses);
  const activeId = useAppStore((s) => s.activeAnalysisId);
  const active = analyses.find((a) => a.id === activeId) ?? analyses[0];
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const context = useMemo(() => {
    if (!active) return undefined;
    const r = active.result;
    return [
      `${r.symbol} ${r.timeframe} ${r.bias} (${r.confidence}%)`,
      `Direction ${r.setup.direction} entrée ${r.setup.entryMin}-${r.setup.entryMax} SL ${r.setup.stopLoss} TP ${r.setup.takeProfits.join("/")}`,
      r.rationale,
      `Invalidation: ${r.setup.invalidation}`,
    ].join("\n");
  }, [active]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    addMessage({ role: "user", content });
    setDraft("");
    setBusy(true);
    try {
      const history = [
        ...useAppStore.getState().messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ];
      const res = await askCopilot({
        data: { messages: history, tone, analysisContext: context },
      });
      if (!res.ok) {
        toast.error(res.error);
        addMessage({
          role: "assistant",
          content: "Je n’ai pas pu répondre. Réessayez dans un instant.",
        });
        return;
      }
      addMessage({ role: "assistant", content: res.text });
    } catch {
      toast.error("Copilote indisponible");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col px-4 py-8 pb-32 md:pb-12">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-wide text-accent uppercase">Copilote</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            Dans la room
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {active
              ? `Ancré sur ${active.result.symbol} ${active.result.timeframe}`
              : "Aucun plan chargé — analysez un graphique pour ancrer la session."}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={clearMessages}>
          Effacer
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {TONES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTone(t)}
            className={cn(
              "h-9 rounded-full px-3 text-xs font-medium",
              tone === t
                ? "bg-primary text-primary-foreground"
                : "bg-elevated text-muted-foreground",
            )}
          >
            {TONE_LABELS[t]}
          </button>
        ))}
      </div>

      <div className="flex min-h-[48vh] flex-col gap-3">
        {messages.length === 0 ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {STARTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => void send(s)}
                className="rounded-xl border border-border bg-card p-4 text-left text-sm text-muted-foreground hover:border-accent/50 hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "max-w-[90%] rounded-xl px-4 py-3 text-sm leading-relaxed",
                m.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-card border border-border",
              )}
            >
              {m.content}
            </div>
          ))
        )}
        {busy ? (
          <div className="inline-flex items-center gap-2 text-sm text-accent">
            <Loader2 className="size-4 animate-spin" />
            Réflexion…
          </div>
        ) : null}
      </div>

      <form
        className="sticky bottom-20 mt-6 flex gap-2 md:bottom-4"
        onSubmit={(e) => {
          e.preventDefault();
          void send(draft);
        }}
      >
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Votre question de session…"
          className="min-h-12 resize-none"
          rows={2}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(draft);
            }
          }}
        />
        <Button type="submit" size="icon" disabled={busy || !draft.trim()} aria-label="Envoyer">
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </form>
      {active ? (
        <p className="mt-2">
          <Badge variant="accent">{active.result.symbol}</Badge>
        </p>
      ) : null}
    </div>
  );
}
