import { describe, it, expect } from "vitest";
import { RecommendationEngine } from "@/domain/team/services/RecommendationEngine";
import type { TypeExposure } from "@/domain/team/types/TeamTypes";

describe("RecommendationEngine", () => {
  it("detects critical vulnerability when 3 are weak and 1 resists", () => {
    const coverage: Record<string, TypeExposure> = {
      ice: { weak: 3, resist: 1, immune: 0, neutral: 2 }
    };
    
    const recommendations = RecommendationEngine.generate(coverage);
    
    expect(recommendations.length).toBe(1);
    expect(recommendations[0].severity).toBe("Critical");
    expect(recommendations[0].title).toContain("ICE");
  });

  it("detects single point of failure (dependency)", () => {
    const coverage: Record<string, TypeExposure> = {
      ground: { weak: 2, resist: 1, immune: 0, neutral: 3 }
    };
    
    const recommendations = RecommendationEngine.generate(coverage);
    
    expect(recommendations[0].severity).toBe("High");
    expect(recommendations[0].type).toBe("Dependency");
  });
});