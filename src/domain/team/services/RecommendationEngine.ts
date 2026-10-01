import type {
  TypeExposure,
  TeamRecommendation,
  Severity,
} from "../types/TeamTypes";
import { SEVERITY_WEIGHT } from "../types/TeamTypes";
import type { PokemonType } from "@/domain/pokemon/types/pokemon";

interface RecommendationRule {
  readonly id: string;
  readonly severity: Severity;
  check(
    attackingType: PokemonType,
    exposure: TypeExposure,
  ): TeamRecommendation | null;
}

class DefensiveGapRule implements RecommendationRule {
  readonly id = "Defensive Gap";
  readonly severity: Severity = "Critical";

  check(
    attackingType: PokemonType,
    exposure: TypeExposure,
  ): TeamRecommendation | null {
    const defensiveAnswers = exposure.resist + exposure.immune;
    if (exposure.weak >= 3 && defensiveAnswers <= 1) {
      return {
        type: this.id,
        severity: this.severity,
        attackingType,
        affectedCount: exposure.weak,
        title: `Vulnerabilidad crítica frente a ${attackingType.toUpperCase()}`,
        reason: `${exposure.weak} miembros reciben daño súper-efectivo y solo ${defensiveAnswers} ofrece resistencia/inmunidad. En metagame actual, un atacante ${attackingType} con STAB puede hacer 6-0.`,
        description: `Sustituye al menos uno de los débiles a ${attackingType} por un tipo que resista o sea inmune. Busca redundancia defensiva >=2.`,
      };
    }
    return null;
  }
}

class SinglePointOfFailureRule implements RecommendationRule {
  readonly id = "Dependency";
  readonly severity: Severity = "High";

  check(
    attackingType: PokemonType,
    exposure: TypeExposure,
  ): TeamRecommendation | null {
    if (exposure.weak >= 2 && exposure.resist === 1 && exposure.immune === 0) {
      return {
        type: this.id,
        severity: this.severity,
        attackingType,
        affectedCount: exposure.weak,
        title: `Dependencia defensiva frente a ${attackingType.toUpperCase()}`,
        reason: `Tienes ${exposure.weak} debilidades a ${attackingType} y dependes de un único miembro que resiste. Si ese miembro es debilitado, todo el equipo queda expuesto.`,
        description: `Añade un segundo resist a ${attackingType}. En VGC, esto se llama 'redundancia defensiva' y es clave para no perder por un solo matchup.`,
      };
    }
    return null;
  }
}

const rules: readonly RecommendationRule[] = [
  new DefensiveGapRule(),
  new SinglePointOfFailureRule(),
] as const;

function generate(
  defensiveCoverage: Readonly<Record<string, TypeExposure>>,
): TeamRecommendation[] {
  const recommendations: TeamRecommendation[] = [];

  for (const [rawType, exposure] of Object.entries(defensiveCoverage)) {
    const attackingType = rawType as PokemonType;

    for (const rule of rules) {
      const result = rule.check(attackingType, exposure);
      if (result) {
        recommendations.push(result);
        if (result.severity === "Critical") break;
      }
    }
  }

  return recommendations.sort(
    (a, b) => SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity],
  );
}

function getRules(): readonly RecommendationRule[] {
  return rules;
}

export const RecommendationEngine = {
  generate,
  getRules,
};
