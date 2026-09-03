import type { Nature } from "../types/StatTypes";
import type { Level } from "../value-objects/Level";
import type { IV } from "../value-objects/IV";
import type { EV } from "../value-objects/EV";
import type { StatName } from "@/domain/pokemon/types/pokemon";

export interface GenerationRules {
  calculateHp(base: number, iv: IV, ev: EV, level: Level): number;
  calculateNonHpStat(
    statName: StatName,
    base: number,
    iv: IV,
    ev: EV,
    level: Level,
    nature: Nature,
  ): number;
}
