import type { PokemonTeam } from "@/domain/team/entities/PokemonTeam";
import type { TeamAnalysis } from "@/domain/team/types/TeamTypes";
import { DefensiveAnalyzer } from "@/domain/team/services/analyzers/DefensiveAnalyzer";
import { RecommendationEngine } from "@/domain/team/services/RecommendationEngine";
import {
  DEFAULT_BATTLE_RULESET,
  type BattleRuleset,
} from "@/domain/team/config/battleFormat";
import { normalizeId } from "@/domain/shared/utils/normalizeId";

export class AnalyzeTeamUseCase {
  private readonly ruleset: BattleRuleset;

  constructor(ruleset: BattleRuleset = DEFAULT_BATTLE_RULESET) {
    this.ruleset = ruleset;
  }

  execute(team: PokemonTeam): TeamAnalysis {
    if (!team) throw new Error("PokemonTeam requerido");
    if (team.isEmpty()) throw new Error("Equipo vacío");

    const defensiveCoverage = DefensiveAnalyzer.analyze(team);
    const members = team.getMembers();

    const averageSpeed =
      members.length > 0
        ? members.reduce((sum, m) => sum + m.calculatedStats.speed, 0) /
          members.length
        : 0;

    const maxSpeed =
      members.length > 0
        ? Math.max(...members.map((m) => m.calculatedStats.speed))
        : 0;

    const effectiveMaxSpeed =
      members.length > 0
        ? Math.max(
            ...members.map((m) => {
              const base = m.calculatedStats.speed;
              const isScarf = normalizeId(m.itemId ?? m.item ?? "").includes(
                "scarf",
              );
              return isScarf
                ? Math.floor(base * this.ruleset.speed.scarfMultiplier)
                : base;
            }),
          )
        : 0;

    const recommendations = RecommendationEngine.generate(
      defensiveCoverage,
      members,
      this.ruleset,
    );

    return Object.freeze({
      defensiveCoverage,
      averageSpeed,
      maxSpeed,
      effectiveMaxSpeed,
      recommendations,
      teamSize: members.length,
    });
  }
}
