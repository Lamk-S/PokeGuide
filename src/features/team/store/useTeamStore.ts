import { create } from "zustand";
import type { TeamAnalysis, TeamMember } from "@/domain/team/types/TeamTypes";
import { container } from "@/infrastructure/composition/container";

type TeamMemberInput = TeamMember & {
  id: string;
  pokemonId: number;
  name: string;
  types: string[];
  level: number;
};

type RawMember = {
  id?: unknown;
  name?: unknown;
  pokemonId?: unknown;
  species?: unknown;
  types?: unknown;
  level?: unknown;
};

interface TeamFacade {
  readonly size: number;
  getMembers: () => TeamMember[];
  isEmpty: () => boolean;
}

interface TeamState {
  members: TeamMemberInput[];
  team: TeamFacade;
  analysis: TeamAnalysis | null;
  isAnalyzing: boolean;
  error: string | null;
  isInitialized: boolean;
  setMembers: (members: TeamMemberInput[]) => void;
  addMember: (member: TeamMember | TeamMemberInput) => void;
  removeMember: (id: string | number) => void;
  updateMember: (id: string, patch: Partial<TeamMemberInput>) => void;
  replaceMember: (index: number, member: TeamMember | TeamMemberInput) => void;
  analyze: () => Promise<void>;
  initialize: () => Promise<void>;
  reset: () => void;
}

function toInput(member: TeamMember | TeamMemberInput): TeamMemberInput {
  if (!member) return member as TeamMemberInput;
  const m = member as unknown as RawMember;
  const id = (m.id as string) ?? (m.name as string) ?? `${Date.now()}`;
  const rawPid = (m.pokemonId as number) ?? (m.id as number) ?? 0;
  const pokemonId = typeof rawPid === "number" ? rawPid : Number(rawPid) || 0;
  return {
    ...(member as object),
    id: String(id),
    pokemonId,
    name: (m.name as string) ?? (m.species as string) ?? String(id),
    types: (m.types as string[]) ?? [],
    level: (m.level as number) ?? 50,
  } as TeamMemberInput;
}

export const useTeamStore = create<TeamState>((set, get) => {
  const makeTeam = (): TeamFacade => ({
    get size() {
      return get().members.length;
    },
    getMembers: () => get().members as unknown as TeamMember[],
    isEmpty: () => get().members.length === 0,
  });

  return {
    members: [],
    team: makeTeam(),
    analysis: null,
    isAnalyzing: false,
    error: null,
    isInitialized: false,

    setMembers: (members) => {
      const mapped = members.map(toInput);
      set({ members: mapped, team: makeTeam() });
    },
    addMember: (member) => {
      const input = toInput(member as TeamMemberInput);
      set((state) => {
        const next = [...state.members, input].slice(0, 6);
        return { members: next, team: makeTeam() };
      });
    },
    removeMember: (id) => {
      set((state) => {
        if (typeof id === "number") {
          const next = state.members.filter((_, idx) => idx !== id);
          return { members: next, team: makeTeam() };
        }
        const next = state.members.filter((m) => m.id !== String(id));
        return { members: next, team: makeTeam() };
      });
    },
    updateMember: (id, patch) => {
      set((state) => ({
        members: state.members.map((m) =>
          m.id === id ? { ...m, ...patch } : m,
        ),
        team: makeTeam(),
      }));
    },
    replaceMember: (index, member) => {
      const input = toInput(member as TeamMemberInput);
      set((state) => {
        const next = [...state.members];
        next[index] = input;
        return { members: next, team: makeTeam() };
      });
    },

    initialize: async () => {
      if (get().isInitialized) return;
      try {
        await container.init();
        set({ isInitialized: true, error: null });
      } catch (e) {
        set({
          error:
            e instanceof Error
              ? e.message
              : "Failed to initialize team container",
        });
      }
    },

    analyze: async () => {
      const { members } = get();
      if (members.length === 0) {
        set({ error: "Team is empty" });
        return;
      }
      set({ isAnalyzing: true, error: null });
      try {
        await container.init();
        const useCase = container.getAnalyzeTeamUseCase() as unknown as {
          execute: (m: typeof members) => Promise<TeamAnalysis>;
        };
        const result = await useCase.execute(members);
        set({ analysis: result, isAnalyzing: false, isInitialized: true });
      } catch (e) {
        set({
          error: e instanceof Error ? e.message : "Team analysis failed",
          isAnalyzing: false,
        });
      }
    },

    reset: () =>
      set({
        members: [],
        team: makeTeam(),
        analysis: null,
        error: null,
        isAnalyzing: false,
      }),
  };
});
