import { createFileRoute, Link } from "@tanstack/react-router";
import { Area, AreaChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowDownRight, ArrowUpRight, CloudRain, Droplets, Gauge, Thermometer } from "lucide-react";
import { data, fmtTime, THRESHOLDS } from "@/lib/floodguard/data";
import { chartTooltip, DemoTag, PageHeader, Panel, RiskBadge, riskStyles } from "@/components/floodguard/ui";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Dashboard — FloodGuard" },
    { name: "description", content: "Live river level, trend, weather and flood risk overview (demo data)." },
    { property: "og:title", content: "FloodGuard Dashboard" },
    { property: "og:description", content: "Flood monitoring and early warning for small rivers." },
  ] }),
  component: Dashboard,
});

function Stat({ icon: Icon, label, value, sub }: { icon: typeof Droplets; label: string; value: string; sub: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between text-muted-foreground"><span className="text-xs font-medium uppercase tracking-wide">{label}</span><Icon className="size-4" /></div>
      <p className="mt-3 font-display text-3xl font-semibold">{value}</p>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

function Dashboard() {
  const c = data.current();
  const h = data.history(2).map((r) => ({ ...r, t: r.time.slice(11, 16) }));
  const rising = c.trend >= 0;
  const rs = riskStyles[c.risk];
  return (
    <>
      <PageHeader title="River overview" subtitle={`Mill Creek basin · last update ${fmtTime(c.updated)}`} />
      <div className={`mb-6 flex flex-col gap-4 rounded-xl border p-5 md:flex-row md:items-center md:justify-between ${rs.bg}`}>
        <div>
          <div className="flex items-center gap-2"><span className="text-xs uppercase tracking-wide text-muted-foreground">Current risk status</span><DemoTag /></div>
          <p className={`mt-1 font-display text-3xl font-bold ${rs.text}`}>{rs.label} risk</p>
          <p className="mt-1 text-sm text-muted-foreground">Level {c.level} m vs. thresholds: watch {THRESHOLDS.moderate} m · high {THRESHOLDS.high} m · severe {THRESHOLDS.severe} m</p>
        </div>
        <Link to="/prediction" className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">View 48h forecast</Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Droplets} label="Water level" value={`${c.level} m`} sub={<RiskBadge risk={c.risk} />} />
        <Stat icon={Gauge} label="Trend (6h)" value={`${rising ? "+" : ""}${c.trend} cm/h`} sub={<span className={`inline-flex items-center gap-1 ${rising ? "text-warning" : "text-safe"}`}>{rising ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}{rising ? "Rising" : "Falling"}</span>} />
        <Stat icon={Thermometer} label="Temperature" value={`${c.temp} °C`} sub={`Humidity ${c.humidity}%`} />
        <Stat icon={CloudRain} label="Weather" value={c.weather} sub={`${c.rain24h} mm rain / 24h`} />
      </div>
      <Panel title="Water level — last 48 hours" className="mt-6">
        <div className="h-72">
          <ResponsiveContainer>
            <AreaChart data={h}>
              <defs><linearGradient id="lv" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} /><stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} /></linearGradient></defs>
              <XAxis dataKey="t" stroke="var(--muted-foreground)" fontSize={11} interval={5} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} domain={[1, 3.6]} unit=" m" width={50} />
              <Tooltip {...chartTooltip} />
              <ReferenceLine y={THRESHOLDS.high} stroke="var(--warning)" strokeDasharray="4 4" label={{ value: "High", fill: "var(--warning)", fontSize: 11 }} />
              <ReferenceLine y={THRESHOLDS.moderate} stroke="var(--caution)" strokeDasharray="4 4" />
              <Area dataKey="level" name="Level (m)" stroke="var(--chart-1)" fill="url(#lv)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </>
  );
}
