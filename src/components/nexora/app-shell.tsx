import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, MessageSquare, Sparkles, FolderOpen, LogOut, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";

import { NexoraLogo } from "@/components/nexora/logo";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/chat", label: "AI Chat", icon: MessageSquare },
  { to: "/tools", label: "AI Tools", icon: Sparkles },
  { to: "/files", label: "Files", icon: FolderOpen },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const nav = (
    <nav className="flex flex-col gap-1.5">
      {NAV.map((item) => {
        const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
              active
                ? "bg-primary/12 text-foreground shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--primary)_35%,transparent)]"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
            )}
          >
            <item.icon className={cn("size-4.5 transition-colors", active && "text-primary")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="relative min-h-screen surface-aurora">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-40" />

      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/60 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/dashboard">
            <NexoraLogo size={30} />
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation"
            className="rounded-lg border border-border p-2 text-muted-foreground"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
        {open && <div className="border-t border-border/70 px-4 py-3">{nav}</div>}
      </header>

      <div className="relative mx-auto flex w-full max-w-[1600px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between border-r border-border/70 bg-background/40 px-4 py-6 backdrop-blur-xl lg:flex">
          <div className="flex flex-col gap-8">
            <Link to="/dashboard" className="px-1.5">
              <NexoraLogo />
            </Link>
            {nav}
          </div>
          <div className="glass rounded-2xl p-3.5">
            <p className="truncate text-xs text-muted-foreground">Signed in as</p>
            <p className="truncate text-sm font-medium">{user?.email ?? "—"}</p>
            <button
              onClick={signOut}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-destructive/50 hover:text-foreground"
            >
              <LogOut className="size-3.5" /> Sign out
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-10">{children}</main>
      </div>
    </div>
  );
}
