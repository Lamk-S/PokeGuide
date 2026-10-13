import { describe, it, expect } from "vitest";
import { RecommendationEngine } from "@/domain/team/services/RecommendationEngine";
import type { TypeExposure } from "@/domain/team/types/TeamTypes";

describe("RecommendationEngine - Dominio Puro (Sin i18n)", () => {
  it("detects critical vulnerability when 3 are weak and 1 resists", () => {
    const coverage: Record<string, TypeExposure> = {
      ice: { weak: 3, resist: 1, immune: 0, neutral: 2 },
    };

    const recommendations = RecommendationEngine.generate(coverage);

    expect(recommendations.length).toBe(1);
    const first = recommendations[0];
    if (!first) throw new Error("Expected first recommendation to exist");

    expect(first.severity).toBe("Critical");
    expect(first.issueCode).toBe("massive_weakness");
    expect(first.category).toBe("defensive_gap");
    expect(first.attackingType).toBe("ice");
    expect(first.targetType).toBe("ice");
    expect("title" in first).toBe(false);
  });

  it("detects single point of failure (dependency)", () => {
    const coverage: Record<string, TypeExposure> = {
      ground: { weak: 2, resist: 1, immune: 0, neutral: 3 },
    };

    const recommendations = RecommendationEngine.generate(coverage);

    expect(recommendations.length).toBe(1);
    const first = recommendations[0];
    if (!first) throw new Error("Expected first recommendation to exist");

    expect(first.severity).toBe("High");
    expect(first.issueCode).toBe("single_point_failure");
    expect(first.category).toBe("dependency");
    expect(first.targetType).toBe("ground");
  });

  it("uses semantic type identifiers, not Spanish strings", () => {
    const coverage: Record<string, TypeExposure> = {
      fire: { weak: 3, resist: 0, immune: 0, neutral: 3 },
      water: { weak: 3, resist: 1, immune: 0, neutral: 2 },
    };

    const recommendations = RecommendationEngine.generate(coverage);

    expect(recommendations.length).toBe(2);
    const types = recommendations.map((r) => r.targetType);
    expect(types).toContain("fire");
    expect(types).toContain("water");

    for (const rec of recommendations) {
      const json = JSON.stringify(rec);
      expect(json).not.toContain("FUEGO");
      expect(json).not.toContain("AGUA");
      expect(json).not.toContain("HIELO");
    }
  });
});