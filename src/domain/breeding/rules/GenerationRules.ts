import { GenerationRulesProvider } from "@/domain/generations/services/GenerationRulesProvider";
import type { TraitKey, BreedingEvidence } from "../types/BreedingTypes";

export const GenerationRules = {
  isSupported(generation: number): boolean {
    return GenerationRulesProvider.isSupported(generation);
  },

  canInherit(trait: TraitKey, generation: number): boolean {
    if (!GenerationRules.isSupported(generation)) return false;
    try {
      const ruleset = GenerationRulesProvider.getRuleset(generation);
      return ruleset.isTraitInheritable(trait);
    } catch {
      return false; // Gen no definida = no se puede heredar
    }
  },

  getEvidence(trait: TraitKey, generation: number): BreedingEvidence {
    const ruleset = GenerationRulesProvider.getRuleset(generation);
    const breeding = ruleset.breeding;

    if (trait === "nature") {
      return {
        ruleId:
          breeding.everstoneChance === 1 ? "EVERSTONE_100" : "EVERSTONE_50",
        description: `Gen ${generation}: Everstone hereda naturaleza al ${breeding.everstoneChance * 100}%`,
        generation,
        requiredItem: "Everstone",
      };
    }

    if (trait.startsWith("iv_")) {
      if (breeding.hasDestinyKnot) {
        return {
          ruleId: "DESTINY_KNOT_5IV",
          description: `Gen ${generation}: Se heredan ${breeding.maxInheritedIVs} IVs con Destiny Knot`,
          generation,
          requiredItem: "Destiny Knot",
        };
      }

      return {
        ruleId: "NO_KNOT_3IV",
        description: `Gen ${generation}: Se heredan ${breeding.maxInheritedIVs} IVs sin objeto`,
        generation,
      };
    }

    if (trait === "eggMove") {
      return {
        ruleId: "EGG_MOVE_INHERITANCE",
        description: `Gen ${generation}: Movimiento huevo heredable por padre`,
        generation,
      };
    }

    throw new Error(`Evidencia no modelada para el trait: ${trait}`);
  },
};
