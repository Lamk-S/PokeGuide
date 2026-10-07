import { create } from "zustand";
import type { Nature } from "@/domain/stats/types/StatTypes";
import type { StatName } from "@/domain/pokemon/types/pokemon";
import type {
  StatusId,
  WeatherId,
  TerrainId,
} from "@/domain/battle/value-objects/BattleModifiers";
import type {
  IBattleParticipantInput,
  IBattleConditions,
  StatSet,
  BattleResult,
} from "@/domain/battle/types/BattleParticipant";
import { container } from "@/infrastructure/composition/container";
import { normalizeId } from "@/domain/shared/utils/normalizeId";

type RawEvIv = Record<string, { value: number } | number>;

function toStatSet(raw: RawEvIv): StatSet {
  const out = {} as StatSet;
  const keys: StatName[] = [
    "hp",
    "attack",
    "defense",
    "special-attack",
    "special-defense",
    "speed",
  ];
  for (const k of keys) {
    const v = raw[k];
    out[k] = typeof v === "number" ? v : (v?.value ?? 0);
  }
  return out;
}

function toDomainInput(input: BattleParticipantInput): IBattleParticipantInput {
  return {
    pokemonId: input.pokemonId,
    level: input.level,
    nature: input.nature,
    evs: toStatSet(input.evs as RawEvIv),
    ivs: toStatSet(input.ivs as RawEvIv),
    ...(input.ability !== undefined ? { ability: input.ability } : {}),
    ...(input.abilityId !== undefined ? { abilityId: input.abilityId } : {}),
    ...(input.item !== undefined ? { item: input.item } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.isCriticalHit !== undefined
      ? { isCriticalHit: input.isCriticalHit }
      : {}),
  };
}

export interface BattleParticipantInput {
  pokemonId: number;
  level: number;
  nature: Nature;
  evs: RawEvIv;
  ivs: RawEvIv;
  ability?: string | undefined;
  abilityId?: string | undefined;
  item?: string | undefined;
  status?: StatusId | undefined;
  isCriticalHit?: boolean | undefined;
}

export interface BattleState {
  attackerInput: BattleParticipantInput | null;
  defenderInput: BattleParticipantInput | null;
  moveName: string;
  moveId: string | undefined;
  result: BattleResult | null;
  conditions: IBattleConditions;
  isCalculating: boolean;
  generation: number;
  setAttacker: (i: BattleParticipantInput | null) => void;
  setDefender: (i: BattleParticipantInput | null) => void;
  setMoveName: (n: string) => void;
  setConditions: (c: Partial<IBattleConditions>) => void;
  setWeather: (w: WeatherId) => void;
  setTerrain: (t: TerrainId) => void;
  setGeneration: (g: number) => void;
  calculateResult: () => Promise<void>;
}

export const useBattleStore = create<BattleState>((set, get) => ({
  attackerInput: null,
  defenderInput: null,
  moveName: "",
  moveId: undefined,
  result: null,
  conditions: { weather: "none", terrain: "none" },
  isCalculating: false,
  generation: 9,
  setAttacker: (input) => set({ attackerInput: input }),
  setDefender: (input) => set({ defenderInput: input }),
  setMoveName: (name) => set({ moveName: name, moveId: normalizeId(name) }),
  setConditions: (nc) =>
    set((s) => ({ conditions: { ...s.conditions, ...nc } })),
  setWeather: (w) =>
    set((s) => ({ conditions: { ...s.conditions, weather: w } })),
  setTerrain: (t) =>
    set((s) => ({ conditions: { ...s.conditions, terrain: t } })),
  setGeneration: (gen) => set({ generation: gen }),
  calculateResult: async () => {
    const { attackerInput, defenderInput, moveName, generation, conditions } =
      get();
    if (!attackerInput || !defenderInput || !moveName) {
      set({ result: null });
      return;
    }
    set({ isCalculating: true });
    try {
      const useCase = container.getBattleUseCase();
      const attacker = toDomainInput(attackerInput);
      const defender = toDomainInput(defenderInput);
      const result = await useCase.execute(
        generation,
        attacker,
        defender,
        moveName,
        conditions,
      );
      set({ result, isCalculating: false });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (
        msg.includes("no está disponible en Gen") ||
        msg.includes("No se pudo crear Pokémon")
      )
        console.warn(msg);
      else console.error(error);
      set({ isCalculating: false, result: null });
    }
  },
}));
