import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { NexoraLogo } from "@/components/nexora/logo";
import { ParticleField } from "@/components/nexora/particles";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in to Nexora — AI study platform" },
      {
        name: "description",
        content:
          "Create your Nexora account to unlock AI tutoring, summaries, quizzes, flashcards and study tools.",
      },
      { property: "og:title", content: "Sign in to Nexora" },
      {
        property: "og:description",
        content: "Your AI study companion for every subject.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const navigate = useNavigate();
  const { session } = useSession();

  useEffect(() => {
    if (session) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [session, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              display_name: name,
            },
          },
        });

        if (error) throw error;

        if (!data.session) {
          toast.success("Check your email to confirm your account.");
          return;
        }

        toast.success("Welcome to Nexora!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast.success("Welcome back!");
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Google sign-in failed. Please try again."
      );

      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden surface-aurora px-4 py-14">
      <ParticleField density={50} />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid opacity-30"
      />

      <div className="glass relative w-full max-w-md rounded-3xl p-8 animate-rise">
        <Link to="/" className="inline-flex">
          <NexoraLogo />
        </Link>

        <h1 className="mt-6 text-2xl font-semibold">
          {mode === "signin"
            ? "Welcome back"
            : "Create your account"}
        </h1>

        <p className="mt-1.5 text-sm text-muted-foreground">
          {mode === "signin"
            ? "Sign in to continue studying with Nexora."
            : "Start learning faster with Nexora's AI study tools."}
        </p>

        <button
          onClick={google}
          disabled={busy}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-white/5 px-4 py-3 text-sm font-medium transition-colors hover:bg-white/10 disabled:opacity-60"
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="size-4.5"
              aria-hidden
            >
              <path
                fill="#EA4335"
                d="M12 10.2v3.9h5.5c-.24 1.4-1.68 4.1-5.5 4.1a6.2 6.2 0 1 1 0-12.4c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3 14.7 2 12 2a10 10 0 1 0 0 20c5.8 0 9.6-4 9.6-9.7 0-.7-.1-1.2-.2-1.7H12z"
              />
            </svg>
          )}

          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-3.5">
          {mode === "signup" && (
            <Field
              label="Name"
              value={name}
              onChange={setName}
              placeholder="Your name"
            />
          )}

          <Field
            label="Email"
            value={email}
            onChange={setEmail}
            type="email"
            placeholder="you@school.edu"
            required
          />

          <Field
            label="Password"
            value={password}
            onChange={setPassword}
            type="password"
            placeholder="••••••••"
            required
          />

          <button
            type="submit"
            disabled={busy}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01] disabled:opacity-60"
            style={{
              background: "var(--gradient-brand)",
              boxShadow: "var(--shadow-glow)",
            }}
          >
            {busy && <Loader2 className="size-4 animate-spin" />}

            {mode === "signin"
              ? "Sign in"
              : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {mode === "signin"
            ? "New to Nexora?"
            : "Already have an account?"}{" "}

          <button
            onClick={() =>
              setMode(
                mode === "signin"
                  ? "signup"
                  : "signin"
              )
            }
            className="font-medium text-primary hover:underline"
          >
            {mode === "signin"
              ? "Create an account"
              : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </span>

      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-white/5 px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/60"
      />
    </label>
  );
}