import type { PokemonType } from "@/domain/pokemon/types/pokemon";
import type { TeamMember } from "@/domain/team/types/TeamTypes";
import { ALL_POKEMON_TYPES } from "@/domain/types/TypeChart";

export interface MoveMeta {
  readonly id: string;
  readonly type: PokemonType;
  readonly power: number | null;
}

export interface CoverageInfo {
  readonly covered: boolean;
  readonly byMoves: readonly string[];
}

export interface TeamOffensiveAnalysis {
  readonly coverageMap: Record<PokemonType, CoverageInfo>;
  readonly uncoveredDefenderTypes: readonly PokemonType[];
  readonly totalCoveragePercent: number;
}

const SUPER_EFFECTIVE: Record<PokemonType, readonly PokemonType[]> = {
  normal: [],
  fire: ["grass", "ice", "bug", "steel"] as PokemonType[],
  water: ["fire", "ground", "rock"] as PokemonType[],
  electric: ["water", "flying"] as PokemonType[],
  grass: ["water", "ground", "rock"] as PokemonType[],
  ice: ["grass", "ground", "flying", "dragon"] as PokemonType[],
  fighting: ["normal", "ice", "rock", "dark", "steel"] as PokemonType[],
  poison: ["grass", "fairy"] as PokemonType[],
  ground: ["fire", "electric", "poison", "rock", "steel"] as PokemonType[],
  flying: ["grass", "fighting", "bug"] as PokemonType[],
  psychic: ["fighting", "poison"] as PokemonType[],
  bug: ["grass", "psychic", "dark"] as PokemonType[],
  rock: ["fire", "ice", "flying", "bug"] as PokemonType[],
  ghost: ["psychic", "ghost"] as PokemonType[],
  dragon: ["dragon"] as PokemonType[],
  dark: ["psychic", "ghost"] as PokemonType[],
  steel: ["ice", "rock", "fairy"] as PokemonType[],
  fairy: ["fighting", "dragon", "dark"] as PokemonType[],
} as const;

function getEffectiveness(
  attackType: PokemonType,
  defenderType: PokemonType,
): number {
  const list = SUPER_EFFECTIVE[attackType];
  if (!list) return 1;
  return list.includes(defenderType) ? 2 : 1;
}

function analyzeTeam(
  _members: readonly TeamMember[],
  moveMetaMap: ReadonlyMap<string, MoveMeta>,
): TeamOffensiveAnalysis {
  const moveList = [...moveMetaMap.values()];
  const coverageMap = {} as Record<PokemonType, CoverageInfo>;
  for (const defType of ALL_POKEMON_TYPES) {
    const coveringMoves: string[] = [];
    for (const move of moveList) {
      if (!move.type) continue;
      if (getEffectiveness(move.type, defType) > 1) coveringMoves.push(move.id);
    }
    coverageMap[defType] = {
      covered: coveringMoves.length > 0,
      byMoves: Object.freeze([...coveringMoves]),
    };
  }
  const uncovered = ALL_POKEMON_TYPES.filter((t) => !coverageMap[t].covered);
  const coveredCount = ALL_POKEMON_TYPES.length - uncovered.length;
  const percent = Math.round((coveredCount / ALL_POKEMON_TYPES.length) * 100);
  return {
    coverageMap: Object.freeze(coverageMap) as Record<
      PokemonType,
      CoverageInfo
    >,
    uncoveredDefenderTypes: Object.freeze([
      ...uncovered,
    ]) as readonly PokemonType[],
    totalCoveragePercent: percent,
  };
}

export const OffensiveAnalyzer = { analyze: analyzeTeam };
export function analyzeOffensive(
  members: readonly TeamMember[],
  moveMetaMap: ReadonlyMap<string, MoveMeta>,
): TeamOffensiveAnalysis {
  return analyzeTeam(members, moveMetaMap);
}
