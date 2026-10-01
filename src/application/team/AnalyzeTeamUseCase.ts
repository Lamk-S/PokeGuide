import type { PokemonTeam } from "@/domain/team/entities/PokemonTeam";
import type { TeamAnalysis } from "@/domain/team/types/TeamTypes";
import { DefensiveAnalyzer } from "@/domain/team/services/analyzers/DefensiveAnalyzer";
import { RecommendationEngine } from "@/domain/team/services/RecommendationEngine";

export class AnalyzeTeamUseCase {
  execute(team: PokemonTeam): TeamAnalysis {
    if (!team) {
      throw new Error("PokemonTeam es requerido. No puede ser nulo.");
    }

    if (team.isEmpty()) {
      throw new Error(
        "No se puede analizar un equipo vacío. Agrega al menos 1 Pokémon.",
      );
    }

    const defensiveCoverage = DefensiveAnalyzer.analyze(team);

    const members = team.getMembers();
    const averageSpeed =
      members.length > 0
        ? members.reduce((sum, m) => {
            const speed = m.calculatedStats?.speed ?? 0;
            return sum + speed;
          }, 0) / members.length
        : 0;

    const recommendations = RecommendationEngine.generate(defensiveCoverage);

    const analysis: TeamAnalysis = {
      defensiveCoverage,
      averageSpeed,
      recommendations,
      teamSize: members.length,
    };

    return Object.freeze(analysis);
  }
}
