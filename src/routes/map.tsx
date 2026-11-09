import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { data } from "@/lib/floodguard/data";
import { PageHeader, Panel, RiskBadge, riskStyles } from "@/components/floodguard/ui";

export const Route = createFileRoute("/map")({
  head: () => ({ meta: [
    { title: "Station Map — FloodGuard" },
    { name: "description", content: "Monitoring stations, river points and flood risk zones (demo layout)." },
    { property: "og:title", content: "FloodGuard Station Map" },
    { property: "og:description", content: "Monitoring stations and flood risk zones along the river." },
  ] }),
  component: MapPage,
});

const river = "M0,18 C15,20 20,30 30,38 S45,48 55,52 S70,60 78,66 S92,80 100,86";

function MapPage() {
  const stations = data.stations();
  const [sel, setSel] = useState(stations[2]!);
  return (
    <>
      <PageHeader title="Monitoring map" subtitle="Schematic basin view — station positions are illustrative" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Mill Creek basin" className="lg:col-span-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-secondary">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
              <defs><pattern id="g" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0V10" fill="none" stroke="var(--border)" strokeWidth="0.2" /></pattern></defs>
              <rect width="100" height="100" fill="url(#g)" />
              <ellipse cx="80" cy="70" rx="16" ry="12" fill="var(--warning)" fillOpacity="0.15" stroke="var(--warning)" strokeOpacity="0.5" strokeWidth="0.3" strokeDasharray="1 1" />
              <ellipse cx="90" cy="84" rx="12" ry="9" fill="var(--destructive)" fillOpacity="0.12" stroke="var(--destructive)" strokeOpacity="0.5" strokeWidth="0.3" strokeDasharray="1 1" />
              <ellipse cx="46" cy="47" rx="14" ry="9" fill="var(--caution)" fillOpacity="0.1" stroke="var(--caution)" strokeOpacity="0.4" strokeWidth="0.3" strokeDasharray="1 1" />
              <path d={river} fill="none" stroke="var(--primary)" strokeOpacity="0.25" strokeWidth="5" />
              <path d={river} fill="none" stroke="var(--primary)" strokeWidth="1.4" />
              <path d="M30,72 C34,60 32,48 34,42" fill="none" stroke="var(--primary)" strokeWidth="0.7" />
            </svg>
            {stations.map((s) => (
              <button key={s.id} onClick={() => setSel(s)} style={{ left: `${s.x}%`, top: `${s.y}%`, background: riskStyles[s.risk].fill }} aria-label={s.name}
                className={`absolute -translate-x-1/2 -translate-y-1/2 border-2 border-background shadow-glow transition-transform hover:scale-125 ${s.type === "station" ? "size-5 rounded-md" : "size-4 rounded-full"} ${sel.id === s.id ? "scale-125 ring-2 ring-foreground" : ""} ${s.online ? "" : "opacity-40"}`} />
            ))}
            <span className="absolute left-3 top-3 rounded bg-background/80 px-2 py-1 font-mono text-[10px] text-muted-foreground">SCHEMATIC · NOT TO SCALE</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="size-3 rounded-sm bg-primary" />Station</span>
            <span className="flex items-center gap-1.5"><span className="size-3 rounded-full bg-primary" />Monitoring point</span>
            {(["low", "moderate", "high", "severe"] as const).map((r) => <span key={r} className="flex items-center gap-1.5"><span className="size-3 rounded-full" style={{ background: riskStyles[r].fill }} />{riskStyles[r].label} zone</span>)}
          </div>
        </Panel>
        <div className="space-y-4">
          <Panel title="Selected">
            <p className="font-mono text-xs text-muted-foreground">{sel.id} · {sel.type === "station" ? "Monitoring station" : "River point"}</p>
            <p className="mt-1 font-display text-xl font-semibold">{sel.name}</p>
            <div className="mt-3 flex items-center gap-3"><span className="font-display text-3xl">{sel.level} m</span><RiskBadge risk={sel.risk} /></div>
            <p className={`mt-2 text-xs ${sel.online ? "text-safe" : "text-destructive"}`}>{sel.online ? "● Sensor online" : "● Sensor offline"}</p>
          </Panel>
          <Panel title="All points">
            <ul className="divide-y divide-border">
              {stations.map((s) => (
                <li key={s.id}><button onClick={() => setSel(s)} className="flex w-full items-center justify-between py-2.5 text-left text-sm hover:text-primary">
                  <span><span className="font-mono text-xs text-muted-foreground">{s.id}</span> {s.name}</span><RiskBadge risk={s.risk} />
                </button></li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}
