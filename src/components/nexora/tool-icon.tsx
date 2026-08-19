import {
  AlignLeft,
  Atom,
  CalendarClock,
  Code2,
  Compass,
  FileCheck2,
  FlaskConical,
  GraduationCap,
  Languages,
  Layers,
  ListChecks,
  NotebookPen,
  PenLine,
  Presentation,
  Sigma,
  Sparkles,
  Telescope,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  GraduationCap,
  AlignLeft,
  NotebookPen,
  ListChecks,
  Layers,
  Sigma,
  Atom,
  FlaskConical,
  Code2,
  PenLine,
  Telescope,
  FileCheck2,
  Presentation,
  CalendarClock,
  Languages,
  Compass,
};

export function ToolIcon({ name, accent, size = 44 }: { name: string; accent: string; size?: number }) {
  const Icon = MAP[name] ?? Sparkles;
  return (
    <span
      className="inline-flex items-center justify-center rounded-xl border border-border"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 20%, oklch(0.7 0.18 ${accent} / 35%), transparent 70%)`,
        boxShadow: `0 0 26px -12px oklch(0.7 0.18 ${accent} / 90%)`,
      }}
    >
      <Icon className="size-5" style={{ color: `oklch(0.85 0.13 ${accent})` }} />
    </span>
  );
}
