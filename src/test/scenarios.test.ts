import { describe, expect, it } from "vitest";
import { ACK_TEXT, data } from "@/lib/floodguard/data";

describe("demo scenarios", () => {
  it("normal: 178 cm, +1 cm/h, green status", () => {
    const s = data.scenario("normal");
    expect([s.level, s.delta, s.status, s.risk]).toEqual([178, 1, "Нормальная ситуация", "normal"]);
  });
  it("rapid rise: 236 cm, +12 cm/h, attention", () => {
    const s = data.scenario("rise");
    expect([s.level, s.delta, s.status, s.risk]).toEqual([236, 12, "Повышенное внимание", "attention"]);
  });
  it("critical: 318 cm, +28 cm/h, critical", () => {
    const s = data.scenario("critical");
    expect([s.level, s.delta, s.status, s.risk]).toEqual([318, 28, "Критическая ситуация", "critical"]);
  });
  it("chart ends at the scenario level", () => {
    expect(data.series("critical").at(-1)?.level).toBe(318);
  });
  it("critical log ends awaiting operator confirmation", () => {
    expect(data.log("critical").at(-1)?.text).toBe("Ожидается подтверждение оператора");
    expect(ACK_TEXT).toBe("Оператор подтвердил получение предупреждения");
  });
});
