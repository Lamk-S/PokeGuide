import type { PokemonType } from "@/domain/pokemon/types/pokemon";
import { ALL_POKEMON_TYPES, TypeEffectiveness } from "@/domain/types/TypeChart";
import type { PokemonTeam } from "../../entities/PokemonTeam";
import type {
  DefensiveCoverage,
  DefensiveReport,
  SafeSwitchIns,
} from "../../types/TeamTypes";

function buildEmptyCoverage(): DefensiveCoverage {
  const coverage = {} as DefensiveCoverage;
  for (const atk of ALL_POKEMON_TYPES) {
    coverage[atk] = { weak: 0, resist: 0, immune: 0, neutral: 0 };
  }
  return coverage;
}

function analyze(team: PokemonTeam): DefensiveCoverage {
  const coverage = buildEmptyCoverage();
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

function analyzeDetailed(team: PokemonTeam): DefensiveReport {
  const coverage = buildEmptyCoverage();
  const safeSwitchIns: SafeSwitchIns[] = [];
  const criticalWeaknesses: PokemonType[] = [];
  const mitigatedWeaknesses: {
    type: PokemonType;
    originalWeak: number;
    mitigatedWeak: number;
    mitigationSources: string[];
  }[] = [];

  const members = team.getMembers();
  if (members.length === 0) {
    return {
      coverage,
      safeSwitchIns: [],
      criticalWeaknesses: [],
      mitigatedWeaknesses: [],
    };
  }

  for (const attackingType of ALL_POKEMON_TYPES) {
    let weak = 0;
    let resist = 0;
    let immune = 0;
    let neutral = 0;
    const resistingMembers: string[] = [];
    const mitigationSources: string[] = [];
    let originalWeakCount = 0;

    for (const member of members) {
      if (!member.types || member.types.length === 0) {
        neutral += 1;
        continue;
      }

      const baseMult = TypeEffectiveness.getMultiplier(
        attackingType,
        member.types,
        null,
        null,
      );
      const effectiveMult = TypeEffectiveness.getMultiplier(
        attackingType,
        member.types,
        member.abilityId ?? member.ability ?? null,
        member.itemId ?? member.item ?? null,
      );

      if (baseMult > 1) originalWeakCount += 1;

      if (effectiveMult === 0) {
        immune += 1;
        resistingMembers.push(member.id);
        const src = TypeEffectiveness.getMitigationSource(
          attackingType,
          member.abilityId ?? member.ability ?? null,
          member.itemId ?? member.item ?? null,
        );
        if (src) mitigationSources.push(`${member.name}: ${src}`);
      } else if (effectiveMult > 1) {
        weak += 1;
      } else if (effectiveMult < 1) {
        resist += 1;
        resistingMembers.push(member.id);
        const src = TypeEffectiveness.getMitigationSource(
          attackingType,
          member.abilityId ?? member.ability ?? null,
          member.itemId ?? member.item ?? null,
        );
        if (src) mitigationSources.push(`${member.name}: ${src}`);
      } else {
        neutral += 1;
      }
    }

    coverage[attackingType] = { weak, resist, immune, neutral };

    const totalResist = resist + immune;
    const isSafe = totalResist >= 2 || (totalResist >= 1 && weak <= 1);

    safeSwitchIns.push({
      type: attackingType,
      count: totalResist,
      members: resistingMembers,
      isSafe,
    });

    if (weak >= 3 && totalResist <= 1) {
      criticalWeaknesses.push(attackingType);
    }

    if (originalWeakCount > weak) {
      mitigatedWeaknesses.push({
        type: attackingType,
        originalWeak: originalWeakCount,
        mitigatedWeak: weak,
        mitigationSources,
      });
    }
  }

  return {
    coverage,
    safeSwitchIns,
    criticalWeaknesses,
    mitigatedWeaknesses,
  };
}

function getUnsafeTypes(report: DefensiveReport): PokemonType[] {
  return report.safeSwitchIns.filter((s) => !s.isSafe).map((s) => s.type);
}

export const DefensiveAnalyzer = Object.freeze({
  analyze,
  analyzeDetailed,
  getUnsafeTypes,
});
