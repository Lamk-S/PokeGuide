"use client";
import { create } from "zustand";
import type {
  BattleResult,
  IBattleConditions,
  StatSet,
} from "@/domain/battle/types/BattleParticipant";
import type {
  StatusId,
  TerrainId,
  WeatherId,
} from "@/domain/battle/value-objects/BattleModifiers";
import type { PokemonType, StatName } from "@/domain/pokemon/types/pokemon";
import { NATURES } from "@/domain/stats/constants/natures";
import { calculateStats } from "@/domain/stats/services/StatCalculator";
import type { BaseStats, Nature } from "@/domain/stats/types/StatTypes";
import { TypeEffectiveness } from "@/domain/types/TypeChart";
import { LocalPokemonRepository } from "@/infrastructure/local-data/repositories/local-pokemon.repository";

function getMoveData(moveName: string): {
  power: number;
  type: string;
  damageClass: string;
} {
  if (!moveName) return { power: 0, type: "normal", damageClass: "status" };
  const key = moveName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
  const FALLBACK: Record<
    string,
    { power: number; type: string; damageClass: string }
  > = {
    tackle: { power: 40, type: "normal", damageClass: "physical" },
    placaje: { power: 40, type: "normal", damageClass: "physical" },
    "blast-burn": { power: 150, type: "fire", damageClass: "special" },
    "anillo igneo": { power: 150, type: "fire", damageClass: "special" },
    "fire-punch": { power: 75, type: "fire", damageClass: "physical" },
    "puno fuego": { power: 75, type: "fire", damageClass: "physical" },
    flamethrower: { power: 90, type: "fire", damageClass: "special" },
    lanzallamas: { power: 90, type: "fire", damageClass: "special" },
    "fire-blast": { power: 110, type: "fire", damageClass: "special" },
    llamarada: { power: 110, type: "fire", damageClass: "special" },
    "hydro-pump": { power: 110, type: "water", damageClass: "special" },
    hidrobomba: { power: 110, type: "water", damageClass: "special" },
    surf: { power: 90, type: "water", damageClass: "special" },
    earthquake: { power: 100, type: "ground", damageClass: "physical" },
    terremoto: { power: 100, type: "ground", damageClass: "physical" },
    thunderbolt: { power: 90, type: "electric", damageClass: "special" },
    rayo: { power: 90, type: "electric", damageClass: "special" },
    "ice-beam": { power: 90, type: "ice", damageClass: "special" },
    "rayo hielo": { power: 90, type: "ice", damageClass: "special" },
  };
  return (
    FALLBACK[key] ?? { power: 80, type: "normal", damageClass: "physical" }
  );
}

export type BattleSide = "attacker" | "defender";

export interface BattleParticipantInput {
  pokemonId: number;
  name?: string | null;
  level: number;
  nature: Nature;
  evs: StatSet;
  ivs: StatSet;
  moves: string[];
  item: string | null;
  ability: string | null;
  status: StatusId | "healthy";
  isCriticalHit?: boolean;
}

const seriousFound = NATURES.find((n) => n.name === "Serious");
const SERIOUS_NATURE: Nature =
  seriousFound ??
  ({
    name: "Serious",
    nameEs: "Seria",
    increasedStat: null,
    decreasedStat: null,
  } as Nature);

const DEFAULT_EVS: StatSet = {
  hp: 0,
  attack: 0,
  defense: 0,
  "special-attack": 0,
  "special-defense": 0,
  speed: 0,
};

const DEFAULT_IVS: StatSet = {
  hp: 31,
  attack: 31,
  defense: 31,
  "special-attack": 31,
  "special-defense": 31,
  speed: 31,
};

function createDefaultInput(
  id: number,
  name?: string | null,
): BattleParticipantInput {
  return {
    pokemonId: id,
    name: name ?? null,
    level: 50,
    nature: SERIOUS_NATURE,
    evs: { ...DEFAULT_EVS },
    ivs: { ...DEFAULT_IVS },
    moves: [],
    item: null,
    ability: null,
    status: "healthy",
  };
}

function enforceShedinja(
  input: BattleParticipantInput,
): BattleParticipantInput {
  if (input.pokemonId === 292) {
    return {
      ...input,
      evs: { ...input.evs, hp: 0 },
      ivs: { ...input.ivs, hp: 0 },
    };
  }
  return input;
}

