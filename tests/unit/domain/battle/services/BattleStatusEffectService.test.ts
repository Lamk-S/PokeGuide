import { describe, it, expect, vi } from "vitest";
import { 
  BattleStatusEffectService, 
  evaluateBurn, 
  getCriticalMultiplier, 
  getCriticalLog 
} from "@/domain/battle/services/BattleStatusEffectService";

vi.mock("@/domain/battle/value-objects/MoveCategory", () => ({
  isPhysicalCategory: (cat: any) => cat === "Physical"
}));
vi.mock("@/domain/battle/value-objects/AbilityId", () => ({
  isGutsAbility: (id: any) => id === "guts"
}));
vi.mock("@/domain/battle/value-objects/MoveId", () => ({
  isFacadeMove: (id: any) => id === "facade"
}));

describe("BattleStatusEffectService", () => {
  describe("evaluateBurn", () => {
    it("retorna multiplier 1.0 y applies false para movimientos no físicos", () => {
      const result = evaluateBurn({ moveId: "surf", moveCategory: "Special" as any });
      expect(result.applies).toBe(false);
      expect(result.multiplier).toBe(1.0);
    });

    it("retorna multiplier 2.0 y aplica para el movimiento Facade", () => {
      const result = evaluateBurn({ moveId: "facade", moveCategory: "Physical" as any });
      expect(result.applies).toBe(true);
      expect(result.multiplier).toBe(2.0);
      expect(result.log).toContain("Facade x2.0");
    });

    it("retorna multiplier 1.0 ignorando penalización si la habilidad es Guts", () => {
      const result = evaluateBurn({ moveId: "earthquake", moveCategory: "Physical" as any, abilityId: "guts" });
      expect(result.applies).toBe(true);
      expect(result.multiplier).toBe(1.0);
      expect(result.log).toContain("Guts ignora quemadura");
    });

    it("retorna multiplier 0.5 para ataques físicos normales", () => {
      const result = evaluateBurn({ moveId: "earthquake", moveCategory: "Physical" as any, abilityId: "intimidate" });
      expect(result.applies).toBe(true);
      expect(result.multiplier).toBe(0.5);
      expect(result.log).toContain("0.5");
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

  describe("getCriticalLog", () => {
    it("formatea el texto correctamente basado en la generación", () => {
      expect(getCriticalLog(5)).toBe("Golpe Crítico x2.0");
      expect(getCriticalLog(9)).toBe("Golpe Crítico x1.5");
    });
  });
});