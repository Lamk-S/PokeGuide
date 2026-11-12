import { create } from "zustand";
import { AnalyzeTeamUseCase } from "@/application/team/AnalyzeTeamUseCase";
import type { PokemonType } from "@/domain/pokemon/types/pokemon";
import { PokemonTeam } from "@/domain/team/entities/PokemonTeam";
import type {
  BaseStats,
  CalculatedStats,
  EVSet,
  IVSet,
  ResolvedMove,
  TeamAnalysis,
  TeamMember,
} from "@/domain/team/types/TeamTypes";
import { container } from "@/infrastructure/composition/container";

export type TeamMemberInput = TeamMember & {
  id: string;
  pokemonId: number;
  name: string;
  types: readonly string[];
  level: number;
  moves: readonly ResolvedMove[];
  teraType?: PokemonType;
  isTeraActive?: boolean;
};

type LooseRecord = Record<string, unknown>;

interface LooseMember {
  id?: unknown;
  name?: unknown;
  pokemonId?: unknown;
  species?: unknown;
  types?: unknown;
  level?: unknown;
  moves?: unknown;
  ability?: unknown;
  abilityId?: unknown;
  item?: unknown;
  itemId?: unknown;
  nature?: unknown;
  evs?: unknown;
  ivs?: unknown;
  calculatedStats?: unknown;
  baseStats?: unknown;
  displayNameEs?: unknown;
  teraType?: unknown;
  isTeraActive?: unknown;
}

interface TeamFacade {
  readonly size: number;
  getMembers: () => TeamMember[];
  isEmpty: () => boolean;
  isFull: () => boolean;
}

interface TeamState {
  members: TeamMemberInput[];
  team: TeamFacade;
  analysis: TeamAnalysis | null;
  isAnalyzing: boolean;
  isAnalysisStale: boolean;
  analysisVersion: number;
  error: string | null;
  isInitialized: boolean;
  setMembers: (members: TeamMemberInput[]) => void;
  addMember: (member: TeamMember | TeamMemberInput) => void;
  removeMember: (id: string | number) => void;
  updateMember: (id: string, patch: Partial<TeamMemberInput>) => void;
  replaceMember: (index: number, member: TeamMember | TeamMemberInput) => void;
  toggleTera: (memberId: string) => void;
  analyze: () => Promise<void>;
  initialize: () => Promise<void>;
  reset: () => void;
}

