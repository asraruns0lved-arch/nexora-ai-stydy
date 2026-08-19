import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Bot, ShieldCheck, Zap, Sparkles } from "lucide-react";

import { NexoraLogo, NexoraMark } from "@/components/nexora/logo";
import { ParticleField } from "@/components/nexora/particles";
import { TOOLS } from "@/lib/tools";
import { ToolIcon } from "@/components/nexora/tool-icon";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nexora — The AI platform built for students" },
      {
        name: "description",
        content:
          "Nexora gives students an AI tutor plus 16 study tools: summaries, notes, quizzes, flashcards, math, physics, chemistry, coding, essays and study plans.",
      },
      { property: "og:title", content: "Nexora — The AI platform built for students" },
      { property: "og:description", content: "An AI study companion with 16 tools for every subject." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden surface-aurora">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-40" />

      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-6">
        <NexoraLogo />
        <div className="flex items-center gap-2">
          <Link
            to="/auth"
            className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign in
          </Link>
          <Link
            to="/auth"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
            style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
          >
            Get started
          </Link>
        </div>
      </header>

      <section className="relative">
        <ParticleField density={80} />
        <div className="relative z-10 mx-auto max-w-4xl px-5 pb-24 pt-16 text-center sm:pt-24">
          <div className="mx-auto mb-8 flex justify-center animate-float">
            <NexoraMark size={96} />
          </div>
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" /> 16 AI study tools · one workspace
          </span>
          <h1 className="mt-6 text-balance text-5xl font-semibold leading-[1.05] sm:text-7xl">
            Study at the speed of <span className="text-gradient">thought</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
            Nexora is the AI platform built for students. Ask anything, summarise anything, and turn any
            syllabus into notes, quizzes, flashcards, mock exams and a plan that actually fits your week.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/auth"
              className="group inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
              style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
            >
              Start for free
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/auth" className="glass glass-hover rounded-xl px-6 py-3.5 text-sm font-semibold">
              Explore the tools
            </Link>
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Bot, title: "Tutor that adapts", body: "Streamed answers with worked steps for every subject." },
              { icon: Zap, title: "Built for speed", body: "Instant tools, saved history, and files that stay in sync." },
              { icon: ShieldCheck, title: "Private by design", body: "Your work is yours. Keys stay server-side, always." },
            ].map((f) => (
              <div key={f.title} className="glass glass-hover rounded-2xl p-5 text-left">
                <f.icon className="size-5 text-primary" />
                <h3 className="mt-3 text-base font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-28">
        <h2 className="text-center text-3xl font-semibold sm:text-4xl">
          Every tool a student needs
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          Purpose-built assistants, each tuned with its own expert prompt.
        </p>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TOOLS.map((tool, i) => (
            <div
              key={tool.key}
              className="glass glass-hover rounded-2xl p-5 animate-rise"
              style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
            >
              <ToolIcon name={tool.icon} accent={tool.accent} />
              <h3 className="mt-4 text-base font-semibold">{tool.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{tool.tagline}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-border/70 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 text-sm text-muted-foreground sm:flex-row">
          <NexoraLogo size={26} />
          <p>© {new Date().getFullYear()} Nexora. Built for students.</p>
        </div>
      </footer>
    </div>
  );
}
