import type { ReactNode } from "react";
import { FlaskConical } from "lucide-react";
import type { RiskLevel } from "@/lib/floodguard/data";
import { cn } from "@/lib/utils";

export const riskStyles: Record<RiskLevel, { label: string; text: string; bg: string; fill: string }> = {
  low: { label: "Low", text: "text-safe", bg: "bg-safe/15 border-safe/40", fill: "var(--safe)" },
  moderate: { label: "Moderate", text: "text-caution", bg: "bg-caution/15 border-caution/40", fill: "var(--caution)" },
  high: { label: "High", text: "text-warning", bg: "bg-warning/15 border-warning/40", fill: "var(--warning)" },
  severe: { label: "Severe", text: "text-destructive", bg: "bg-destructive/15 border-destructive/40", fill: "var(--destructive)" },
};

export function RiskBadge({ risk, className }: { risk: RiskLevel; className?: string }) {
  const s = riskStyles[risk];
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", s.bg, s.text, className)}><span className="size-1.5 rounded-full bg-current" />{s.label}</span>;
}

export function DemoTag() {
  return <span className="inline-flex items-center gap-1 rounded border border-warning/50 bg-warning/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-warning"><FlaskConical className="size-3" />Demo data</span>;
}

export function Panel({ title, action, children, className }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl border border-border bg-card p-5", className)}>
      {title && <header className="mb-4 flex items-center justify-between gap-2"><h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>{action ?? <DemoTag />}</header>}
      {children}
    </section>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return <div className="mb-6"><h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1><p className="mt-1 text-sm text-muted-foreground">{subtitle}</p></div>;
}

export const chartTooltip = { contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)", fontSize: 12 } };
