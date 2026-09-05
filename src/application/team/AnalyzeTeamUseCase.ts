import type { PokemonTeam } from "@/domain/team/entities/PokemonTeam";
import type { TeamAnalysis } from "@/domain/team/types/TeamTypes";
import { DefensiveAnalyzer } from "@/domain/team/services/analyzers/DefensiveAnalyzer";
import { RecommendationEngine } from "@/domain/team/services/RecommendationEngine";

export class AnalyzeTeamUseCase {
  execute(team: PokemonTeam): TeamAnalysis {
    // 1. Análisis Defensivo
    const defensiveCoverage = DefensiveAnalyzer.analyze(team);

    // 2. Análisis de Velocidad (Reutilizando StatEngine indirectamente vía pre-cálculo)
    const members = team.getMembers();
    const averageSpeed =
      members.length > 0
        ? members.reduce((sum, m) => sum + m.calculatedStats.speed, 0) /
          members.length
        : 0;

    // 3. Motor de Recomendaciones (Explainability)
    const recommendations = RecommendationEngine.generate(defensiveCoverage);

    // 4. Retornar Análisis completo para la UI
    return {
      defensiveCoverage,
      averageSpeed,
      recommendations,
    };
  }
}
