import { cn } from "@/lib/utils";

export function NexoraMark({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <span className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <span
        aria-hidden
        className="absolute inset-0 rounded-full blur-xl animate-glow-pulse"
        style={{ background: "var(--gradient-brand)" }}
      />
      <svg viewBox="0 0 48 48" width={size} height={size} className="relative" role="img" aria-label="Nexora">
        <defs>
          <linearGradient id="nx-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.86 0.15 195)" />
            <stop offset="55%" stopColor="oklch(0.72 0.2 305)" />
            <stop offset="100%" stopColor="oklch(0.65 0.21 275)" />
          </linearGradient>
        </defs>
        <circle cx="24" cy="24" r="21" fill="none" stroke="url(#nx-g)" strokeWidth="1.2" opacity="0.55" />
        <circle cx="24" cy="24" r="15" fill="none" stroke="url(#nx-g)" strokeWidth="0.8" opacity="0.35" />
        <path
          d="M16 33V15l16 18V15"
          fill="none"
          stroke="url(#nx-g)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function NexoraLogo({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <NexoraMark size={size} />
      <span className="font-display text-xl font-semibold tracking-tight text-gradient">Nexora</span>
    </span>
  );
}
