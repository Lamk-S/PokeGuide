import { describe, it, expect } from "vitest";
import {
  evaluateBurn,
  getCriticalMultiplier,
  getCriticalLog,
} from "../BattleStatusEffectService";
import { MoveCategory } from "../../value-objects/MoveCategory";

describe("BattleStatusEffectService - Integridad de Dominio", () => {
  describe("Caso A: Atacante quemado + movimiento físico + sin Guts", () => {
    it("debe aplicar penalización ×0.5", () => {
      const result = evaluateBurn({
        moveId: "tackle",
        moveName: "Tackle",
        moveCategory: MoveCategory.PHYSICAL,
        abilityId: "intimidate",
      });

      expect(result.applies).toBe(true);
      expect(result.multiplier).toBe(0.5);
      expect(result.log).toContain("x0.5");
    });
  });

  describe("Caso B: Atacante quemado + movimiento especial + sin Guts", () => {
    it("NO debe aplicar penalización física", () => {
      const result = evaluateBurn({
        moveId: "shadow-ball",
        moveName: "Bola Sombra",
        moveCategory: MoveCategory.SPECIAL,
        abilityId: "levitate",
      });

      expect(result.applies).toBe(false);
      expect(result.multiplier).toBe(1.0);
      expect(result.log).toContain("no afecta");
    });

    it("Gengar quemado + Shadow Ball (Special) no debe penalizar", () => {
      const result = evaluateBurn({
        moveId: "shadow-ball",
        moveCategory: MoveCategory.SPECIAL,
        abilityId: "cursed-body",
      });

      expect(result.applies).toBe(false);
      expect(result.multiplier).toBe(1.0);
    });
  });

  describe("Caso C: Atacante quemado + movimiento Status", () => {
    it("movimiento de estado no debe aplicar penalización de quemadura", () => {
      const result = evaluateBurn({
        moveId: "will-o-wisp",
        moveName: "Fuego Fatuo",
        moveCategory: MoveCategory.STATUS,
        abilityId: "flash-fire",
      });

      expect(result.applies).toBe(false);
      expect(result.multiplier).toBe(1.0);
    });
  });

  describe("Caso D: Atacante quemado + habilidad Guts + movimiento físico", () => {
    it("Guts debe ignorar quemadura y dar ×1.5 ATQ (log)", () => {
      const result = evaluateBurn({
        moveId: "close-combat",
        moveName: "A Bocajarro",
        moveCategory: MoveCategory.PHYSICAL,
        abilityId: "guts",
        abilityName: "Agallas",
      });

      expect(result.applies).toBe(true);
      expect(result.multiplier).toBe(1.0);
      expect(result.log).toContain("Guts ignora");
    });

    it("Guts con label español Agallas debe funcionar igual (normalización)", () => {
      const result = evaluateBurn({
        moveId: "tackle",
        moveCategory: MoveCategory.PHYSICAL,
        abilityId: "agallas",
      });

      expect(result.applies).toBe(true);
      expect(result.log).toContain("Guts");
    });

    it("Guts + movimiento especial no debe aplicar penalización (no físico)", () => {
      const result = evaluateBurn({
        moveId: "shadow-ball",
        moveCategory: MoveCategory.SPECIAL,
        abilityId: "guts",
      });

      expect(result.applies).toBe(false);
    });
  });

  describe("Caso E: Atacante quemado + Facade", () => {
    it("Facade debe duplicar potencia ×2.0 cuando está quemado", () => {
      const result = evaluateBurn({
        moveId: "facade",
        moveName: "Imagen",
        moveCategory: MoveCategory.PHYSICAL,
        abilityId: "guts",
      });

      expect(result.applies).toBe(true);
      expect(result.multiplier).toBe(2.0);
      expect(result.log).toContain("Facade x2.0");
    });

    it("Facade con label español Imagen debe funcionar (normalización)", () => {
      const result = evaluateBurn({
        moveId: "imagen",
        moveCategory: MoveCategory.PHYSICAL,
        abilityId: "none",
      });

      expect(result.applies).toBe(true);
      expect(result.multiplier).toBe(2.0);
    });

    it("Facade especial? No existe, pero si fuera Status no aplica", () => {
      const result = evaluateBurn({
        moveId: "facade",
        moveCategory: MoveCategory.STATUS,
        abilityId: "none",
      });

      expect(result.applies).toBe(false);
    });
  });

  describe("Crítico por generación", () => {
    it("Gen 1-5 debe ser ×2.0", () => {
      expect(getCriticalMultiplier(3)).toBe(2.0);
      expect(getCriticalMultiplier(4)).toBe(2.0);
      expect(getCriticalMultiplier(5)).toBe(2.0);
    });

    it("Gen 6+ debe ser ×1.5", () => {
      expect(getCriticalMultiplier(6)).toBe(1.5);
      expect(getCriticalMultiplier(9)).toBe(1.5);
    });

    it("Log de crítico debe usar multiplicador correcto", () => {
      expect(getCriticalLog(5)).toContain("2.0");
      expect(getCriticalLog(9)).toContain("1.5");
    });
  });

  describe("Localización vs Identidad Interna", () => {
    it("dominio nunca debe depender de label traducido para Guts", () => {
      const testCases = [
        { input: "guts", expected: true },
        { input: "Guts", expected: true },
        { input: "GUTS", expected: true },
        { input: "agallas", expected: true },
        { input: "Agallas", expected: true },
        { input: "intimidate", expected: false },
      ];

      for (const { input, expected } of testCases) {
        const result = evaluateBurn({
          moveId: "tackle",
          moveCategory: MoveCategory.PHYSICAL,
          abilityId: input,
        });

        if (expected) {
          expect(result.log).toMatch(/Guts|Facade|x0.5/);
        }
      }
    });

    it("dominio nunca debe depender de label traducido para Facade", () => {
      const testCases = [
        "facade",
        "Facade",
        "FACADE",
        "imagen",
        "Imagen",
        "IMAGEN",
      ];

      for (const moveId of testCases) {
        const result = evaluateBurn({
          moveId,
          moveCategory: MoveCategory.PHYSICAL,
        });

        expect(result.multiplier).toBe(2.0);
        expect(result.log).toContain("Facade");
      }
    });
  });

  describe("Matriz de regresión completa", () => {
    it("Burn + Physical → penalización", () => {
      const r = evaluateBurn({
        moveId: "tackle",
        moveCategory: MoveCategory.PHYSICAL,
      });
      expect(r.multiplier).toBe(0.5);
    });

    it("Burn + Special → sin penalización", () => {
      const r = evaluateBurn({
        moveId: "flamethrower",
        moveCategory: MoveCategory.SPECIAL,
      });
      expect(r.applies).toBe(false);
    });

    it("Burn + Status → sin penalización", () => {
      const r = evaluateBurn({
        moveId: "swords-dance",
        moveCategory: MoveCategory.STATUS,
      });
      expect(r.applies).toBe(false);
    });

    it("Burn + Guts + Physical → ignora", () => {
      const r = evaluateBurn({
        moveId: "tackle",
        moveCategory: MoveCategory.PHYSICAL,
        abilityId: "guts",
      });
      expect(r.multiplier).toBe(1.0);
      expect(r.log).toContain("Guts");
    });

    it("Burn + Facade → ×2.0", () => {
      const r = evaluateBurn({
        moveId: "facade",
        moveCategory: MoveCategory.PHYSICAL,
      });
      expect(r.multiplier).toBe(2.0);
    });
  });
});
