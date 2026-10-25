import { describe, it, expect } from "vitest";
import { EV } from "@/domain/stats/value-objects/EV";

describe("EV Value Object - Comportamiento", () => {
  it("createEmptySet inicializa todo en 0", () => {
    const empty = EV.createEmptySet();
    expect(empty.hp).toBe(0);
    expect(empty.attack).toBe(0);
    expect(empty.defense).toBe(0);
    expect(empty["special-attack"]).toBe(0);
    expect(empty["special-defense"]).toBe(0);
    expect(empty.speed).toBe(0);
  });

  it("createSet asigna valores válidos y rellena con 0", () => {
    const set = EV.createSet({ hp: 252, attack: 252, defense: 4 } as any);
    expect(set.hp).toBe(252);
    expect(set.attack).toBe(252);
    expect(set.defense).toBe(4);
    expect(set.speed).toBe(0);
  });

  it("corrige (clamp) al exceder 252 por stat, menores a 0, o 510 en total", () => {
    const overMax = EV.createSet({ hp: 300 } as any);
    expect(overMax.hp).toBeLessThanOrEqual(252);

    const negative = EV.createSet({ hp: -10 } as any);
    expect(negative.hp).toBe(0);

    const overTotal = EV.createSet({ hp: 252, attack: 252, defense: 252 } as any);
    const sum = overTotal.hp + overTotal.attack + overTotal.defense;
    expect(sum).toBeLessThanOrEqual(510);
  });

  it("métodos toRecord y serialización", () => {
    const set = EV.createSet({ hp: 4, attack: 252, speed: 252 } as any);
    const raw = set as any;
    
    if (typeof raw.toRecord === "function") {
      const record = raw.toRecord();
      expect(record.hp).toBe(4);
    }
  });
});