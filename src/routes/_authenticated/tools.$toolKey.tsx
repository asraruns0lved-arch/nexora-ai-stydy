import { Link, createFileRoute, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { ArrowLeft, Copy, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Markdown } from "@/components/nexora/markdown";
import { ToolIcon } from "@/components/nexora/tool-icon";
import { getTool } from "@/lib/tools";
import { runTool } from "@/lib/tools.functions";
import { supabase } from "@/integrations/supabase/client";

type Flashcard = {
  front: string;
  back: string;
};

function parseFlashcards(markdown: string): Flashcard[] {
  const lines = markdown.split("\n");

  return lines
    .filter((line) => line.trim().startsWith("|"))
    .map((line) => {
      const cells = line
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim());

      return {
        front: cells[0] ?? "",
        back: cells[1] ?? "",
      };
    })
    .filter(
      (card) =>
        card.front &&
        card.back &&
        !/^front$/i.test(card.front) &&
        !/^---+$/.test(card.front),
    );
}
export const Route = createFileRoute("/_authenticated/tools/$toolKey")({
  head: ({ params }) => {
    const tool = getTool(params.toolKey);
    const title = tool ? `${tool.name} — Nexora` : "AI Tool — Nexora";
    const description = tool ? `${tool.tagline}. Powered by Nexora's AI study platform.` : "Nexora AI study tool.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ToolPage,
});

function ToolPage() {
  const { toolKey } = useParams({ from: "/_authenticated/tools/$toolKey" });
  const tool = getTool(toolKey);
  const [values, setValues] = useState<Record<string, string>>({});
  const [output, setOutput] = useState("");
  const [flashcardIndex, setFlashcardIndex] = useState(0);
const [flashcardFlipped, setFlashcardFlipped] = useState(false);

const flashcards = useMemo(
  () => (tool?.key === "flashcards" && output ? parseFlashcards(output) : []),
  [tool?.key, output],
);
  const run = useServerFn(runTool);
  const queryClient = useQueryClient();

  const history = useQuery({
    queryKey: ["tool-runs", toolKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tool_runs")
        .select("id, title, output, created_at")
        .eq("tool_key", toolKey)
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!tool) throw new Error("Unknown tool");
      const prompt = tool.fields
        .map((f) => `${f.label}: ${values[f.name]?.trim() || "(not provided)"}`)
        .join("\n\n");
      const first = tool.fields[0];
      return run({
        data: {
          toolKey: tool.key,
          system: tool.system,
          prompt,
          title: (first ? values[first.name] : "") || tool.name,
        },
      });
    },
    onSuccess: (res) => {
      setOutput(res.output);
      void queryClient.invalidateQueries({ queryKey: ["tool-runs", toolKey] });
      void queryClient.invalidateQueries({ queryKey: ["recent-runs"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Something went wrong"),
  });

  if (!tool) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <p className="text-muted-foreground">That tool doesn&apos;t exist.</p>
        <Link to="/tools" className="mt-4 inline-block text-primary hover:underline">
          Back to tools
        </Link>
      </div>
    );
  }

  const required = tool.fields[0];
  const canRun = !!(required && values[required.name]?.trim());

  return (
    <div className="space-y-8">
      <Link to="/tools" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All tools
      </Link>

      <header className="flex items-start gap-4 animate-rise">
        <ToolIcon name={tool.icon} accent={tool.accent} size={56} />
        <div>
          <h1 className="text-3xl font-semibold">{tool.name}</h1>
          <p className="mt-1 text-muted-foreground">{tool.tagline}</p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        <div className="glass h-fit rounded-3xl p-6">
          <div className="space-y-4">
            {tool.fields.map((field) => (
              <label key={field.name} className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{field.label}</span>
                {field.type === "textarea" ? (
                  <textarea
                    rows={6}
                    value={values[field.name] ?? ""}
                    placeholder={field.placeholder}
                    onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                    className="w-full resize-y rounded-xl border border-border bg-white/5 px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/60"
                  />
                ) : field.type === "select" ? (
                  <select
                    value={values[field.name] ?? field.options?.[0] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-white/5 px-3.5 py-2.5 text-sm outline-none focus:border-primary/60"
                  >
                    {field.options?.map((o) => (
                      <option key={o} value={o} className="bg-popover">
                        {o}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={values[field.name] ?? ""}
                    placeholder={field.placeholder}
                    onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-white/5 px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/60"
                  />
                )}
              </label>
            ))}
          </div>

          <button
            onClick={() => mutation.mutate()}
            disabled={!canRun || mutation.isPending}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01] disabled:opacity-50"
            style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
          >
            {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {mutation.isPending ? "Generating…" : "Generate"}
          </button>
        </div>

        <div className="space-y-6">
          <div className="glass min-h-64 rounded-3xl p-6">
            {output ? (
              <>
                <div className="mb-4 flex justify-end">
                  <button
                    onClick={() => {
                      void navigator.clipboard.writeText(output);
                      toast.success("Copied");
                    }}
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Copy className="size-3.5" /> Copy
                  </button>
                </div>
                {tool?.key === "flashcards" && flashcards.length > 0 ? (
  <div className="flex flex-col items-center gap-5">
    <button
      type="button"
      onClick={() => setFlashcardFlipped((value) => !value)}
      className="flex min-h-64 w-full max-w-2xl items-center justify-center rounded-3xl border border-border bg-white/5 p-8 text-center shadow-lg transition hover:bg-white/10"
    >
      <div>
        <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-primary">
          {flashcardFlipped ? "Answer" : "Question"}
        </div>

        <div className="text-lg font-medium leading-relaxed">
  {flashcardFlipped
    ? flashcards[flashcardIndex]?.back
    : flashcards[flashcardIndex]?.front}
</div>

        <div className="mt-6 text-xs text-muted-foreground">
          Click to flip
        </div>
      </div>
    </button>

    <div className="flex items-center gap-4">
      <button
        type="button"
        disabled={flashcardIndex === 0}
        onClick={() => {
          setFlashcardIndex((index) => index - 1);
          setFlashcardFlipped(false);
        }}
        className="rounded-xl border border-border px-4 py-2 text-sm disabled:opacity-40"
      >
        ← Previous
      </button>

      <span className="text-sm text-muted-foreground">
        {flashcardIndex + 1} / {flashcards.length}
      </span>

      <button
        type="button"
        disabled={flashcardIndex === flashcards.length - 1}
        onClick={() => {
          setFlashcardIndex((index) => index + 1);
          setFlashcardFlipped(false);
        }}
        className="rounded-xl border border-border px-4 py-2 text-sm disabled:opacity-40"
      >
        Next →
      </button>
    </div>
  </div>
) : (
  <Markdown>{output}</Markdown>
)}
              </>
            ) : (
              <div className="flex h-56 flex-col items-center justify-center text-center text-sm text-muted-foreground">
                {mutation.isPending ? (
                  <Loader2 className="size-6 animate-spin text-primary" />
                ) : (
                  <>
                    <Sparkles className="mb-3 size-6 text-primary/70" />
                    Your result will appear here.
                  </>
                )}
              </div>
            )}
          </div>

          {history.data && history.data.length > 0 && (
            <div className="glass rounded-3xl p-6">
              <h2 className="text-sm font-semibold text-muted-foreground">Saved runs</h2>
              <ul className="mt-3 divide-y divide-border">
                {history.data.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => setOutput(item.output)}
                      className="w-full py-3 text-left transition-colors hover:text-primary"
                    >
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString()}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
