import { GenerationComparison } from "@/domain/generations/entities/GenerationComparison";
import { GenerationComparisonService } from "@/domain/generations/services/GenerationComparisonService";
import { GenerationRulesProvider } from "@/domain/generations/services/GenerationRulesProvider";

export class CompareGenerationsUseCase {
  execute(baseGen: number, targetGen: number): GenerationComparison {
    if (baseGen === targetGen) {
      return new GenerationComparison(baseGen, targetGen, []);
    }

    // Validación y extracción desde la única fuente de verdad
    const rulesetA = GenerationRulesProvider.getRuleset(baseGen);
    const rulesetB = GenerationRulesProvider.getRuleset(targetGen);

    // Delegación al servicio de dominio
    const changes = GenerationComparisonService.compare(rulesetA, rulesetB);

    return new GenerationComparison(baseGen, targetGen, changes);
  }
}
