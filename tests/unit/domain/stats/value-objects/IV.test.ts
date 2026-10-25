import { describe, it, expect } from "vitest";
import { IV } from "@/domain/stats/value-objects/IV";

describe("IV Value Object - clamp silencioso 0-31", () => {
  it("create clampa a 0-31", () => {
    expect(IV.create(0).value).toBe(0);
    expect(IV.create(31).value).toBe(31);
    expect(IV.create(-10).value).toBe(0);
    expect(IV.create(100).value).toBe(31);
    expect(IV.create(15.9).value).toBe(15);
  });

  it("createPerfectSet devuelve 31 en todos los stats", () => {
    const perfect = IV.createPerfectSet();
    expect(perfect.hp).toBe(31);
    expect(perfect.attack).toBe(31);
    expect(perfect.defense).toBe(31);
    expect(perfect["special-attack"]).toBe(31);
    expect(perfect["special-defense"]).toBe(31);
    expect(perfect.speed).toBe(31);
  });

  it("createEmptySet devuelve 0 en todos", () => {
    const empty = IV.createEmptySet();
    expect(Object.values(empty).every((v) => v === 0)).toBe(true);
  });

  it("createSet clampa cada stat y rellena faltantes con 31", () => {
    const custom = IV.createSet({ hp: 31, attack: 0 });
    expect(custom.hp).toBe(31);
    expect(custom.attack).toBe(0);
    expect(custom.defense).toBe(31);

    const clamped = IV.createSet({ hp: 32, attack: -5 } as never);
    expect(clamped.hp).toBe(31);
    expect(clamped.attack).toBe(0);
  });

  it("toNumber, equals y toString", () => {
    const a = IV.create(20);
    const b = IV.create(20);
    const c = IV.create(21);
    expect(a.toNumber()).toBe(20);
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
    expect(a.toString()).toBe("20");
  });
});
