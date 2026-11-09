import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Activity, Bell, BrainCircuit, Droplets, LayoutDashboard, Map, TriangleAlert } from "lucide-react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/monitoring", label: "Monitoring", icon: Activity },
  { to: "/prediction", label: "Prediction", icon: BrainCircuit },
  { to: "/map", label: "Map", icon: Map },
  { to: "/alerts", label: "Alerts", icon: Bell },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground md:flex">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-4 md:flex">
        <Brand />
        <nav className="mt-8 flex flex-col gap-1">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: true }} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" activeProps={{ className: "bg-sidebar-accent text-primary" }}>
              <n.icon className="size-4" />{n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto rounded-lg border border-sidebar-border p-3 text-xs text-muted-foreground">
          <p className="font-medium text-sidebar-foreground">Data source</p>
          <p className="mt-1">Simulated demo feed. ESP32 sensor & ML integration pending.</p>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col pb-20 md:pb-0">
        <div className="demo-stripes flex items-center justify-center gap-2 border-b border-warning/40 px-4 py-2 text-center text-xs text-warning">
          <TriangleAlert className="size-3.5 shrink-0" />
          <span><strong>DEMO MODE</strong> — all measurements, forecasts and alerts are simulated and are not real-world observations.</span>
        </div>
        <header className="flex items-center border-b border-border px-4 py-3 md:hidden"><Brand /></header>
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-8">{children}</main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-sidebar-border bg-sidebar md:hidden">
        {nav.map((n) => (
          <Link key={n.to} to={n.to} activeOptions={{ exact: true }} className="flex flex-col items-center gap-1 py-2.5 text-[11px] text-muted-foreground" activeProps={{ className: "text-primary" }}>
            <n.icon className="size-5" />{n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-lg bg-water text-primary-foreground shadow-glow"><Droplets className="size-5" /></span>
      <span className="font-display text-lg font-bold tracking-tight">Flood<span className="text-primary">Guard</span></span>
    </Link>
  );
}
