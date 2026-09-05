import type { PokemonTeam } from "../../entities/PokemonTeam";
import type { TypeExposure } from "../../types/TeamTypes";
import { TypeEffectiveness } from "@/domain/types/TypeChart";
import type { PokemonType } from "@/domain/pokemon/types/pokemon";

export const DefensiveAnalyzer = {
  analyze(team: PokemonTeam): Record<PokemonType, TypeExposure> {
    const allTypes: PokemonType[] = [
      "normal",
      "fire",
      "water",
      "grass",
      "electric",
      "ice",
      "fighting",
      "poison",
      "ground",
      "flying",
      "psychic",
      "bug",
      "rock",
      "ghost",
      "dragon",
      "dark",
      "steel",
      "fairy",
    ];
    const coverage: Record<string, TypeExposure> = {};

    for (const attackingType of allTypes) {
      coverage[attackingType] = { weak: 0, resist: 0, immune: 0, neutral: 0 };

      for (const member of team.getMembers()) {
        const types = member.types;
        const multiplier = TypeEffectiveness.getMultiplier(
          attackingType,
          types,
        );

        if (multiplier > 1) coverage[attackingType].weak += 1;
        else if (multiplier === 0) coverage[attackingType].immune += 1;
        else if (multiplier < 1) coverage[attackingType].resist += 1;
        else coverage[attackingType].neutral += 1;
      }
    }
    return coverage;
  },
};
