import { describe, it, expect } from "vitest";
import { Level } from "@/domain/stats/value-objects/Level";

describe("Level Value Object - Comportamiento", () => {
  it("crea niveles válidos en los límites", () => {
    expect(Level.create(1).value).toBe(1);
    expect(Level.create(50).value).toBe(50);
    expect(Level.create(100).value).toBe(100);
  });

  it("lanza excepción si <1 o >100", () => {
    expect(() => Level.create(0)).toThrow(/entre 1 y 100/);
    expect(() => Level.create(-1)).toThrow();
    expect(() => Level.create(101)).toThrow();
    expect(() => Level.create(999)).toThrow();
  });

  it("lanza si no es entero o no es finito", () => {
    expect(() => Level.create(50.5)).toThrow(/entero/);
    expect(() => Level.create(NaN as unknown as number)).toThrow();
    expect(() => Level.create(Infinity as unknown as number)).toThrow();
  });

  it("from acepta Level existente y número", () => {
    const l1 = Level.create(75);
    expect(Level.from(l1)).toBe(l1);
    expect(Level.from(75).value).toBe(75);
  });

  it("equals compara por valor", () => {
    expect(Level.create(50).equals(Level.create(50))).toBe(true);
    expect(Level.create(50).equals(Level.create(51))).toBe(false);
  });

  it("toNumber y toString", () => {
    const l = Level.create(42);
    expect(l.toNumber()).toBe(42);
    expect(l.toString()).toBe("42");
  });
});