function isRecord(value: unknown): value is LooseRecord {
  return typeof value === "object" && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function defaultEVs(): EVSet {
  return {
    hp: 0,
    attack: 0,
    defense: 0,
    "special-attack": 0,
    "special-defense": 0,
    speed: 0,
  };
}

function defaultIVs(): IVSet {
  return {
    hp: 31,
    attack: 31,
    defense: 31,
    "special-attack": 31,
    "special-defense": 31,
    speed: 31,
  };
}

function defaultBase(): BaseStats {
  return {
    hp: 80,
    attack: 80,
    defense: 80,
    "special-attack": 80,
    "special-defense": 80,
    speed: 80,
  };
}

function defaultCalculated(): CalculatedStats {
  return {
    hp: 100,
    attack: 100,
    defense: 100,
    specialAttack: 100,
    specialDefense: 100,
    speed: 100,
  };
}

const defaultNature = {
  name: "hardy",
  nameEs: "Fuerte",
  increasedStat: null,
  decreasedStat: null,
} as unknown as TeamMember["nature"];

function getStringProp(record: LooseRecord, key: string): string | undefined {
  const v = record[key];
  return isString(v) ? v : undefined;
}

function getNumberProp(record: LooseRecord, key: string): number | undefined {
  const v = record[key];
  return isNumber(v) ? v : undefined;
}

function toResolvedMove(raw: unknown): ResolvedMove {
  const fallbackType: PokemonType = "normal";

  if (!raw) {
    console.error(
      "[toResolvedMove] Movimiento nulo recibido, marcado como inválido",
    );
    return {
      id: "invalid-empty",
      name: "invalid",
      nameEs: "Movimiento inválido",
      type: fallbackType,
      power: null,
      accuracy: null,
      category: "status",
      isInvalid: true,
    } as ResolvedMove;
  }

  if (isString(raw)) {
    console.error(
      `[toResolvedMove] String puro "${raw}" recibido, se marca inválido para evitar inferencia falsa`,
    );
    return {
      id: `invalid-${raw}`,
      name: raw,
      nameEs: "Movimiento inválido - requiere hidratación",
      type: fallbackType,
      power: null,
      accuracy: null,
      category: "status",
      isInvalid: true,
    } as ResolvedMove;
  }

  if (!isRecord(raw)) {
    console.error("[toResolvedMove] Tipo no soportado, marcado inválido", raw);
    return {
      id: "invalid-unknown-type",
      name: "unknown",
      nameEs: "Movimiento inválido",
      type: fallbackType,
      power: null,
      accuracy: null,
      category: "status",
      isInvalid: true,
    } as ResolvedMove;
  }

  const id =
    getStringProp(raw, "id") ?? getStringProp(raw, "name") ?? "unknown";
  const name =
    getStringProp(raw, "name") ?? getStringProp(raw, "id") ?? "unknown";

  if (id === "unknown" || name === "unknown") {
    console.error("[toResolvedMove] Movimiento sin id/nombre válido", raw);
    return {
      id: `invalid-${id}`,
      name,
      nameEs: "Movimiento inválido",
      type: fallbackType,
      power: null,
      accuracy: null,
      category: "status",
      isInvalid: true,
    } as ResolvedMove;
  }

  const nameEs = getStringProp(raw, "nameEs") ?? name;
  const type = getStringProp(raw, "type") ?? fallbackType;
  const power = getNumberProp(raw, "power") ?? null;
  const accuracy = getNumberProp(raw, "accuracy") ?? null;

  const categoryRaw =
    getStringProp(raw, "category") ??
    getStringProp(raw, "damageClass") ??
    "status";
  const category = categoryRaw as ResolvedMove["category"];
  const priority = getNumberProp(raw, "priority") ?? 0;
  const pp = getNumberProp(raw, "pp");
  const effect = getStringProp(raw, "effect");
  const shortEffect = getStringProp(raw, "shortEffect");

  return {
    id,
    name,
    nameEs,
    type: type as PokemonType,
    power,
    accuracy,
    category,
    priority,
    pp,
    effect,
    shortEffect,
    isInvalid: false,
  } as ResolvedMove;
}

function toInput(member: TeamMember | TeamMemberInput): TeamMemberInput {
  const m = member as unknown as LooseMember;
  const id = isString(m.id)
    ? m.id
    : isString(m.name)
      ? m.name
      : `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const rawPid = m.pokemonId ?? m.id;
  const pokemonId = isNumber(rawPid)
    ? rawPid
    : isString(rawPid)
      ? Number(rawPid) || 0
      : 0;

  const movesUnknown = m.moves;
  const movesArray: unknown[] = Array.isArray(movesUnknown) ? movesUnknown : [];
  const moves = movesArray.map(toResolvedMove);

  const name = isString(m.name)
    ? m.name
    : isString(m.species)
      ? m.species
      : String(id);
  const displayNameEs = isString(
    (member as unknown as LooseMember).displayNameEs,
  )
    ? ((member as unknown as LooseMember).displayNameEs as string)
    : name;
  const species = isString(m.species) ? m.species : name;

  const typesRaw = m.types;
  const types: readonly string[] = Array.isArray(typesRaw)
    ? (typesRaw as string[])
    : [];

  const abilityId = (m.abilityId ?? m.ability ?? null) as string | null;
  const itemId = (m.itemId ?? m.item ?? null) as string | null;
  const ability = (m.ability ?? m.abilityId ?? null) as string | null;
  const item = (m.item ?? m.itemId ?? null) as string | null;

  const level = isNumber(m.level) ? m.level : 50;

  const teraTypeRaw = m.teraType;
  const teraType = isString(teraTypeRaw)
    ? (teraTypeRaw as PokemonType)
    : undefined;
  const isTeraActive =
    typeof m.isTeraActive === "boolean" ? m.isTeraActive : false;

  const baseRecord = member as unknown as LooseRecord;

  const full: TeamMemberInput = {
    ...(baseRecord as unknown as TeamMemberInput),
    id: String(id),
    pokemonId,
    name,
    displayNameEs,
    species,
    types: types as unknown as PokemonType[],
    abilityId,
    itemId,
    ability,
    item,
    nature: (m.nature as TeamMember["nature"]) ?? defaultNature,
    level,
    evs: (m.evs as EVSet) ?? (baseRecord.evs as EVSet) ?? defaultEVs(),
    ivs: (m.ivs as IVSet) ?? (baseRecord.ivs as IVSet) ?? defaultIVs(),
    baseStats:
      (m.baseStats as BaseStats) ??
      (baseRecord.baseStats as BaseStats) ??
      defaultBase(),
    calculatedStats:
      (m.calculatedStats as CalculatedStats) ??
      (baseRecord.calculatedStats as CalculatedStats) ??
      defaultCalculated(),
    moves,
    teraType,
    isTeraActive,
  } as TeamMemberInput;

  return full;
}

function makeTeamFacade(get: () => TeamState): TeamFacade {
  return {
    get size() {
      return get().members.length;
    },
    getMembers: () => get().members as unknown as TeamMember[],
    isEmpty: () => get().members.length === 0,
    isFull: () => get().members.length >= 6,
  };
}

export const useTeamStore = create<TeamState>((set, get) => {
  let internalVersion = 0;
  const buildFacade = (): TeamFacade => makeTeamFacade(get);

  return {
    members: [],
    team: buildFacade(),
    analysis: null,
    isAnalyzing: false,
    isAnalysisStale: false,
    analysisVersion: 0,
    error: null,
    isInitialized: false,

    setMembers: (members) => {
      const mapped = members.map(toInput);
      internalVersion += 1;
      set({
        members: mapped,
        team: buildFacade(),
        isAnalysisStale: true,
        analysisVersion: internalVersion,
        error: null,
      });
    },

    addMember: (member) => {
      const input = toInput(member as TeamMemberInput);
      internalVersion += 1;
      set((state) => {
        const next = [...state.members, input].slice(0, 6);
        return {
          members: next,
          team: buildFacade(),
          isAnalysisStale: true,
          analysisVersion: internalVersion,
          error: null,
        };
      });
    },

    removeMember: (id) => {
      internalVersion += 1;
      set((state) => {
        const next: TeamMemberInput[] =
          typeof id === "number"
            ? state.members.filter((_, idx) => idx !== id)
            : state.members.filter((m) => m.id !== String(id));
        return {
          members: next,
          team: buildFacade(),
          isAnalysisStale: true,
          analysisVersion: internalVersion,
          error: null,
        };
      });
    },

    updateMember: (id, patch) => {
      internalVersion += 1;
      set((state) => {
        const next = state.members.map((m) => {
          if (m.id !== id) return m;
          const updated = { ...m, ...patch } as unknown as LooseMember;
          const movesPatch = patch.moves as unknown;
          if (Array.isArray(movesPatch)) {
            (updated as unknown as Record<string, unknown>).moves = (
              movesPatch as unknown[]
            ).map(toResolvedMove);
          }
          return toInput(updated as unknown as TeamMemberInput);
        });
        return {
          members: next,
          team: buildFacade(),
          isAnalysisStale: true,
          analysisVersion: internalVersion,
          error: null,
        };
      });
    },

    replaceMember: (index, member) => {
      const input = toInput(member as TeamMemberInput);
      internalVersion += 1;
      set((state) => {
        const next = [...state.members];
        if (index >= 0 && index < next.length) {
          next[index] = input;
        }
        return {
          members: next,
          team: buildFacade(),
          isAnalysisStale: true,
          analysisVersion: internalVersion,
          error: null,
        };
      });
    },

    toggleTera: (memberId: string) => {
      internalVersion += 1;
      set((state) => {
        const target = state.members.find((m) => m.id === memberId);
        if (!target) return state;
        const shouldActivate = !target.isTeraActive;
        const next = state.members.map((m) => {
          if (m.id === memberId) {
            return { ...m, isTeraActive: shouldActivate } as TeamMemberInput;
          }
          if (shouldActivate && m.isTeraActive) {
            return { ...m, isTeraActive: false } as TeamMemberInput;
          }
          return m;
        });
        return {
          members: next,
          team: buildFacade(),
          isAnalysisStale: true,
          analysisVersion: internalVersion,
          error: null,
        };
      });
    },

    initialize: async () => {
      if (get().isInitialized) return;
      try {
        await container.init();
        set({ isInitialized: true, error: null, team: buildFacade() });
      } catch (e) {
        set({
          error:
            e instanceof Error
              ? e.message
              : "Failed to initialize team container",
          team: buildFacade(),
        });
      }
    },

    analyze: async () => {
      const { members } = get();
      if (members.length === 0) {
        set({ error: "Team is empty", isAnalysisStale: false });
        return;
      }

      const analyzingVersion = get().analysisVersion;
      set({ isAnalyzing: true, error: null });

      try {
        await container.init();
        const teamEntity = new PokemonTeam(members as unknown as TeamMember[]);
        const useCase = new AnalyzeTeamUseCase();
        const result = useCase.execute(teamEntity);

        if (get().analysisVersion !== analyzingVersion) {
          set({ isAnalyzing: false, isAnalysisStale: true });
          return;
        }

        set({
          analysis: result,
          isAnalyzing: false,
          isAnalysisStale: false,
          isInitialized: true,
          error: null,
        });
      } catch (e) {
        if (get().analysisVersion !== analyzingVersion) {
          set({ isAnalyzing: false, isAnalysisStale: true });
          return;
        }
        set({
          error: e instanceof Error ? e.message : "Team analysis failed",
          isAnalyzing: false,
          isAnalysisStale: false,
        });
      }
    },

    reset: () => {
      internalVersion += 1;
      set({
        members: [],
        team: buildFacade(),
        analysis: null,
        error: null,
        isAnalyzing: false,
        isAnalysisStale: false,
        analysisVersion: internalVersion,
      });
    },
  };
});
