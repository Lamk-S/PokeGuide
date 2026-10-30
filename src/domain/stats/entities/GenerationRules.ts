import type { StatName } from "@/domain/pokemon/types/pokemon";
import type { Nature } from "../types/StatTypes";
import type { EV } from "../value-objects/EV";
import type { IV } from "../value-objects/IV";
import type { Level } from "../value-objects/Level";

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
