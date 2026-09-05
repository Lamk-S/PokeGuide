// tests/unit/domain/generations/GenerationComparisonService.test.ts
import { describe, it, expect } from "vitest";
import { GenerationRulesProvider } from "@/domain/generations/services/GenerationRulesProvider";
import { GenerationComparisonService } from "@/domain/generations/services/GenerationComparisonService";

describe("GenerationComparisonService", () => {
  it("detecta el tipo Hada como Modified entre Gen 3 (Unavailable) y Gen 9 (Available)", () => {
    const gen3 = GenerationRulesProvider.getRuleset(3);
    const gen9 = GenerationRulesProvider.getRuleset(9);

    const changes = GenerationComparisonService.compare(gen3, gen9);
    const fairyChange = changes.find(c => c.mechanicId === "fairy_type");

    expect(fairyChange).toBeDefined();
    expect(fairyChange?.status).toBe("Modified");
    expect(fairyChange?.category).toBe("Types");
  });

  it("detecta Added: Terastallization solo existe desde Gen 9", () => {
    const gen3 = GenerationRulesProvider.getRuleset(3);
    const gen9 = GenerationRulesProvider.getRuleset(9);

    const changes = GenerationComparisonService.compare(gen3, gen9);
    const teraChange = changes.find(c => c.mechanicId === "terastallization");

    expect(teraChange).toBeDefined();
    expect(teraChange?.status).toBe("Added");
  });

  it("detecta cambios de crianza intergeneracionales (IVs y Everstone)", () => {
    const gen3 = GenerationRulesProvider.getRuleset(3);
    const gen9 = GenerationRulesProvider.getRuleset(9);

    const changes = GenerationComparisonService.compare(gen3, gen9);

    const ivChange = changes.find(c => c.mechanicId === "breeding_ivs");
    const everstoneChange = changes.find(c => c.mechanicId === "breeding_everstone");

    expect(ivChange).toBeDefined();
    expect(ivChange?.status).toBe("Modified");
    expect(ivChange?.description).toContain("3 -> 5");

    expect(everstoneChange).toBeDefined();
    expect(everstoneChange?.status).toBe("Modified");
  });

  it("protege contra generaciones no soportadas", () => {
    expect(() => GenerationRulesProvider.getRuleset(99)).toThrowError(/no definido/);
    expect(GenerationRulesProvider.isSupported(99)).toBe(false);
    expect(GenerationRulesProvider.isSupported(9)).toBe(true);
  });
});