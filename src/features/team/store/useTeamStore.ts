"use client";
import { create } from "zustand";
import type {
  TeamMember,
  TypeExposure,
  TeamRecommendation,
  RecommendationCategory,
  RecommendationIssueCode,
} from "@/domain/team/types/TeamTypes";
import { TypeEffectiveness, ALL_POKEMON_TYPES } from "@/domain/types/TypeChart";
import type { PokemonType } from "@/domain/pokemon/types/pokemon";

type TeamAnalysis = {
  defensiveCoverage: Record<string, TypeExposure>;
  recommendations: TeamRecommendation[];
  averageSpeed: number;
  effectiveMaxSpeed: number;
};
type TeamWrapper = {
  getMembers: () => TeamMember[];
  isEmpty: () => boolean;
  size: number;
};

function computeAnalysis(members: TeamMember[]): TeamAnalysis | null {
  if (members.length === 0) return null;
  const defensiveCoverage: Record<string, TypeExposure> = {};
  let totalSpeed = 0;
  let maxEff = 0;
  for (const m of members) {
    const spd = m.calculatedStats?.speed ?? 0;
    const eff =
      m.itemId?.includes("scarf") || m.item?.includes("scarf")
        ? spd * 1.5
        : spd;
    totalSpeed += spd;
    maxEff = Math.max(maxEff, eff);
  }
  for (const atk of ALL_POKEMON_TYPES) {
    let weak = 0,
      resist = 0,
      immune = 0,
      neutral = 0;
    for (const mem of members) {
      const mult = TypeEffectiveness.getMultiplier(
        atk,
        mem.types as readonly PokemonType[],
        mem.abilityId ?? mem.ability ?? null,
        mem.itemId ?? mem.item ?? null,
      );
      if (mult === 0) immune++;
      else if (mult > 1) weak++;
      else if (mult < 1) resist++;
      else neutral++;
    }
    defensiveCoverage[atk] = { weak, resist, immune, neutral };
  }
  const recommendations: TeamRecommendation[] = [];
  for (const atk of ALL_POKEMON_TYPES) {
    const exp = defensiveCoverage[atk];
    if (!exp) continue;
    if (exp.weak >= 2 && exp.resist + exp.immune <= 1) {
      recommendations.push({
        id: `weak-${atk}`,
        severity: exp.weak >= 3 ? "Critical" : "High",
        category: "massive_weakness" as RecommendationCategory,
        attackingType: atk as PokemonType,
        targetType: atk as PokemonType,
        issueCode: "massive_weakness" as RecommendationIssueCode,
        evidence: exp,
      } as TeamRecommendation);
    }
  }
  return {
    defensiveCoverage,
    recommendations,
    averageSpeed: Math.round(totalSpeed / Math.max(1, members.length)),
    effectiveMaxSpeed: Math.round(maxEff),
  };
}
function wrap(members: TeamMember[]): TeamWrapper {
  return {
    getMembers: () => members,
    isEmpty: () => members.length === 0,
    size: members.length,
  };
}

interface State {
  team: TeamWrapper;
  analysis: TeamAnalysis | null;
  error: string | null;
  addMember: (m: TeamMember) => void;
  removeMember: (i: number) => void;
  replaceMember: (i: number, m: TeamMember) => void;
  clearTeam: () => void;
}

export const useTeamStore = create<State>((set, get) => ({
  team: wrap([]),
  analysis: null,
  error: null,
  addMember: (member) => {
    const members = [...get().team.getMembers(), member].slice(0, 6);
    set({ team: wrap(members), analysis: computeAnalysis(members) });
  },
  removeMember: (index) => {
    const members = get()
      .team.getMembers()
      .filter((_, i) => i !== index);
    set({ team: wrap(members), analysis: computeAnalysis(members) });
  },
  replaceMember: (index, member) => {
    const members = get()
      .team.getMembers()
      .map((m, i) => (i === index ? member : m));
    set({ team: wrap(members), analysis: computeAnalysis(members) });
  },
  clearTeam: () => set({ team: wrap([]), analysis: null, error: null }),
}));
