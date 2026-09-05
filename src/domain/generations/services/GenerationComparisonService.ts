import type { GenerationRuleset } from "../entities/GenerationRuleset";
import type { RuleCategory } from "../types/GenerationTypes";

export interface SemanticChange {
  readonly mechanicId: string;
  readonly name: string;
  readonly category: RuleCategory;
  readonly status: "Added" | "Removed" | "Modified" | "Unchanged";
  readonly description: string;
}

export const GenerationComparisonService = {
  compare(genA: GenerationRuleset, genB: GenerationRuleset): SemanticChange[] {
    const changes: SemanticChange[] = [];
    const allIds = new Set([
      ...genA.mechanics.map((m) => m.id),
      ...genB.mechanics.map((m) => m.id),
    ]);

    for (const id of [...allIds].sort()) {
      const a = genA.getMechanic(id);
      const b = genB.getMechanic(id);

      if (!a && b) {
        changes.push({
          mechanicId: b.id,
          name: b.name,
          category: b.category,
          status: "Added",
          description: `Introducido en Gen ${genB.generation}: ${b.description}`,
        });
      } else if (a && !b) {
        changes.push({
          mechanicId: a.id,
          name: a.name,
          category: a.category,
          status: "Removed",
          description: `Eliminado en Gen ${genB.generation}`,
        });
      } else if (a && b) {
        if (
          a.availability !== b.availability ||
          a.supportLevel !== b.supportLevel
        ) {
          changes.push({
            mechanicId: b.id,
            name: b.name,
            category: b.category,
            status: "Modified",
            description: `Cambió de ${a.availability}/${a.supportLevel} a ${b.availability}/${b.supportLevel}`,
          });
        }
      }
    }

    // Diferencia de crianza también es cambio semántico interregional
    if (genA.breeding.maxInheritedIVs !== genB.breeding.maxInheritedIVs) {
      changes.push({
        mechanicId: "breeding_ivs",
        name: "IV Inheritance",
        category: "Breeding",
        status: "Modified",
        description: `IVs heredados: ${genA.breeding.maxInheritedIVs} -> ${genB.breeding.maxInheritedIVs}`,
      });
    }
    if (genA.breeding.everstoneChance !== genB.breeding.everstoneChance) {
      changes.push({
        mechanicId: "breeding_everstone",
        name: "Everstone",
        category: "Breeding",
        status: "Modified",
        description: `Everstone: ${genA.breeding.everstoneChance * 100}% -> ${genB.breeding.everstoneChance * 100}%`,
      });
    }

    return changes.sort((x, y) => x.category.localeCompare(y.category));
  },
};
