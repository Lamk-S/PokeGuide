"use client";

import { create } from "zustand";
import { PokemonTeam } from "@/domain/team/entities/PokemonTeam";
import type { TeamMember, TeamAnalysis } from "@/domain/team/types/TeamTypes";
import { AnalyzeTeamUseCase } from "@/application/team/AnalyzeTeamUseCase";

interface TeamStoreState {
  readonly team: PokemonTeam;
  readonly analysis: TeamAnalysis | null;
  readonly error: string | null;
  addMember: (member: TeamMember) => void;
  removeMember: (index: number) => void;
  replaceMember: (index: number, member: TeamMember) => void;
  clearTeam: () => void;
  setError: (error: string | null) => void;
}

const analyzeUseCase = new AnalyzeTeamUseCase();

function computeAnalysis(team: PokemonTeam): {
  analysis: TeamAnalysis | null;
  error: string | null;
} {
  if (team.isEmpty()) {
    return { analysis: null, error: null };
  }
  try {
    const analysis = analyzeUseCase.execute(team);
    return { analysis, error: null };
  } catch (e) {
    return {
      analysis: null,
      error: e instanceof Error ? e.message : "Error desconocido al analizar",
    };
  }
}

export const useTeamStore = create<TeamStoreState>((set, get) => ({
  team: new PokemonTeam(),
  analysis: null,
  error: null,

  addMember: (member: TeamMember) => {
    try {
      const current = get().team;
      const nextTeam = current.addMember(member);
      const { analysis, error } = computeAnalysis(nextTeam);
      set({ team: nextTeam, analysis, error });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Error al agregar miembro",
      });
    }
  },

  removeMember: (index: number) => {
    try {
      const current = get().team;
      const nextTeam = current.removeMember(index);
      const { analysis } = computeAnalysis(nextTeam);
      set({ team: nextTeam, analysis, error: null });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Error al remover" });
    }
  },

  replaceMember: (index: number, member: TeamMember) => {
    try {
      const current = get().team;
      const nextTeam = current.replaceMember(index, member);
      const { analysis, error } = computeAnalysis(nextTeam);
      set({ team: nextTeam, analysis, error });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Error al reemplazar" });
    }
  },

  clearTeam: () => {
    set({ team: new PokemonTeam(), analysis: null, error: null });
  },

  setError: (error: string | null) => set({ error }),
}));
