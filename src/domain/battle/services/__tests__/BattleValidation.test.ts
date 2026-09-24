import { describe, it, expect } from "vitest";
import { validateBattleState } from "../BattleValidation";

describe("validateBattleState", () => {
  it("missing attacker", () => {
    const r = validateBattleState({
      // biome-ignore lint/suspicious/noExplicitAny: test mock
      attacker: null as any,
      // biome-ignore lint/suspicious/noExplicitAny: test mock
      defender: { id: 1, name: "a", stats: { hp: 100 } } as any,
      // biome-ignore lint/suspicious/noExplicitAny: test mock
      move: { name: "tackle", type: "normal" } as any,
    });
    expect(r.errors).toContain("MISSING_ATTACKER");
  });
  it("valid", () => {
    const r = validateBattleState({
      // biome-ignore lint/suspicious/noExplicitAny: test mock
      attacker: { id: 1, name: "a", stats: { hp: 100 } } as any,
      // biome-ignore lint/suspicious/noExplicitAny: test mock
      defender: { id: 2, name: "b", stats: { hp: 100 } } as any,
      // biome-ignore lint/suspicious/noExplicitAny: test mock
      move: { name: "tackle", type: "normal" } as any,
    });
    expect(r.valid).toBe(true);
  });
});
