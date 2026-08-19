import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";

import { ToolIcon } from "@/components/nexora/tool-icon";
import { TOOLS } from "@/lib/tools";

export const Route = createFileRoute("/_authenticated/tools/")({
  head: () => ({
    meta: [
      { title: "AI Tools — Nexora" },
      { name: "description", content: "16 AI study tools: summarizer, notes, quizzes, flashcards, math, physics, chemistry, coding, writing, exams and planning." },
      { property: "og:title", content: "Nexora AI Tools" },
      { property: "og:description", content: "16 purpose-built AI study tools for students." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ToolsIndex,
});

function ToolsIndex() {
  const [q, setQ] = useState("");
  const list = TOOLS.filter(
    (t) => t.name.toLowerCase().includes(q.toLowerCase()) || t.tagline.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-8">
      <header className="animate-rise">
        <h1 className="text-3xl font-semibold sm:text-4xl">
          AI <span className="text-gradient">Tools</span>
        </h1>
        <p className="mt-2 text-muted-foreground">Pick a specialist. Each one is tuned for its subject.</p>
      </header>

      <div className="glass flex items-center gap-3 rounded-2xl px-4 py-3">
        <Search className="size-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search tools…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((tool, i) => (
          <Link
            key={tool.key}
            to="/tools/$toolKey"
            params={{ toolKey: tool.key }}
            className="glass glass-hover rounded-2xl p-5 animate-rise"
            style={{ animationDelay: `${Math.min(i * 35, 350)}ms` }}
          >
            <ToolIcon name={tool.icon} accent={tool.accent} />
            <h2 className="mt-4 text-base font-semibold">{tool.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{tool.tagline}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
