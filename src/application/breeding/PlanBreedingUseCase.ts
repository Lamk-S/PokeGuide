import { BreedingTarget } from "@/domain/breeding/entities/BreedingTarget";
import { BreedingGraphSearch } from "@/domain/breeding/services/BreedingGraphSearch";
import type {
  BreedingRequirements,
  BreedingPlan,
} from "@/domain/breeding/types/BreedingTypes";

export class PlanBreedingUseCase {
  execute(requirements: BreedingRequirements): BreedingPlan {
    // Validación de capa de aplicación, no de dominio
    if (!requirements.species?.trim()) {
      throw new Error("species es requerido");
    }
    if (requirements.generation < 3 || requirements.generation > 9) {
      throw new Error(
        `Generación ${requirements.generation} fuera de rango [3-9]`,
      );
    }

    const target = new BreedingTarget(requirements);
    return BreedingGraphSearch.findOptimalPath(target);
  }
}
