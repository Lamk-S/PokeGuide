import { describe, it, expect } from "vitest";
import { validateBattleState } from "@/domain/battle/services/BattleValidation";

describe("BattleValidationFactory - Fase 4 Blindaje", () => {
  it("detecta MISSING_ATTACKER y MISSING_DEFENDER", () => {
    const res = validateBattleState({
      attacker: null,
      defender: null,
      move: null,
      generation: 9,
    } as never);
    expect(res.valid).toBe(false);
    expect(res.errors).toContain("MISSING_ATTACKER");
    expect(res.errors).toContain("MISSING_DEFENDER");
  });
  it("detecta MISSING_MOVE", () => {
    const res = validateBattleState({
      attacker: { id: 25, name: "pikachu", stats: { hp: 35 } } as never,
      defender: { id: 3, name: "venusaur", stats: { hp: 80 } } as never,
      move: null,
      generation: 9,
    } as never);
    expect(res.errors).toContain("MISSING_MOVE");
  });
  it("valida caso correcto gen 9", () => {
    const res = validateBattleState({
      attacker: { id: 25, name: "pikachu", stats: { hp: 35, attack: 55 } } as never,
      defender: { id: 3, name: "venusaur", stats: { hp: 80, defense: 83 } } as never,
      move: { name: "thunderbolt", power: 90, type: "electric" } as never,
      generation: 9,
    } as never);
    expect(res.valid).toBe(true);
  });
});
