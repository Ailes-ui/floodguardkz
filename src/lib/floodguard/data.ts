/**
 * FloodGuard data layer.
 * All values here are SIMULATED DEMO DATA. Replace `demoSource` with an
 * implementation of `FloodDataSource` backed by ESP32 telemetry and an ML
 * forecasting service; the UI only depends on this interface.
 */
export type RiskLevel = "low" | "moderate" | "high" | "severe";

export interface Reading { time: string; level: number; temp: number; rain: number }
export interface Station { id: string; name: string; x: number; y: number; level: number; risk: RiskLevel; type: "station" | "point"; online: boolean }
export interface Forecast { horizonHours: number; points: { time: string; predicted: number; low: number; high: number }[]; peak: number; probability: number; risk: RiskLevel; factors: { label: string; weight: number }[]; model: string }
export interface Alert { id: string; time: string; severity: RiskLevel; station: string; message: string }
export interface Current { level: number; trend: number; temp: number; weather: string; humidity: number; rain24h: number; risk: RiskLevel; updated: string }

export interface FloodDataSource {
  isDemo: boolean;
  current(): Current;
  history(days: number): Reading[];
  forecast(): Forecast;
  stations(): Station[];
  alerts(): Alert[];
}

export const THRESHOLDS = { moderate: 2.2, high: 2.8, severe: 3.4 }; // metres
export const riskFor = (l: number): RiskLevel =>
  l >= THRESHOLDS.severe ? "severe" : l >= THRESHOLDS.high ? "high" : l >= THRESHOLDS.moderate ? "moderate" : "low";

// deterministic pseudo-random so SSR and client match
const rand = (i: number) => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); };
const BASE = new Date("2026-11-09T16:00:00Z").getTime();
const H = 3600_000;

const hourly: Reading[] = Array.from({ length: 24 * 30 }, (_, k) => {
  const i = 24 * 30 - 1 - k;
  const t = BASE - i * H;
  const day = k / 24;
  const level = 1.4 + 0.35 * Math.sin(day / 4) + (day > 26 ? (day - 26) * 0.22 : 0) + rand(k) * 0.08 + 0.05 * Math.sin(k / 3.8);
  return { time: new Date(t).toISOString(), level: +level.toFixed(2), temp: +(6 + 5 * Math.sin((k % 24) / 24 * Math.PI * 2 - 1.6) + rand(k + 7) * 1.5).toFixed(1), rain: +(day > 25 ? rand(k + 3) * 4 : rand(k + 3) > 0.85 ? rand(k) * 2 : 0).toFixed(1) };
});

export const demoSource: FloodDataSource = {
  isDemo: true,
  current() {
    const last = hourly[hourly.length - 1]!, prev = hourly[hourly.length - 7]!;
    return { level: last.level, trend: +((last.level - prev.level) / 6 * 100).toFixed(1), temp: last.temp, weather: "Light rain", humidity: 86, rain24h: +hourly.slice(-24).reduce((a, r) => a + r.rain, 0).toFixed(1), risk: riskFor(last.level), updated: last.time };
  },
  history(days) { return hourly.slice(-24 * days); },
  forecast() {
    const last = hourly[hourly.length - 1]!.level;
    const points = Array.from({ length: 49 }, (_, h) => {
      const p = last + 0.9 * (1 - Math.exp(-h / 14)) - (h > 30 ? (h - 30) * 0.012 : 0);
      const u = 0.05 + h * 0.006;
      return { time: new Date(BASE + h * H).toISOString(), predicted: +p.toFixed(2), low: +(p - u).toFixed(2), high: +(p + u).toFixed(2) };
    });
    const peak = Math.max(...points.map((p) => p.predicted));
    return { horizonHours: 48, points, peak, probability: 68, risk: riskFor(peak), model: "Demo heuristic (placeholder for ML model)", factors: [
      { label: "Upstream rainfall (last 72h)", weight: 42 },
      { label: "Rising level trend", weight: 27 },
      { label: "Soil saturation estimate", weight: 18 },
      { label: "Snowmelt / temperature", weight: 13 },
    ] };
  },
  stations() {
    return [
      { id: "ST-01", name: "Upper Ford Station", x: 14, y: 22, level: 2.31, risk: "moderate", type: "station", online: true },
      { id: "ST-02", name: "Mill Bridge Station", x: 44, y: 46, level: 2.62, risk: "moderate", type: "station", online: true },
      { id: "ST-03", name: "Village Weir Station", x: 76, y: 64, level: 2.95, risk: "high", type: "station", online: true },
      { id: "MP-04", name: "Tributary Point A", x: 30, y: 70, level: 1.8, risk: "low", type: "point", online: true },
      { id: "MP-05", name: "Floodplain Point B", x: 62, y: 30, level: 2.1, risk: "low", type: "point", online: false },
      { id: "MP-06", name: "Lower Meadow Point", x: 90, y: 82, level: 3.05, risk: "high", type: "point", online: true },
    ];
  },
  alerts() {
    const a: [number, RiskLevel, string, string][] = [
      [1, "high", "Village Weir Station", "Water level exceeded 2.8 m high-risk threshold"],
      [5, "moderate", "Mill Bridge Station", "Rapid rise detected: +12 cm/h"],
      [9, "moderate", "Upper Ford Station", "Level above 2.2 m watch threshold"],
      [20, "low", "Floodplain Point B", "Sensor offline — no data for 30 min"],
      [46, "moderate", "System", "Heavy rainfall forecast upstream (demo)"],
      [120, "low", "Village Weir Station", "Level returned to normal range"],
      [190, "severe", "Lower Meadow Point", "Severe level 3.4 m — evacuation advisory (drill)"],
      [300, "low", "System", "Monthly sensor calibration completed"],
    ];
    return a.map(([h, severity, station, message], i) => ({ id: `AL-${100 + i}`, time: new Date(BASE - h * H).toISOString(), severity, station, message }));
  },
};

export const data: FloodDataSource = demoSource;

export const fmtTime = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "UTC" }) + " UTC";