function cleanOnPokemonChange(
  newId: number,
  oldInput: BattleParticipantInput | null,
  name?: string | null,
): BattleParticipantInput {
  const base = oldInput
    ? { ...oldInput, pokemonId: newId, name: name ?? oldInput.name }
    : createDefaultInput(newId, name);
  const cleaned: BattleParticipantInput = {
    ...base,
    pokemonId: newId,
    name: name ?? base.name ?? null,
    moves: [],
    item: null,
    status: "healthy",
    nature: SERIOUS_NATURE,
    ability: null,
  };
  return enforceShedinja(cleaned);
}

let abortController: AbortController | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let latestRequestId = 0;
let repoInstance: LocalPokemonRepository | null = null;
let repoInitPromise: Promise<LocalPokemonRepository> | null = null;

async function getInitializedRepo(): Promise<LocalPokemonRepository> {
  if (repoInstance) return repoInstance;
  if (!repoInitPromise) {
    repoInitPromise = (async () => {
      const r = new LocalPokemonRepository();
      await r.init();
      repoInstance = r;
      return r;
    })();
  }
  return repoInitPromise;
}

function normalizeWeather(w: string | null | undefined): string {
  if (!w) return "none";
  const lower = w.toLowerCase();
  if (
    lower.includes("sol") ||
    lower === "sun" ||
    lower === "harsh_sun" ||
    lower.includes("harsh")
  )
    return "sun";
  if (
    lower.includes("lluvia") ||
    lower === "rain" ||
    lower.includes("heavy_rain")
  )
    return "rain";
  if (lower.includes("arena") || lower === "sand") return "sand";
  if (
    lower.includes("nieve") ||
    lower === "snow" ||
    lower.includes("hail") ||
    lower.includes("granizo")
  )
    return "hail";
  return lower;
}

function normalizeTerrain(t: string | null | undefined): string {
  if (!t) return "none";
  const lower = t.toLowerCase();
  if (lower.includes("electr") || lower === "electric") return "electric";
  if (lower.includes("hierba") || lower.includes("grass") || lower === "grassy")
    return "grassy";
  if (lower.includes("niebla") || lower.includes("misty")) return "misty";
  if (lower.includes("psiqu") || lower.includes("psychic")) return "psychic";
  return lower;
}

interface BattleLabState {
  attackerInput: BattleParticipantInput | null;
  defenderInput: BattleParticipantInput | null;
  moveName: string;
  conditions: IBattleConditions;
  result: BattleResult | null;
  isCalculating: boolean;
  error: string | null;
  generation: number;
  hasCalculatedOnce: boolean;
  autoCalculate: boolean;
  attacker: BattleParticipantInput | null;
  defender: BattleParticipantInput | null;
  setAttacker: (input: BattleParticipantInput | null) => void;
  setDefender: (input: BattleParticipantInput | null) => void;
  setMoveName: (name: string) => void;
  calculateResult: () => Promise<void>;
  setGeneration: (gen: number) => void;
  setWeather: (w: WeatherId) => void;
  setTerrain: (t: TerrainId) => void;
  setPokemon: (
    side: BattleSide,
    pokemonId: number | null,
    name?: string | null,
  ) => void;
  setLevel: (side: BattleSide, level: number) => void;
  setNature: (side: BattleSide, nature: Nature) => void;
  setEV: (side: BattleSide, stat: keyof StatSet, value: number) => void;
  setIV: (side: BattleSide, stat: keyof StatSet, value: number) => void;
  setMoves: (side: BattleSide, moves: string[]) => void;
  setItem: (side: BattleSide, item: string | null) => void;
  setStatus: (side: BattleSide, status: StatusId | "healthy") => void;
  setAbility: (side: BattleSide, ability: string | null) => void;
  calculate: () => Promise<void>;
  scheduleCalculate: () => void;
  setHasCalculatedOnce: (v: boolean) => void;
  setAutoCalculate: (v: boolean) => void;
}

