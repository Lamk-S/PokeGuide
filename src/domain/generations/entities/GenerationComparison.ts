import type { SemanticChange } from "../services/GenerationComparisonService";
import type { RuleCategory } from "../types/GenerationTypes";

export class GenerationComparison {
  constructor(
    public readonly baseGeneration: number,
    public readonly targetGeneration: number,
    public readonly changes: ReadonlyArray<SemanticChange>,
  ) {
    Object.freeze(this.changes);
  }

  // Agrupa por categoría para renderizar en tabs: Battle | Types | Breeding...
  getChangesByCategory(): Readonly<
    Record<RuleCategory, ReadonlyArray<SemanticChange>>
  > {
    const grouped = {} as Record<RuleCategory, SemanticChange[]>;

    for (const change of this.changes) {
      if (!grouped[change.category]) {
        grouped[change.category] = [];
      }
      grouped[change.category].push(change);
    }

    return Object.freeze(grouped) as Readonly<
      Record<RuleCategory, ReadonlyArray<SemanticChange>>
    >;
  }

  hasDifferences(): boolean {
    // Si solo hay Unchanged, no hay diferencias reales
    return (
      this.changes.length > 0 &&
      this.changes.some((c) => c.status !== "Unchanged")
    );
  }

  get count(): number {
    return this.changes.length;
  }
}
