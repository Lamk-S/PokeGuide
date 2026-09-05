import type {
  MechanicStatus,
  BreedingRulesConfig,
} from "../types/GenerationTypes";

export class GenerationRuleset {
  constructor(
    public readonly generation: number,
    public readonly region: string,
    public readonly mechanics: ReadonlyArray<MechanicStatus>,
    public readonly breeding: BreedingRulesConfig,
  ) {
    Object.freeze(this.mechanics);
    Object.freeze(this.breeding);
  }

  getMechanic(id: string): MechanicStatus | undefined {
    return this.mechanics.find((m) => m.id === id);
  }

  isTraitInheritable(trait: string): boolean {
    return this.breeding.inheritableTraits.includes(trait);
  }
}