export const useBattleStore = create<BattleLabState>((set, get) => ({
  attackerInput: null,
  defenderInput: null,
  attacker: null,
  defender: null,
  moveName: "",
  conditions: { weather: "none", terrain: "none" } as IBattleConditions,
  result: null,
  isCalculating: false,
  error: null,
  generation: 9,
  hasCalculatedOnce: false,
  autoCalculate: false,

  setAttacker: (input) =>
    set((state) => {
      if (!input) return { attackerInput: null, attacker: null };
      const prevId = state.attackerInput?.pokemonId;
      let next = { ...input };
      if (prevId !== undefined && prevId !== next.pokemonId) {
        next = {
          ...next,
          moves: [],
          item: null,
          status: "healthy",
          nature: SERIOUS_NATURE,
        };
      }
      next = enforceShedinja(next);
      setTimeout(() => get().scheduleCalculate(), 0);
      return { attackerInput: next, attacker: next };
    }),

  setDefender: (input) =>
    set((state) => {
      if (!input) return { defenderInput: null, defender: null };
      const prevId = state.defenderInput?.pokemonId;
      let next = { ...input };
      if (prevId !== undefined && prevId !== next.pokemonId) {
        next = {
          ...next,
          moves: [],
          item: null,
          status: "healthy",
          nature: SERIOUS_NATURE,
        };
      }
      next = enforceShedinja(next);
      setTimeout(() => get().scheduleCalculate(), 0);
      return { defenderInput: next, defender: next };
    }),

  setMoveName: (name) => {
    set({ moveName: name });
    get().scheduleCalculate();
  },

  setGeneration: (gen) => {
    set((state) => {
      const sanitize = (
        p: BattleParticipantInput | null,
      ): BattleParticipantInput | null => {
        if (!p) return p;
        let next = { ...p };
        if (gen <= 2) next = { ...next, ability: null };
        if (gen <= 1) next = { ...next, item: null };
        return next;
      };
      return {
        generation: gen,
        attackerInput: sanitize(state.attackerInput),
        attacker: sanitize(
          state.attacker as BattleParticipantInput | null,
        ) as BattleParticipantInput | null,
        defenderInput: sanitize(state.defenderInput),
        defender: sanitize(
          state.defender as BattleParticipantInput | null,
        ) as BattleParticipantInput | null,
      };
    });
    get().scheduleCalculate();
  },

  setWeather: (w) => {
    set((state) => ({
      conditions: { ...state.conditions, weather: w } as IBattleConditions,
    }));
    get().scheduleCalculate();
  },
  setTerrain: (t) => {
    set((state) => ({
      conditions: { ...state.conditions, terrain: t } as IBattleConditions,
    }));
    get().scheduleCalculate();
  },

  setPokemon: (side, pokemonId, name) => {
    if (pokemonId === null) {
      if (side === "attacker") set({ attackerInput: null, attacker: null });
      else set({ defenderInput: null, defender: null });
      return;
    }
    const state = get();
    const current =
      side === "attacker" ? state.attackerInput : state.defenderInput;
    const cleaned = cleanOnPokemonChange(pokemonId, current, name);
    if (side === "attacker") set({ attackerInput: cleaned, attacker: cleaned });
    else set({ defenderInput: cleaned, defender: cleaned });
    get().scheduleCalculate();
  },

  setLevel: (side, level) => {
    const clamped = Math.min(100, Math.max(1, Math.floor(level)));
    set((state) => {
      const cur =
        side === "attacker" ? state.attackerInput : state.defenderInput;
      if (!cur) return {};
      const next = { ...cur, level: clamped };
      return side === "attacker"
        ? { attackerInput: next, attacker: next }
        : { defenderInput: next, defender: next };
    });
    get().scheduleCalculate();
  },

  setNature: (side, nature) => {
    set((state) => {
      const cur =
        side === "attacker" ? state.attackerInput : state.defenderInput;
      if (!cur) return {};
      const next = { ...cur, nature };
      return side === "attacker"
        ? { attackerInput: next, attacker: next }
        : { defenderInput: next, defender: next };
    });
    get().scheduleCalculate();
  },

  setEV: (side, stat, value) => {
    set((state) => {
      const cur =
        side === "attacker" ? state.attackerInput : state.defenderInput;
      if (!cur) return {};
      if (cur.pokemonId === 292 && stat === "hp") return {};
      const clamped = Math.min(252, Math.max(0, Math.floor(value)));
      const next = { ...cur, evs: { ...cur.evs, [stat]: clamped } };
      return side === "attacker"
        ? { attackerInput: next, attacker: next }
        : { defenderInput: next, defender: next };
    });
    get().scheduleCalculate();
  },

  setIV: (side, stat, value) => {
    set((state) => {
      const cur =
        side === "attacker" ? state.attackerInput : state.defenderInput;
      if (!cur) return {};
      if (cur.pokemonId === 292 && stat === "hp") return {};
      const clamped = Math.min(31, Math.max(0, Math.floor(value)));
      const next = { ...cur, ivs: { ...cur.ivs, [stat]: clamped } };
      return side === "attacker"
        ? { attackerInput: next, attacker: next }
        : { defenderInput: next, defender: next };
    });
    get().scheduleCalculate();
  },

  setMoves: (side, moves) => {
    set((state) => {
      const cur =
        side === "attacker" ? state.attackerInput : state.defenderInput;
      if (!cur) return {};
      const next = { ...cur, moves: moves.slice(0, 4) };
      return side === "attacker"
        ? { attackerInput: next, attacker: next }
        : { defenderInput: next, defender: next };
    });
    get().scheduleCalculate();
  },

  setItem: (side, item) => {
    set((state) => {
      const cur =
        side === "attacker" ? state.attackerInput : state.defenderInput;
      if (!cur) return {};
      const trimmed = (item || "").trim();
      const clean = trimmed !== "" && trimmed !== "-" ? trimmed : null;
      const next = { ...cur, item: clean };
      return side === "attacker"
        ? { attackerInput: next, attacker: next }
        : { defenderInput: next, defender: next };
    });
    get().scheduleCalculate();
  },

  setStatus: (side, status) => {
    set((state) => {
      const cur =
        side === "attacker" ? state.attackerInput : state.defenderInput;
      if (!cur) return {};
      const next = { ...cur, status };
      return side === "attacker"
        ? { attackerInput: next, attacker: next }
        : { defenderInput: next, defender: next };
    });
    get().scheduleCalculate();
  },

  setAbility: (side, ability) => {
    set((state) => {
      const cur =
        side === "attacker" ? state.attackerInput : state.defenderInput;
      if (!cur) return {};
      const clean =
        ability && ability !== "" && ability !== "-" ? ability : null;
      const next = { ...cur, ability: clean };
      return side === "attacker"
        ? { attackerInput: next, attacker: next }
        : { defenderInput: next, defender: next };
    });
    get().scheduleCalculate();
  },

  setHasCalculatedOnce: (v) => set({ hasCalculatedOnce: v }),
  setAutoCalculate: (v) => set({ autoCalculate: v }),

  scheduleCalculate: () => {
    const { hasCalculatedOnce, autoCalculate } = get();
    if (!hasCalculatedOnce && !autoCalculate) return;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      get().calculate();
    }, 250);
  },

  calculate: async () => {
    const { attackerInput, defenderInput, generation, conditions, moveName } =
      get();
    if (!attackerInput?.pokemonId || !defenderInput?.pokemonId) {
      set({ result: null });
      return;
    }
    const requestId = ++latestRequestId;
    if (abortController) abortController.abort();
    abortController = new AbortController();
    const signal = abortController.signal;
    set({ isCalculating: true, error: null });

    try {
      const repo = await getInitializedRepo();
      if (signal.aborted || requestId !== latestRequestId) return;

      type RepoLike = {
        getById?: (id: number) => Promise<unknown>;
        getPokemonById?: (id: number) => Promise<unknown>;
      };
      const repoTyped = repo as unknown as RepoLike;

      const attackerBaseData = ((await repoTyped.getById?.(
        attackerInput.pokemonId,
      )) ??
        (await repoTyped.getPokemonById?.(attackerInput.pokemonId)) ??
        null) as {
        baseStats?: unknown;
        stats?: unknown;
        types?: unknown[];
      } | null;

      const defenderBaseData = ((await repoTyped.getById?.(
        defenderInput.pokemonId,
      )) ??
        (await repoTyped.getPokemonById?.(defenderInput.pokemonId)) ??
        null) as {
        baseStats?: unknown;
        stats?: unknown;
        types?: unknown[];
      } | null;

      const attackerBaseStats = attackerBaseData?.baseStats ||
        attackerBaseData?.stats || {
          hp: 80,
          attack: 80,
          defense: 80,
          "special-attack": 80,
          "special-defense": 80,
          speed: 80,
        };
      const defenderBaseStats = defenderBaseData?.baseStats ||
        defenderBaseData?.stats || {
          hp: 80,
          attack: 80,
          defense: 80,
          "special-attack": 80,
          "special-defense": 80,
          speed: 80,
        };

      const extractTypeNameSafe = (t: unknown): string => {
        if (!t) return "";
        if (typeof t === "string") return t;
        const obj = t as { type?: { name?: string }; name?: string };
        return obj.type?.name || obj.name || "";
      };

      const attackerTypes = (
        attackerBaseData?.types?.map((t: unknown) =>
          extractTypeNameSafe(t),
        ) || ["normal"]
      ).filter(Boolean) as string[];

      const defenderTypes = (
        defenderBaseData?.types?.map((t: unknown) =>
          extractTypeNameSafe(t),
        ) || ["normal"]
      ).filter(Boolean) as string[];

      const attackerStats = calculateStats({
        baseStats: attackerBaseStats as BaseStats,
        level: attackerInput.level,
        nature: attackerInput.nature as never,
        ivs: attackerInput.ivs as unknown as Record<StatName, number>,
        evs: attackerInput.evs as unknown as Record<StatName, number>,
        generation,
      }) as Record<StatName, number>;

      const defenderStats = calculateStats({
        baseStats: defenderBaseStats as BaseStats,
        level: defenderInput.level,
        nature: defenderInput.nature as never,
        ivs: defenderInput.ivs as unknown as Record<StatName, number>,
        evs: defenderInput.evs as unknown as Record<StatName, number>,
        generation,
      }) as Record<StatName, number>;

      if (attackerInput.pokemonId === 292) attackerStats.hp = 1;
      if (defenderInput.pokemonId === 292) defenderStats.hp = 1;

      const move = getMoveData(moveName || attackerInput.moves[0] || "Tackle");
      const power = move.power || 0;

      if (power === 0) {
        const res = {
          damage: {
            minDamage: 0,
            maxDamage: 0,
            minPercent: 0,
            maxPercent: 0,
            rolls: [0],
          },
          defenderMaxHp: defenderStats.hp,
          attackerMaxHp: attackerStats.hp,
          koAnalysis: { guaranteed: false, hitsToKO: 0, probability: 0 },
          effectiveness: 1,
          attackerInput,
          defenderInput,
        } as unknown as BattleResult;
        set({
          result: res,
          isCalculating: false,
          hasCalculatedOnce: true,
          autoCalculate: true,
        });
        return;
      }

      const isPhysical = move.damageClass === "physical";
      const attackStat = isPhysical
        ? attackerStats.attack
        : attackerStats["special-attack"];
      const defenseStat = isPhysical
        ? defenderStats.defense
        : defenderStats["special-defense"];

      const level = attackerInput.level;
      const base =
        Math.floor(
          Math.floor(
            (Math.floor((2 * level) / 5 + 2) * power * attackStat) /
              defenseStat,
          ) / 50,
        ) + 2;

      let stab = 1;
      if (
        attackerTypes
          .map((t) => t.toLowerCase())
          .includes(move.type.toLowerCase())
      ) {
        stab = 1.5;
        const abil = (attackerInput.ability || "").toLowerCase();
        if (abil.includes("adapt") || abil.includes("adaptable")) stab = 2;
      }

      const effectiveness = TypeEffectiveness.getMultiplier(
        move.type as PokemonType,
        defenderTypes as PokemonType[],
        defenderInput.ability ?? null,
        defenderInput.item ?? null,
      );

      let burnMod = 1;
      const statusStr = String(attackerInput.status || "").toLowerCase();
      const abilityStr = (attackerInput.ability || "").toLowerCase();
      if (
        (statusStr.includes("burn") || statusStr === "burn") &&
        isPhysical &&
        !abilityStr.includes("guts") &&
        !abilityStr.includes("agallas")
      ) {
        if (
          !moveName.toLowerCase().includes("facade") &&
          !moveName.toLowerCase().includes("fachada")
        ) {
          burnMod = 0.5;
        }
      }

      let weatherMod = 1;
      const wNorm = normalizeWeather(conditions.weather as string);
      const moveTypeLower = move.type.toLowerCase();
      if (wNorm === "sun") {
        if (moveTypeLower === "fire" || moveTypeLower === "fuego")
          weatherMod = 1.5;
        if (moveTypeLower === "water" || moveTypeLower === "agua")
          weatherMod = 0.5;
      }
      if (wNorm === "rain") {
        if (moveTypeLower === "water" || moveTypeLower === "agua")
          weatherMod = 1.5;
        if (moveTypeLower === "fire" || moveTypeLower === "fuego")
          weatherMod = 0.5;
      }

      let terrainMod = 1;
      const tNorm = normalizeTerrain(conditions.terrain as string);
      if (tNorm === "electric" && moveTypeLower === "electric")
        terrainMod = 1.3;
      if (tNorm === "grassy" && moveTypeLower === "grass") terrainMod = 1.3;
      if (tNorm === "psychic" && moveTypeLower === "psychic") terrainMod = 1.3;
      if (tNorm === "misty" && moveTypeLower === "dragon") terrainMod = 0.5;
      if (tNorm === "grassy" && moveTypeLower === "ground") terrainMod = 0.5;

      let itemMod = 1;
      const itemLower = (attackerInput.item || "")
        .toLowerCase()
        .replace(/-/g, " ")
        .replace(/_/g, " ");
      if (
        (itemLower.includes("choice band") ||
          itemLower.includes("cinta elegida")) &&
        isPhysical
      )
        itemMod = 1.5;
      if (
        (itemLower.includes("choice specs") ||
          itemLower.includes("gafas elegidas")) &&
        !isPhysical
      )
        itemMod = 1.5;
      if (itemLower.includes("life orb") || itemLower.includes("vidasfera"))
        itemMod = 1.3;
      if (
        itemLower.includes("expert belt") ||
        itemLower.includes("cinta experta") ||
        itemLower.includes("cinta experto")
      ) {
        if (effectiveness > 1) itemMod = 1.2;
      }
      if (
        itemLower.includes("muscle band") ||
        itemLower.includes("cinta fuerte")
      ) {
        if (isPhysical) itemMod = 1.1;
      }
      if (
        itemLower.includes("wise glasses") ||
        itemLower.includes("gafas sabias")
      ) {
        if (!isPhysical) itemMod = 1.1;
      }

      let critMod = 1;
      if (attackerInput.isCriticalHit) critMod = generation >= 6 ? 1.5 : 2;

      const totalMod =
        stab *
        effectiveness *
        burnMod *
        weatherMod *
        terrainMod *
        itemMod *
        critMod;

      const rolls: number[] = [];
      for (let i = 85; i <= 100; i++) {
        rolls.push(Math.floor((base * totalMod * i) / 100));
      }
      const minDamage = rolls[0] ?? 0;
      const maxDamage = rolls[15] ?? rolls[rolls.length - 1] ?? 0;
      const defenderHp = defenderStats.hp;
      const minPercent = defenderHp > 0 ? (minDamage / defenderHp) * 100 : 0;
      const maxPercent = defenderHp > 0 ? (maxDamage / defenderHp) * 100 : 0;

      const isGuaranteed = minPercent >= 100;
      const isPossible = !isGuaranteed && maxPercent >= 100;
      let hitsToKO = 1;
      if (!isGuaranteed && !isPossible) {
        const safeMax = maxPercent > 0 ? maxPercent : 1;
        hitsToKO = Math.ceil(100 / safeMax);
        if (hitsToKO < 1) hitsToKO = 1;
        if (hitsToKO > 10) hitsToKO = 10;
      }
      const koRolls = rolls.filter((r) => r >= defenderHp).length;
      const probability = (koRolls / 16) * 100;

      const result = {
        damage: { minDamage, maxDamage, minPercent, maxPercent, rolls },
        defenderMaxHp: defenderHp,
        attackerMaxHp: attackerStats.hp,
        defenderStats,
        attackerStats,
        koAnalysis: { guaranteed: isGuaranteed, hitsToKO, probability },
        effectiveness,
        attackerInput,
        defenderInput,
      } as unknown as BattleResult;

      if (signal.aborted || requestId !== latestRequestId) return;
      set({
        result: result as BattleResult,
        isCalculating: false,
        hasCalculatedOnce: true,
        autoCalculate: true,
      });
    } catch (err: unknown) {
      if (signal.aborted || requestId !== latestRequestId) return;
      if ((err as Error).name === "AbortError") return;
      const raw = err instanceof Error ? err.message : String(err);
      const lower = raw.toLowerCase();
      let friendly: string;
      if (
        raw.includes("FORM_NOT_AVAILABLE") ||
        lower.includes("not available in gen") ||
        lower.includes("is not available")
      ) {
        friendly =
          "El Pokémon o la forma seleccionada no está disponible en la generación elegida.";
      } else if (
        lower.includes("invalid generation") ||
        (lower.includes("unsupported") && lower.includes("generation"))
      ) {
        friendly =
          "La generación seleccionada no es compatible con los datos actuales.";
      } else if (raw.trim().length === 0) {
        friendly =
          "Ocurrió un error al calcular el daño. Intenta cambiar de generación o de forma.";
      } else {
        friendly = raw;
      }
      set({ error: friendly, result: null, isCalculating: false });
    }
  },

  calculateResult: async () => {
    return get().calculate();
  },
}));
