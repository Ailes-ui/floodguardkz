import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { data, riskFor } from "@/lib/floodguard/data";
import { chartTooltip, PageHeader, Panel, RiskBadge } from "@/components/floodguard/ui";

export const Route = createFileRoute("/monitoring")({
  head: () => ({ meta: [
    { title: "Monitoring — FloodGuard" },
    { name: "description", content: "Historical river levels, daily measurements and changes over time (demo data)." },
    { property: "og:title", content: "FloodGuard Monitoring" },
    { property: "og:description", content: "Historical water level charts and daily measurements." },
  ] }),
  component: Monitoring,
});

function Monitoring() {
  const [days, setDays] = useState(14);
  const hist = data.history(days);
  const daily = Array.from({ length: days }, (_, d) => {
    const s = hist.slice(d * 24, d * 24 + 24);
    const lv = s.map((r) => r.level);
    return { date: s[0].time.slice(5, 10), avg: +(lv.reduce((a, b) => a + b, 0) / lv.length).toFixed(2), min: Math.min(...lv), max: Math.max(...lv), rain: +s.reduce((a, r) => a + r.rain, 0).toFixed(1), temp: +(s.reduce((a, r) => a + r.temp, 0) / s.length).toFixed(1) };
  }).map((d, i, arr) => ({ ...d, change: i ? +((d.avg - arr[i - 1].avg) * 100).toFixed(0) : 0 }));
  const series = hist.filter((_, i) => i % 3 === 0).map((r) => ({ t: r.time.slice(5, 10), level: r.level }));

  return (
    <>
      <PageHeader title="Monitoring" subtitle="Historical measurements from Mill Bridge Station (ST-02)" />
      <div className="mb-4 flex gap-2">
        {[7, 14, 30].map((d) => (
          <button key={d} onClick={() => setDays(d)} className={`rounded-lg border px-3 py-1.5 text-sm ${days === d ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>{d} days</button>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Historical water level" className="lg:col-span-2">
          <div className="h-72"><ResponsiveContainer><LineChart data={series}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="t" stroke="var(--muted-foreground)" fontSize={11} minTickGap={30} />
            <YAxis stroke="var(--muted-foreground)" fontSize={11} unit=" m" width={50} domain={["auto", "auto"]} />
            <Tooltip {...chartTooltip} />
            <Line dataKey="level" name="Level (m)" stroke="var(--chart-1)" dot={false} strokeWidth={2} />
          </LineChart></ResponsiveContainer></div>
        </Panel>
        <Panel title="Daily level change (cm)">
          <div className="h-60"><ResponsiveContainer><BarChart data={daily}>
            <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} />
            <YAxis stroke="var(--muted-foreground)" fontSize={11} width={40} />
            <Tooltip {...chartTooltip} />
            <Bar dataKey="change" name="Change (cm)" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
          </BarChart></ResponsiveContainer></div>
        </Panel>
        <Panel title="Daily rainfall (mm)">
          <div className="h-60"><ResponsiveContainer><BarChart data={daily}>
            <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} />
            <YAxis stroke="var(--muted-foreground)" fontSize={11} width={40} />
            <Tooltip {...chartTooltip} />
            <Bar dataKey="rain" name="Rain (mm)" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
          </BarChart></ResponsiveContainer></div>
        </Panel>
        <Panel title="Daily measurements" className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground"><tr>{["Date", "Avg", "Min", "Max", "Δ day", "Rain", "Temp", "Risk"].map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}</tr></thead>
              <tbody className="font-mono">
                {[...daily].reverse().map((d) => (
                  <tr key={d.date} className="border-t border-border">
                    <td className="px-3 py-2">{d.date}</td><td className="px-3 py-2">{d.avg} m</td><td className="px-3 py-2">{d.min} m</td><td className="px-3 py-2">{d.max} m</td>
                    <td className={`px-3 py-2 ${d.change > 0 ? "text-warning" : "text-safe"}`}>{d.change > 0 ? "+" : ""}{d.change} cm</td>
                    <td className="px-3 py-2">{d.rain} mm</td><td className="px-3 py-2">{d.temp} °C</td><td className="px-3 py-2 font-sans"><RiskBadge risk={riskFor(d.max)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </>
  );
}
