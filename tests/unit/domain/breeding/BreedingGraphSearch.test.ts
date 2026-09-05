import { describe, it, expect } from "vitest";
import { BreedingTarget } from "@/domain/breeding/entities/BreedingTarget";
import { BreedingGraphSearch } from "@/domain/breeding/services/BreedingGraphSearch";

describe("BreedingGraphSearch", () => {
  it("retorna Unsupported para una generación no modelada (ej. Gen 4)", () => {
    const target = new BreedingTarget({
      species: "Garchomp",
      generation: 4,
      ivs: { hp: "Any", attack: "Any", defense: "Any", specialAttack: "Any", specialDefense: "Any", speed: "Any" }
    });

    const result = BreedingGraphSearch.findOptimalPath(target);
    
    expect(result.status).toBe("Unsupported");
    expect(result.steps).toHaveLength(0);
  });

  it("retorna una ruta Optimal para una generación soportada (Gen 9) con Everstone + Destiny Knot", () => {
    const target = new BreedingTarget({
      species: "Garchomp",
      generation: 9,
      nature: "Jolly",
      ivs: { hp: "Any", attack: "Any", defense: "Any", specialAttack: "Any", specialDefense: "Any", speed: "Exact_31" }
    });

    const result = BreedingGraphSearch.findOptimalPath(target);

    expect(result.status).toBe("Optimal");
    expect(result.steps.length).toBe(2); // nature + iv_speed

    // La evidencia está en los pasos, no en el explanation global
    const allEvidence = result.steps.map(s => s.evidence.description).join(" ");
    expect(allEvidence).toContain("Everstone");
    expect(allEvidence).toContain("Destiny Knot");
  });

  it("es determinista: dos llamadas con mismo target retornan mismo costo", () => {
    const req = {
      species: "Garchomp",
      generation: 9,
      nature: "Jolly" as const,
      ivs: { hp: "Any", attack: "Any", defense: "Any", specialAttack: "Any", specialDefense: "Any", speed: "Exact_31" } as const
    };
    const r1 = BreedingGraphSearch.findOptimalPath(new BreedingTarget(req));
    const r2 = BreedingGraphSearch.findOptimalPath(new BreedingTarget(req));
    
    expect(r1.cost).toBe(r2.cost);
    expect(r1.steps.length).toBe(r2.steps.length);
  });
});