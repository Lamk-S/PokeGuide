import { describe, it, expect } from "vitest";
import { validateBattleState } from "@/domain/battle/services/BattleValidation";

describe("BattleValidation", () => {
  it("detecta falta de atacante y defensor", () => {
    const result = validateBattleState({ attacker: null, defender: null, move: null, generation: 9 } as never);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("MISSING_ATTACKER");
  });
});