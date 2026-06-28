import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { invokeEdgeFunction } from "@/lib/edgeFunctions";
import { useToast } from "@/hooks/use-toast";
import type { AlignmentResult } from "@/lib/matchEngine";

interface Props {
  result: AlignmentResult;
  profile: any;
}

interface Turn { role: "user" | "assistant"; content: string }

// Per-uni session cache to control AI cost
const sessionCache = new Map<string, Turn[]>();

export const AskAboutUni = ({ result, profile }: Props) => {
  const cacheKey = result.universityName;
  const [turns, setTurns] = useState<Turn[]>(() => sessionCache.get(cacheKey) ?? []);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;

    const next: Turn[] = [...turns, { role: "user", content: q }];
    setTurns(next);
    setInput("");
    setLoading(true);

    try {
      const context = `You are answering a follow-up question about ONE specific university. Stay strictly on this university. Use the verified data and engine breakdown below. Never invent statistics. Keep answers under 150 words.

UNIVERSITY: ${result.universityName} (${result.country})
ACCEPTANCE RATE: ${result.acceptanceRate}%
ALIGNMENT SCORE FOR THIS STUDENT: ${result.score}/100 (${result.category})
ENGINE BREAKDOWN: ${result.factorBreakdown.map(f => `${f.factor} ${f.factorScore}/100`).join(", ")}

STUDENT QUESTION: ${q}`;

      const { data, status } = await invokeEdgeFunction("chatbot-counselor", {
        question: context,
        profile,
        conversationHistory: turns.slice(-6),
      });

      if (status === 402) {
        toast({ title: "AI credits exhausted", description: "Add credits in Settings → Cloud & AI balance.", variant: "destructive" });
        return;
      }
      if (status === 429) {
        toast({ title: "Rate limited", description: "Please wait a moment.", variant: "destructive" });
        return;
      }

      const reply = data?.answer || data?.result?.answer || data?.response || "I couldn't generate a response right now.";
      const updated: Turn[] = [...next, { role: "assistant", content: reply }];
      setTurns(updated);
      sessionCache.set(cacheKey, updated);
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Couldn't reach the counselor.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MessageCircle className="w-4 h-4 text-primary" />
        Ask anything about {result.universityName}. Answers stay scoped to this university.
      </div>

      {turns.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto rounded-lg bg-muted/30 p-3">
          {turns.map((t, i) => (
            <div key={i} className={`text-sm ${t.role === "user" ? "text-foreground" : "text-muted-foreground"}`}>
              <span className="font-semibold">{t.role === "user" ? "You" : "Counselor"}:</span> {t.content}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking…
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={`e.g. What program at ${result.universityName} fits me best?`}
          disabled={loading}
          className="rounded-xl"
        />
        <Button onClick={send} disabled={!input.trim() || loading} className="rounded-xl">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
