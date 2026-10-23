import { Level } from "../value-objects/Level";
import { IV } from "../value-objects/IV";
import {
  EVDistribution,
  normalizeEVSet,
  STAT_NAMES,
} from "../value-objects/EV";
import type { StatName } from "../value-objects/EV";

export type BaseStats = Record<StatName, number>;
export type IVSetInput = Partial<Record<StatName, number | IV>>;
export type EVSetInput = Partial<Record<StatName, number>> | EVDistribution;
export interface Nature {
  name: string;
  nameEs?: string;
  increasedStat: StatName | null;
  decreasedStat: StatName | null;
}

function resolveIVs(input: IVSetInput): Record<StatName, number> {
  const out = {} as Record<StatName, number>;
  for (const stat of STAT_NAMES) {
    const raw = (input as Record<string, unknown>)[stat];
    if (raw instanceof IV) out[stat] = raw.value;
    else if (
      raw &&
      typeof raw === "object" &&
      "value" in (raw as Record<string, unknown>)
    ) {
      out[stat] = IV.create((raw as { value: number }).value).value;
    } else out[stat] = IV.create((raw as number) ?? 31).value;
  }
  return out;
}

function resolveEVs(input: EVSetInput): Record<StatName, number> {
  if (input instanceof EVDistribution) return normalizeEVSet(input.getAll());
  return normalizeEVSet(input as Record<StatName, number>);
}

function resolveLevel(level: number | Level): number {
  return level instanceof Level ? level.value : Level.create(level).value;
}

function getNatureMultiplier(nature: Nature, stat: StatName): number {
  if (stat === "hp") return 1;
  if (nature.increasedStat === stat) return 1.1;
  if (nature.decreasedStat === stat) return 0.9;
  return 1;
}

export function calculateStats(params: {
  baseStats: BaseStats;
  level: number | Level;
  nature: Nature;
  ivs: IVSetInput;
  evs: EVSetInput;
  generation: number;
}): Record<StatName, number> {
  if (params.generation < 3)
    throw new Error(`Solo Gen3+ soportado, gen ${params.generation}`);
  const level = resolveLevel(params.level);
  const ivs = resolveIVs(params.ivs);
  const evs = resolveEVs(params.evs);
  const result = {} as Record<StatName, number>;
  for (const stat of STAT_NAMES) {
    const base = params.baseStats[stat] ?? 0;
    if (stat === "hp" && base === 1) {
      result[stat] = 1;
      continue;
    }
    const ev4 = Math.floor(evs[stat] / 4);
    if (stat === "hp") {
      result[stat] =
        Math.floor(((2 * base + ivs[stat] + ev4) * level) / 100) + level + 10;
    } else {
      const pre = Math.floor(((2 * base + ivs[stat] + ev4) * level) / 100) + 5;
      result[stat] = Math.floor(pre * getNatureMultiplier(params.nature, stat));
    }
  }
  return result;
}

export function calculateStat(
  stat: StatName,
  base: number,
  level: number | Level,
  nature: Nature,
  iv: number | IV,
  ev: number,
  generation: number,
): number {
  const baseStats = {
    hp: 0,
    attack: 0,
    defense: 0,
    "special-attack": 0,
    "special-defense": 0,
    speed: 0,
    [stat]: base,
  } as BaseStats;
  const ivs = {
    hp: 31,
    attack: 31,
    defense: 31,
    "special-attack": 31,
    "special-defense": 31,
    speed: 31,
    [stat]: iv instanceof IV ? iv.value : iv,
  } as Record<StatName, number>;
  const evs = {
    hp: 0,
    attack: 0,
    defense: 0,
    "special-attack": 0,
    "special-defense": 0,
    speed: 0,
    [stat]: ev,
  } as Record<StatName, number>;
  return calculateStats({ baseStats, level, nature, ivs, evs, generation })[
    stat
  ];
}

export { normalizeEVSet };
