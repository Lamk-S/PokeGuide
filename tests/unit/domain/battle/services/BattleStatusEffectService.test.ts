import { describe, it, expect, vi } from "vitest";
import {
  BattleStatusEffectService,
  evaluateBurn,
  getCriticalMultiplier,
  getCriticalLog,
  getCriticalModifierCode,
} from "@/domain/battle/services/BattleStatusEffectService";

vi.mock("@/domain/battle/value-objects/MoveCategory", () => ({
  isPhysicalCategory: (cat: string) => cat === "Physical",
}));
vi.mock("@/domain/battle/value-objects/AbilityId", () => ({
  isGutsAbility: (id: string) => id === "guts",
}));
vi.mock("@/domain/battle/value-objects/MoveId", () => ({
  isFacadeMove: (id: string) => id === "facade",
}));

type MockCategory = "Physical" | "Special" | "Status";

describe("BattleStatusEffectService - FASE 3 Pura", () => {
  describe("evaluateBurn", () => {
    it("retorna multiplier 1.0 y applies false para movimientos no físicos", () => {
      const result = evaluateBurn({ moveId: "surf", moveCategory: "Special" as MockCategory });
      expect(result.applies).toBe(false);
      expect(result.multiplier).toBe(1.0);
      expect(result.reason).toBe("NOT_PHYSICAL");
      expect(result.log).toBe("[NOT_PHYSICAL] multiplier:1.0");
    });

    it("retorna multiplier 1.0 y aplica para el movimiento Facade - ignora caída por quemadura (puro)", () => {
      const result = evaluateBurn({ moveId: "facade", moveCategory: "Physical" as MockCategory });
      expect(result.applies).toBe(true);
      expect(result.multiplier).toBe(1.0);
      expect(result.reason).toBe("FACADE_IGNORES_BURN_DROP");
      expect(result.log).toBe("[FACADE_IGNORES_BURN_DROP] multiplier:1.0");
    });

    it("retorna multiplier 1.0 ignorando penalización si la habilidad es Guts (puro)", () => {
      const result = evaluateBurn({
        moveId: "earthquake",
        moveCategory: "Physical" as MockCategory,
        abilityId: "guts",
      });
      expect(result.applies).toBe(true);
      expect(result.multiplier).toBe(1.0);
      expect(result.reason).toBe("GUTS_IGNORES_BURN");
      expect(result.log).toBe("[GUTS_IGNORES_BURN] multiplier:1.0");
    });

    it("retorna multiplier 0.5 para ataques físicos normales", () => {
      const result = evaluateBurn({
        moveId: "earthquake",
        moveCategory: "Physical" as MockCategory,
        abilityId: "intimidate",
      });
      expect(result.applies).toBe(true);
      expect(result.multiplier).toBe(0.5);
      expect(result.reason).toBe("BURN_HALVES_PHYSICAL");
      expect(result.log).toContain("0.5");
      expect(result.log).toContain("BURN_HALVES_PHYSICAL");
    });
  });

  describe("getCriticalMultiplier", () => {
    it("devuelve 2.0 para generaciones previas a la 6", () => {
      expect(getCriticalMultiplier(5)).toBe(2.0);
      expect(BattleStatusEffectService.getCriticalMultiplier(3)).toBe(2.0);
    });

    it("devuelve 1.5 para la generación 6 o superior", () => {
      expect(getCriticalMultiplier(6)).toBe(1.5);
      expect(getCriticalMultiplier(9)).toBe(1.5);
    });
  });

  describe("getCriticalLog - FASE 3 puro", () => {
    it("devuelve código puro CRITICAL_HIT independiente de generación", () => {
      expect(getCriticalLog(5)).toBe("CRITICAL_HIT");
      expect(getCriticalLog(9)).toBe("CRITICAL_HIT");
    });

    it("getCriticalModifierCode devuelve código con multiplicador", () => {
      expect(getCriticalModifierCode(5)).toBe("CRITICAL_x2.0");
      expect(getCriticalModifierCode(9)).toBe("CRITICAL_x1.5");
    });
  });
});
