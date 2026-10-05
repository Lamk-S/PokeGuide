import type { PokemonTeam } from "../../entities/PokemonTeam";
import type { TypeExposure } from "../../types/TeamTypes";
import { TypeEffectiveness, ALL_POKEMON_TYPES } from "@/domain/types/TypeChart";
import type { PokemonType } from "@/domain/pokemon/types/pokemon";

function analyze(team: PokemonTeam): Record<PokemonType, TypeExposure> {
  const coverage = {} as Record<PokemonType, TypeExposure>;

  for (const atk of ALL_POKEMON_TYPES) {
    coverage[atk] = { weak: 0, resist: 0, immune: 0, neutral: 0 };
  }

  const members = team.getMembers();
  if (members.length === 0) return coverage;

  for (const attackingType of ALL_POKEMON_TYPES) {
    let weak = 0;
    let resist = 0;
    let immune = 0;
    let neutral = 0;

    for (const member of members) {
      if (!member.types || member.types.length === 0) {
        neutral += 1;
        continue;
      }
      const mult = TypeEffectiveness.getMultiplier(
        attackingType,
        member.types,
        member.abilityId ?? member.ability ?? null,
        member.itemId ?? member.item ?? null,
      );
      if (mult === 0) immune += 1;
      else if (mult > 1) weak += 1;
      else if (mult < 1) resist += 1;
      else neutral += 1;
    }

    coverage[attackingType] = { weak, resist, immune, neutral };
  }

  return coverage;
}

export const DefensiveAnalyzer = Object.freeze({ analyze });
