import { describe, it, expect } from "vitest";
import { SmogonSpeciesMapper } from "../../../../../src/infrastructure/battle/smogon/SmogonSpeciesMapper";

describe("SmogonSpeciesMapper", () => {
  it("rechaza formas en generaciones previas a su debut", () => {
    const res = SmogonSpeciesMapper.resolve({ id: 1000, name: "palafin" }, 8);
    expect(res.supported).toBe(false);
    expect(res.reason).toContain("debutó en Gen 9");
  });

  it("rechaza mega evoluciones antes de la generación 6", () => {
    const res = SmogonSpeciesMapper.resolve({ id: 1001, name: "absol-mega" }, 5);
    expect(res.supported).toBe(false);
    expect(res.reason).toContain("desde Gen 6");
  });

  it("aplica fallback a forma base para G-Max antes de la generación 8", () => {
    const res = SmogonSpeciesMapper.resolve({ id: 1002, name: "charizard-gmax" }, 7);
    expect(res.supported).toBe(false);
    expect(res.isFallbackToBase).toBe(true);
    expect(res.baseStatsSource).toBe("Charizard");
  });

  it("aplica fallback oficial para formas custom Mega-Z en generación 9", () => {
    const res = SmogonSpeciesMapper.resolve({ id: 10307, name: "absol-mega-z" }, 9);
    expect(res.supported).toBe(false);
    expect(res.isFallbackToBase).toBe(true);
    expect(res.useBaseForGen9).toBe(true);
    expect(res.baseStatsSource).toBe("Absol");
  });

  it("resuelve formas base estándar correctamente", () => {
    const res = SmogonSpeciesMapper.resolve({ id: 445, name: "garchomp" }, 9);
    expect(res.supported).toBe(true);
    expect(res.smogonName).toBe("Garchomp");
  });
});