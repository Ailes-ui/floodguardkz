import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell } from "lucide-react";
import { data, fmtTime, type RiskLevel } from "@/lib/floodguard/data";
import { DemoTag, PageHeader, RiskBadge, riskStyles } from "@/components/floodguard/ui";

export const Route = createFileRoute("/alerts")({
  head: () => ({ meta: [
    { title: "Alerts — FloodGuard" },
    { name: "description", content: "Flood warning history with severity, station and time (demo alerts)." },
    { property: "og:title", content: "FloodGuard Alerts" },
    { property: "og:description", content: "Warning history and alert severity." },
  ] }),
  component: Alerts,
});

function Alerts() {
  const all = data.alerts();
  const [f, setF] = useState<RiskLevel | "all">("all");
  const list = f === "all" ? all : all.filter((a) => a.severity === f);
  return (
    <>
      <PageHeader title="Alerts" subtitle="Warning history across all stations" />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(["all", "low", "moderate", "high", "severe"] as const).map((k) => (
          <button key={k} onClick={() => setF(k)} className={`rounded-lg border px-3 py-1.5 text-sm capitalize ${f === k ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
            {k} {k !== "all" && <span className="ml-1 font-mono text-xs">{all.filter((a) => a.severity === k).length}</span>}
          </button>
        ))}
        <span className="ml-auto"><DemoTag /></span>
      </div>
      <ul className="space-y-3">
        {list.map((a) => (
          <li key={a.id} className="flex gap-4 rounded-xl border border-border bg-card p-4">
            <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg" style={{ background: `color-mix(in oklab, ${riskStyles[a.severity].fill} 18%, transparent)`, color: riskStyles[a.severity].fill }}><Bell className="size-4" /></span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><RiskBadge risk={a.severity} /><span className="font-mono text-xs text-muted-foreground">{a.id}</span></div>
              <p className="mt-1.5 font-medium">{a.message}</p>
              <p className="mt-1 text-xs text-muted-foreground">{a.station} · {fmtTime(a.time)}</p>
            </div>
          </li>
        ))}
        {!list.length && <li className="py-10 text-center text-sm text-muted-foreground">No alerts at this severity.</li>}
      </ul>
    </>
  );
}
