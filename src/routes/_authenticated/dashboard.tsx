import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, MessageSquare, Sparkles, FolderOpen, Clock } from "lucide-react";

import { ToolIcon } from "@/components/nexora/tool-icon";
import { TOOLS, getTool } from "@/lib/tools";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Nexora" },
      { name: "description", content: "Your Nexora study workspace: recent AI runs, chats and quick access to every tool." },
      { property: "og:title", content: "Nexora Dashboard" },
      { property: "og:description", content: "Your AI study workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useSession();

  const stats = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [runs, convos, files] = await Promise.all([
        supabase.from("tool_runs").select("id", { count: "exact", head: true }),
        supabase.from("conversations").select("id", { count: "exact", head: true }),
        supabase.from("uploads").select("id", { count: "exact", head: true }),
      ]);
      return { runs: runs.count ?? 0, convos: convos.count ?? 0, files: files.count ?? 0 };
    },
  });

  const recent = useQuery({
    queryKey: ["recent-runs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tool_runs")
        .select("id, tool_key, title, created_at")
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  const name = (user?.user_metadata?.["display_name"] as string) || user?.email?.split("@")[0] || "student";

  return (
    <div className="space-y-10">
      <header className="animate-rise">
        <p className="text-sm text-muted-foreground">Welcome back</p>
        <h1 className="mt-1 text-3xl font-semibold capitalize sm:text-4xl">
          Hey {name}, <span className="text-gradient">what are we learning?</span>
        </h1>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Sparkles} label="Tool runs" value={stats.data?.runs ?? 0} />
        <StatCard icon={MessageSquare} label="Conversations" value={stats.data?.convos ?? 0} />
        <StatCard icon={FolderOpen} label="Files" value={stats.data?.files ?? 0} />
      </div>

      <section className="glass rounded-3xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Ask Nexora anything</h2>
            <p className="mt-1 text-sm text-muted-foreground">A streaming AI tutor that shows its working.</p>
          </div>
          <Link
            to="/chat"
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
            style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
          >
            Open chat <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your tools</h2>
          <Link to="/tools" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TOOLS.slice(0, 8).map((tool) => (
            <Link
              key={tool.key}
              to="/tools/$toolKey"
              params={{ toolKey: tool.key }}
              className="glass glass-hover rounded-2xl p-5"
            >
              <ToolIcon name={tool.icon} accent={tool.accent} />
              <h3 className="mt-4 text-base font-semibold">{tool.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{tool.tagline}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Recent activity</h2>
        {recent.data && recent.data.length > 0 ? (
          <ul className="glass divide-y divide-border overflow-hidden rounded-2xl">
            {recent.data.map((run) => (
              <li key={run.id}>
                <Link
                  to="/tools/$toolKey"
                  params={{ toolKey: run.tool_key }}
                  className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/5"
                >
                  <Clock className="size-4 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{run.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {getTool(run.tool_key)?.name ?? run.tool_key} ·{" "}
                      {new Date(run.created_at).toLocaleString()}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="glass rounded-2xl px-5 py-10 text-center text-sm text-muted-foreground">
            Nothing yet — run your first tool and it will appear here.
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Sparkles;
  label: string;
  value: number;
}) {
  return (
    <div className="glass glass-hover rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className="size-4 text-primary" />
      </div>
      <p className="mt-3 font-display text-3xl font-semibold">{value}</p>
    </div>
  );
}
