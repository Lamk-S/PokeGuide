import type { PokemonType } from "@/domain/pokemon/types/pokemon";
import { ALL_POKEMON_TYPES } from "@/domain/types/TypeChart";
import type { PokemonTeam } from "../../entities/PokemonTeam";
import type { OffensiveCoverage, OffensiveReport } from "../../types/TeamTypes";

const SUPER_EFFECTIVE_MAP: Record<PokemonType, readonly PokemonType[]> = {
  normal: [],
  fire: ["grass", "ice", "bug", "steel"],
  water: ["fire", "ground", "rock"],
  electric: ["water", "flying"],
  grass: ["water", "ground", "rock"],
  ice: ["grass", "ground", "flying", "dragon"],
  fighting: ["normal", "ice", "rock", "dark", "steel"],
  poison: ["grass", "fairy"],
  ground: ["fire", "electric", "poison", "rock", "steel"],
  flying: ["grass", "fighting", "bug"],
  psychic: ["fighting", "poison"],
  bug: ["grass", "psychic", "dark"],
  rock: ["fire", "ice", "flying", "bug"],
  ghost: ["psychic", "ghost"],
  dragon: ["dragon"],
  dark: ["psychic", "ghost"],
  steel: ["ice", "rock", "fairy"],
  fairy: ["fighting", "dragon", "dark"],
} as const;

const STALLBREAKER_MOVES = new Set([
  "taunt",
  "encore",
  "torment",
  "disable",
  "knock-off",
  "desarme",
  "trick",
  "switcheroo",
  "trick-room",
  "haze",
  "clear-smog",
  "whirlwind",
  "roar",
  "dragon-tail",
  "circle-throw",
]);

function normalizeMoveName(name: string): string {
  return name.toLowerCase().replace(/_/g, "-").trim();
}

function analyze(team: PokemonTeam): OffensiveReport {
  const members = team.getMembers();
  if (members.length === 0) {
    return {
      coverage: [],
      uncoveredTypes: [...ALL_POKEMON_TYPES],
      totalCovered: 0,
      coveragePercent: 0,
      physicalMoves: 0,
      specialMoves: 0,
      hasPhysicalAttacker: false,
      hasSpecialAttacker: false,
      isBalanced: false,
      stallVulnerability: true,
      wallbreakerPresent: false,
    };
  }

  let physicalMoves = 0;
  let specialMoves = 0;
  let hasKnock = false;
  let hasTaunt = false;
  let wallbreakerPresent = false;

  const coverageMap = new Map<PokemonType, Set<string>>();

  for (const type of ALL_POKEMON_TYPES) {
    coverageMap.set(type, new Set());
  }

  for (const member of members) {
    const memberId = member.id;

    for (const move of member.moves) {
      if (!move || move.category === "status") {
        const norm = normalizeMoveName(move?.name ?? "");
        if (STALLBREAKER_MOVES.has(norm)) {
          if (norm === "knock-off" || norm === "desarme") hasKnock = true;
          if (norm === "taunt") hasTaunt = true;
        }
        continue;
      }

      if (!move.power || move.power < 40) continue;

      const moveType = move.type as PokemonType;
      if (!moveType) continue;

      const superEffectiveTargets = SUPER_EFFECTIVE_MAP[moveType] ?? [];

      for (const target of superEffectiveTargets) {
        coverageMap.get(target)?.add(memberId);
      }

      if (move.category === "physical") {
        physicalMoves += 1;
      } else if (move.category === "special") {
        specialMoves += 1;
      }

      if (
        (move.power && move.power >= 110) ||
        normalizeMoveName(move.name).includes("close-combat") ||
        normalizeMoveName(move.name).includes("a-bocajarro")
      ) {
        wallbreakerPresent = true;
      }
    }
  }

  const coverage: OffensiveCoverage[] = [];
  const uncoveredTypes: PokemonType[] = [];

  for (const type of ALL_POKEMON_TYPES) {
    const set = coverageMap.get(type) ?? new Set();
    const isCovered = set.size > 0;
    if (!isCovered) uncoveredTypes.push(type);
    coverage.push({
      type,
      superEffectiveHits: set.size,
      membersCovering: Array.from(set),
      isCovered,
    });
  }

  const totalCovered = coverage.filter((c) => c.isCovered).length;
  const coveragePercent = Math.round(
    (totalCovered / ALL_POKEMON_TYPES.length) * 100,
  );

  const hasPhysicalAttacker = physicalMoves > 0;
  const hasSpecialAttacker = specialMoves > 0;
  const isBalanced = hasPhysicalAttacker && hasSpecialAttacker;

  const stallVulnerability =
    (!hasKnock && !hasTaunt && !wallbreakerPresent && totalCovered < 10) ||
    (physicalMoves === 0 && specialMoves === 0);

  return {
    coverage,
    uncoveredTypes,
    totalCovered,
    coveragePercent,
    physicalMoves,
    specialMoves,
    hasPhysicalAttacker,
    hasSpecialAttacker,
    isBalanced,
    stallVulnerability:
      stallVulnerability ||
      (!hasKnock && !hasTaunt && !wallbreakerPresent && totalCovered < 8),
    wallbreakerPresent,
  };
}

function getRedundantCoverage(report: OffensiveReport): PokemonType[] {
  return report.coverage
    .filter((c) => c.superEffectiveHits >= 4)
    .map((c) => c.type);
}

export const OffensiveAnalyzer = Object.freeze({
  analyze,
  getRedundantCoverage,
});
