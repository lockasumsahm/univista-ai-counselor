import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Bot, User, Sparkles, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

import { ProfileGate } from "@/components/ProfileGate";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatbotProps {
  profile: any;
}

export const Chatbot = ({ profile }: ChatbotProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const DEFAULT_MSG: Message = {
    role: "assistant",
    content: "Hello! 👋 I'm your AI university counselor. I can help you with questions about university applications, requirements, essay writing, scholarships, and more. How can I assist you today?",
    timestamp: new Date(),
  };

  useEffect(() => {
    if (!user) { setInitialLoading(false); return; }
    const load = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(100);
      if (data && data.length > 0) {
        setMessages(data.map((m: any) => ({ role: m.role, content: m.content, timestamp: new Date(m.created_at) })));
      } else {
        setMessages([DEFAULT_MSG]);
      }
      setInitialLoading(false);
    };
    load();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const persistMessage = async (role: string, content: string) => {
    if (!user) return;
    await supabase.from("chat_messages").insert({ user_id: user.id, role, content });
  };

  const clearHistory = async () => {
    if (!user) return;
    await supabase.from("chat_messages").delete().eq("user_id", user.id);
    setMessages([DEFAULT_MSG]);
    toast({ title: "Chat Cleared", description: "Your conversation history has been cleared." });
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const question = input;
    const userMessage: Message = { role: "user", content: question, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    void persistMessage("user", question);

    // Insert an empty assistant placeholder we'll stream into.
    setMessages((prev) => [...prev, { role: "assistant", content: "", timestamp: new Date() }]);

    const appendDelta = (delta: string) => {
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.role === "assistant") {
          next[next.length - 1] = { ...last, content: last.content + delta };
        }
        return next;
      });
    };

    try {
      const conversationHistory = messages.map((m) => ({ role: m.role, content: m.content }));
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chatbot-counselor`;

      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ question, profile, conversationHistory, stream: true }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) throw new Error("Too many requests — please wait a few seconds.");
        if (resp.status === 402) throw new Error("AI credits exhausted.");
        throw new Error("Failed to get response");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let full = "";
      let done = false;

      while (!done) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;
        buffer += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line || line.startsWith(":") || !line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") { done = true; break; }
          try {
            const json = JSON.parse(payload);
            const delta = json?.choices?.[0]?.delta?.content as string | undefined;
            if (delta) { full += delta; appendDelta(delta); }
          } catch {
            // partial JSON — put it back and wait
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      if (full) void persistMessage("assistant", full);
    } catch (error) {
      console.error("Chatbot error:", error);
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to send message", variant: "destructive" });
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.role === "assistant" && !last.content) {
          next[next.length - 1] = { ...last, content: "I hit an error processing that. Please try again." };
        }
        return next;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const suggestedQuestions = [
    "What are my chances at top universities?",
    "How can I improve my application?",
    "What scholarships am I eligible for?",
  ];

  if (initialLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Skeleton className="w-14 h-14 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <Skeleton className="h-[520px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <ProfileGate profile={profile} featureName="AI counselor advice" soft>
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <MessageCircle className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">AI Counselor</h2>
            <p className="text-muted-foreground">Get personalized guidance for your university journey</p>
          </div>
        </div>
        {messages.length > 1 && (
          <Button variant="ghost" size="sm" onClick={clearHistory} className="text-muted-foreground hover:text-destructive gap-1.5 rounded-xl" aria-label="Clear chat history">
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </Button>
        )}
      </div>

      <Card className="shadow-card border-border/50 overflow-hidden">
        <CardHeader className="bg-gradient-card border-b border-border/50 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">UniVista AI</p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-[450px] p-6 custom-scrollbar" ref={scrollRef}>
            <div className="space-y-6">
              {messages.map((message, i) => (
                <div key={i} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
                  {message.role === "assistant" && (
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-4 ${
                    message.role === "user" ? "bg-gradient-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md"
                  }`}>
                    {message.role === "assistant" ? (
                      <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    )}
                    <span className={`text-xs mt-2 block ${message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  {message.role === "user" && (
                    <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-accent" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 justify-start animate-fade-in">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              {messages.length <= 1 && !loading && (
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground mb-3">Suggested questions:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.map((question, i) => (
                      <Button key={i} variant="outline" size="sm" className="text-xs hover:bg-primary/5 hover:border-primary/30" onClick={() => setInput(question)}>
                        <Sparkles className="w-3 h-3 mr-1.5 text-accent" />
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t border-border/50 p-4 bg-gradient-card">
            <div className="flex gap-3">
              <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress}
                placeholder="Ask about universities, applications, scholarships..." disabled={loading}
                className="flex-1 bg-card border-border/50 focus:ring-2 focus:ring-primary/20" />
              <Button onClick={sendMessage} disabled={loading || !input.trim()} className="bg-gradient-primary hover:shadow-glow px-6 transition-all" aria-label="Send message">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </ProfileGate>
  );
};
