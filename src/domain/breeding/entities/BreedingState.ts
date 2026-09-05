import type { BreedingParent } from "../types/BreedingTypes";
import type { BreedingStep } from "../types/BreedingTypes";

export class BreedingState {
  constructor(
    public readonly acquiredTraits: Readonly<Record<string, boolean>>,
    public readonly currentPokemon: Readonly<BreedingParent>,
    public readonly pathCost: number,
    public readonly history: ReadonlyArray<BreedingStep>,
  ) {}

  getIdentityHash(): string {
    // Solo traits en true, y ordenado
    const activeTraits = Object.entries(this.acquiredTraits)
      .filter(([, v]) => v === true)
      .map(([k]) => k)
      .sort()
      .join(",");

    // El estado es único por: qué tiene + qué especie/naturaleza porta
    // Si no se incluye naturaleza/IVs actuales, el solver hace ciclos
    return `${this.currentPokemon.species}|${this.currentPokemon.nature}|${activeTraits}`;
  }

  // Inmutabilidad real para el grafo
  withTrait(trait: string, cost: number, step: BreedingStep): BreedingState {
    return new BreedingState(
      { ...this.acquiredTraits, [trait]: true },
      step.childResult,
      this.pathCost + cost,
      [...this.history, step],
    );
  }
}
