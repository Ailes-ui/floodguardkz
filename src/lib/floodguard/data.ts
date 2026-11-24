/**
 * FloodGuard data layer — ALL VALUES ARE SIMULATED DEMO DATA.
 * The UI reads only through `FloodDataSource`; replace `demoSource` with an
 * implementation backed by real sensors (GSM/LoRaWAN) so pages need no changes.
 */
export type ScenarioId = "normal" | "rise" | "critical";
export type RiskLevel = "normal" | "attention" | "critical";

export interface Scenario {
  id: ScenarioId; button: string; level: number; delta: number; speed: string;
  status: string; risk: RiskLevel; action: string;
}
export interface ObservationPoint { id: string; name: string; lat: number; lng: number; level: number; delta: number; online: boolean; risk: RiskLevel }
export interface LogEntry { time: string; text: string }
export interface SeriesPoint { time: string; level: number }

export interface FloodDataSource {
  isDemo: boolean;
  scenario(id: ScenarioId): Scenario;
  series(id: ScenarioId): SeriesPoint[];
  points(id: ScenarioId): ObservationPoint[];
  log(id: ScenarioId): LogEntry[];
}

/** Conditional demo thresholds, cm. Must be agreed with Kazhydromet / emergency services. */
export const THRESHOLDS = { normal: 200, warning: 230, critical: 300 };
export const UPDATED = "20:30";
export const CENTER: [number, number] = [50.107, 73.14];

export const ACK_TEXT = "Оператор подтвердил получение предупреждения";

const SCENARIOS: Record<ScenarioId, Scenario> = {
  normal: { id: "normal", button: "Нормальный уровень", level: 178, delta: 1, speed: "низкая", status: "Нормальная ситуация", risk: "normal", action: "Продолжить плановое наблюдение" },
  rise: { id: "rise", button: "Быстрый подъём", level: 236, delta: 12, speed: "повышенная", status: "Повышенное внимание", risk: "attention", action: "Требуется проверка участка ответственным специалистом" },
  critical: { id: "critical", button: "Критическая ситуация", level: 318, delta: 28, speed: "высокая", status: "Критическая ситуация", risk: "critical", action: "Необходимо проверить участок и применить утверждённый план реагирования" },
};

const LOGS: Record<ScenarioId, LogEntry[]> = {
  normal: [
    { time: "20:10", text: "Система получила новое демонстрационное значение" },
    { time: "20:25", text: "Изменение уровня остаётся в нормальном диапазоне" },
    { time: "20:30", text: "Все точки наблюдения доступны" },
  ],
  rise: [
    { time: "20:10", text: "Зафиксировано ускорение подъёма воды" },
    { time: "20:18", text: "Превышен демонстрационный предупредительный порог" },
    { time: "20:19", text: "Сформировано уведомление ответственному сотруднику" },
  ],
  critical: [
    { time: "20:10", text: "Зафиксирован быстрый рост на нескольких точках" },
    { time: "20:14", text: "Превышен демонстрационный критический порог" },
    { time: "20:15", text: "Отправлено повторное предупреждение" },
    { time: "20:17", text: "Ожидается подтверждение оператора" },
  ],
};

// Coordinates follow the real Nura riverbed (OpenStreetMap) so demo markers sit on water.
const BASE_POINTS = [
  { id: "P1", name: "Гидропост на реке Нура", lat: 50.1075, lng: 73.1559, k: 1 },
  { id: "P2", name: "Мост через Нуру", lat: 50.1016, lng: 73.1713, k: 0.93 },
  { id: "P3", name: "Локальный сток A", lat: 50.112, lng: 73.1455, k: 0.62 },
  { id: "P4", name: "Локальный сток B", lat: 50.1058, lng: 73.1124, k: 0.55 },
];

export const riskForLevel = (cm: number): RiskLevel =>
  cm >= THRESHOLDS.critical ? "critical" : cm >= THRESHOLDS.warning ? "attention" : "normal";

export const demoSource: FloodDataSource = {
  isDemo: true,
  scenario: (id) => SCENARIOS[id],
  series(id) {
    const s = SCENARIOS[id];
    return Array.from({ length: 13 }, (_, i) => {
      const hoursAgo = 12 - i;
      const curve = id === "normal" ? hoursAgo * s.delta * 0.8 : id === "rise" ? hoursAgo * 6 + (hoursAgo < 4 ? 0 : (hoursAgo - 4) * 0.5) : (hoursAgo ** 1.6) * 5.6;
      const h = String((20 - hoursAgo + 24) % 24).padStart(2, "0");
      return { time: `${h}:30`, level: Math.round(s.level - curve) };
    });
  },
  points(id) {
    const s = SCENARIOS[id];
    return BASE_POINTS.map((p) => {
      const level = Math.round(s.level * p.k);
      // Local runoff points follow scenario risk; river points by level.
      const risk = p.k < 0.7 ? s.risk : riskForLevel(level) === "normal" && s.risk !== "normal" ? "attention" : riskForLevel(level);
      return { id: p.id, name: p.name, lat: p.lat, lng: p.lng, level, delta: Math.max(1, Math.round(s.delta * p.k)), online: true, risk };
    });
  },
  log: (id) => LOGS[id],
};

export const data: FloodDataSource = demoSource;

export const riskColor: Record<RiskLevel, string> = { normal: "var(--safe)", attention: "var(--caution)", critical: "var(--destructive)" };
