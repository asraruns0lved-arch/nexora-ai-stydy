import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Loader2, Plus, SendHorizonal, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Markdown } from "@/components/nexora/markdown";
import { NexoraMark } from "@/components/nexora/logo";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/chat")({
  head: () => ({
    meta: [
      { title: "AI Chat — Nexora" },
      { name: "description", content: "Chat with Nexora, your streaming AI tutor for maths, science, coding, writing and revision." },
      { property: "og:title", content: "Nexora AI Chat" },
      { property: "og:description", content: "A streaming AI tutor that shows its working." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatPage,
});

type Msg = { id: string; role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Explain eigenvalues like I'm 15",
  "Give me a 7-day revision plan for biology",
  "Why does my recursion hit a stack overflow?",
  "Summarise the causes of World War I",
];

function ChatPage() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();

  const conversations = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("id, title, updated_at")
        .order("updated_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openConversation = async (id: string) => {
    setConversationId(id);
    const { data } = await supabase
      .from("messages")
      .select("id, role, content")
      .eq("conversation_id", id)
      .order("created_at");
    setMessages((data ?? []).filter((m) => m.role !== "system").map((m) => ({ ...m, role: m.role as Msg["role"] })));
  };

  const deleteConversation = async (id: string) => {
    await supabase.from("conversations").delete().eq("id", id);
    if (conversationId === id) {
      setConversationId(null);
      setMessages([]);
    }
    void queryClient.invalidateQueries({ queryKey: ["conversations"] });
  };

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || streaming) return;
    setInput("");
    setStreaming(true);

    const history = [...messages, { id: crypto.randomUUID(), role: "user" as const, content }];
    setMessages(history);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const userId = sessionData.session?.user.id;
      if (!token || !userId) throw new Error("Your session expired. Please sign in again.");

      let convId = conversationId;
      if (!convId) {
        const { data, error } = await supabase
          .from("conversations")
          .insert({ user_id: userId, title: content.slice(0, 60) })
          .select("id")
          .single();
        if (error) throw error;
        convId = data.id;
        setConversationId(convId);
        void queryClient.invalidateQueries({ queryKey: ["conversations"] });
      }

      await supabase.from("messages").insert({
        conversation_id: convId,
        user_id: userId,
        role: "user",
        content,
      });

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ messages: history.map((m) => ({ role: m.role, content: m.content })) }),
      });

      console.log("CHAT STATUS:", res.status);
console.log("CHAT CONTENT TYPE:", res.headers.get("content-type"));

      if (!res.ok || !res.body) throw new Error(await res.text().catch(() => "Nexora could not answer right now."));

      const assistantId = crypto.randomUUID();
      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: full } : m)));
      }

      await supabase.from("messages").insert({
        conversation_id: convId,
        user_id: userId,
        role: "assistant",
        content: full,
      });
      await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", convId);
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nexora could not answer right now.");
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="glass h-fit rounded-3xl p-4">
        <button
          onClick={() => {
            setConversationId(null);
            setMessages([]);
          }}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-primary-foreground"
          style={{ background: "var(--gradient-brand)" }}
        >
          <Plus className="size-4" /> New chat
        </button>
        <ul className="max-h-[60vh] space-y-1 overflow-y-auto">
          {conversations.data?.map((c) => (
            <li key={c.id} className="group flex items-center gap-1">
              <button
                onClick={() => void openConversation(c.id)}
                className={`min-w-0 flex-1 truncate rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  conversationId === c.id ? "bg-primary/12 text-foreground" : "text-muted-foreground hover:bg-white/5"
                }`}
              >
                {c.title}
              </button>
              <button
                aria-label="Delete conversation"
                onClick={() => void deleteConversation(c.id)}
                className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="glass flex min-h-[70vh] flex-col rounded-3xl">
        <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-7">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center">
              <NexoraMark size={64} className="animate-float" />
              <h1 className="mt-6 text-2xl font-semibold">Ask Nexora anything</h1>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Homework, revision, code, essays — get a clear, worked answer.
              </p>
              <div className="mt-7 grid w-full max-w-xl gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => void send(s)}
                    className="rounded-xl border border-border bg-white/5 px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="flex justify-end">
                  <div
                    className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm text-primary-foreground"
                    style={{ background: "var(--gradient-brand)" }}
                  >
                    {m.content}
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex gap-3">
                  <NexoraMark size={28} />
                  <div className="min-w-0 flex-1">
                    {m.content ? <Markdown>{m.content}</Markdown> : <Loader2 className="size-4 animate-spin text-primary" />}
                  </div>
                </div>
              ),
            )
          )}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
          className="border-t border-border p-4"
        >
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-white/5 p-2">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              placeholder="Ask Nexora…"
              className="max-h-40 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground/60"
            />
            <button
              type="submit"
              disabled={streaming || !input.trim()}
              aria-label="Send message"
              className="grid size-10 shrink-0 place-items-center rounded-xl text-primary-foreground transition-transform hover:scale-105 disabled:opacity-40"
              style={{ background: "var(--gradient-brand)" }}
            >
              {streaming ? <Loader2 className="size-4 animate-spin" /> : <SendHorizonal className="size-4" />}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
