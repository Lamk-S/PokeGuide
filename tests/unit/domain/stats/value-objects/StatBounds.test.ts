import { describe, it, expect } from "vitest";
import { Level } from "@/domain/stats/value-objects/Level";
import { IV } from "@/domain/stats/value-objects/IV";
import { EV } from "@/domain/stats/value-objects/EV";

describe("Stat Value Objects - Validaciones de límites", () => {
  it("Level debe lanzar error si está fuera del rango permitido", () => {
    expect(() => Level.create(0)).toThrow();
    expect(() => Level.create(101)).toThrow();
    expect(() => Level.create(50).value).not.toThrow;
    expect(Level.create(1).value).toBe(1);
    expect(Level.create(100).value).toBe(100);
  });

  it("IV debe normalizar el valor si es menor a 0 o mayor a 31", () => {
    expect(IV.create(-1).value).toBe(0);
    expect(IV.create(32).value).toBe(31);
    expect(IV.create(15).value).toBe(15);
  });

  it("EV debe normalizar el valor si es menor a 0 o excede el límite individual", () => {
    expect((EV.create(-1) as { value: number }).value).toBe(0);
    expect((EV.create(256) as { value: number }).value).toBe(252);
    const emptySet = EV.createEmptySet();
    expect(EV.create(-1, 'hp' as never, emptySet as never)).toBe(0);
    expect(EV.create(256, 'hp' as never, emptySet as never)).toBe(252);
  });

  it("EVDistribution normaliza total <=510", () => {
    const over = EV.createSet({ hp:252, attack:252, defense:252, "special-attack":252, "special-defense":252, speed:252 });
    const total = Object.values(over).reduce((a,b)=>a+b,0);
    expect(total).toBeLessThanOrEqual(510);
  });

  it("Shedinja HP base 1 siempre 1", async () => {
    const { calculateStats } = await import("@/domain/stats/services/StatCalculator");
    const stats = calculateStats({
      baseStats: { hp:1, attack:90, defense:45, "special-attack":30, "special-defense":30, speed:40 },
      level: 50,
      nature: { name:"Hardy", increasedStat:null, decreasedStat:null },
      ivs: { hp:31, attack:31, defense:31, "special-attack":31, "special-defense":31, speed:31 },
      evs: { hp:252, attack:0, defense:0, "special-attack":0, "special-defense":0, speed:0 },
      generation: 9,
    });
    expect(stats.hp).toBe(1);
  });
});
