import type { BreedingRequirements } from "../types/BreedingTypes";
import type { BreedingState } from "./BreedingState";

export class BreedingTarget {
  constructor(public readonly requirements: BreedingRequirements) {}

  // Se encapsulan las restricciones reales para verificar si el estado las cumple.
  isSatisfiedBy(state: BreedingState): boolean {
    const traits = state.acquiredTraits as Record<string, boolean>;

    // 1. Naturaleza solo se exige si no es "Any" y está definida
    if (this.requirements.nature && this.requirements.nature !== "Any") {
      if (!traits.nature) return false;
    }
    // 2. EggMove solo si se pidió
    if (this.requirements.eggMove) {
      if (!traits.eggMove) return false;
    }
    // 3. IVs solo los que son Exact_31 o Exact_0
    for (const [stat, req] of Object.entries(this.requirements.ivs)) {
      if (req !== "Any" && !traits[`iv_${stat}`]) {
        return false;
      }
    }
    return true;
  }

  getRequiredKeys(): string[] {
    // Se extraen las llaves requeridas que utilizará el solver para iterar.
    const keys: string[] = [];
    if (this.requirements.nature && this.requirements.nature !== "Any")
      keys.push("nature");
    if (this.requirements.eggMove) keys.push("eggMove");
    for (const [stat, req] of Object.entries(this.requirements.ivs)) {
      if (req !== "Any") keys.push(`iv_${stat}`);
    }
    return keys;
  }
}
