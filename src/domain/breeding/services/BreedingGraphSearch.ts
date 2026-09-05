import type { BreedingTarget } from "../entities/BreedingTarget";
import { BreedingState } from "../entities/BreedingState";
import { GenerationRules } from "../rules/GenerationRules";
import type {
  BreedingPlan,
  BreedingParent,
  BreedingStep,
  TraitKey,
} from "../types/BreedingTypes";

export const BreedingGraphSearch = {
  findOptimalPath(target: BreedingTarget): BreedingPlan {
    const gen = target.requirements.generation;

    if (!GenerationRules.isSupported(gen)) {
      return BreedingGraphSearch.createUnsupportedPlan(target);
    }

    const requiredKeys = target.getRequiredKeys() as TraitKey[];
    if (requiredKeys.length === 0) {
      return {
        status: "Feasible",
        target: target.requirements,
        steps: [],
        cost: 0,
        explanation: "El objetivo ya está satisfecho.",
      };
    }

    const initialParent: BreedingParent = {
      species: "Ditto",
      nature: "Serious",
      ivs: {
        hp: 31,
        attack: 31,
        defense: 31,
        specialAttack: 31,
        specialDefense: 31,
        speed: 31,
      },
      moves: [],
      gender: "Genderless",
    };

    const initialState = new BreedingState({}, initialParent, 0, []);
    const queue: BreedingState[] = [initialState];
    const visited = new Set<string>([initialState.getIdentityHash()]);

    let iterations = 0;
    const MAX_ITERATIONS = 1000;

    while (queue.length > 0 && iterations < MAX_ITERATIONS) {
      iterations++;

      const current = queue.shift();
      if (!current) break;

      if (target.isSatisfiedBy(current)) {
        return {
          status: "Optimal",
          target: target.requirements,
          steps: [...current.history],
          cost: current.pathCost,
          explanation: `Ruta óptima encontrada en ${current.history.length} pasos.`,
        };
      }

      for (const trait of requiredKeys) {
        if (current.acquiredTraits[trait]) continue;
        if (!GenerationRules.canInherit(trait, gen)) continue;

        const evidence = GenerationRules.getEvidence(trait, gen);
        const step: BreedingStep = {
          stepNumber: current.history.length + 1,
          parentA: current.currentPokemon,
          parentB: {
            ...initialParent,
            species: target.requirements.species,
          } as BreedingParent,
          childResult: {
            ...initialParent,
            species: target.requirements.species,
          } as BreedingParent,
          inheritedProperties: [trait],
          remainingRequirements: requiredKeys.filter(
            (k) => k !== trait && !current.acquiredTraits[k],
          ),
          evidence,
          cost: 1,
        };

        const nextState = current.withTrait(trait, 1, step);
        const hash = nextState.getIdentityHash();

        if (!visited.has(hash)) {
          visited.add(hash);
          queue.push(nextState);
        }
      }
    }

    return {
      status: "NoSolution",
      target: target.requirements,
      steps: [],
      cost: 0,
      explanation: "No se encontró ruta con las reglas de la generación.",
    };
  },

  createUnsupportedPlan(target: BreedingTarget): BreedingPlan {
    return {
      status: "Unsupported",
      target: target.requirements,
      steps: [],
      cost: 0,
      explanation: `Gen ${target.requirements.generation} no está soportada aún. Soportadas: 6 y 9.`,
    };
  },
};
