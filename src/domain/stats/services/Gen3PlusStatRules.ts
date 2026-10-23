import type { GenerationRules } from "../entities/GenerationRules";
import type { Nature } from "../types/StatTypes";
import type { Level } from "../value-objects/Level";
import type { IV } from "../value-objects/IV";
import type { EV } from "../value-objects/EV";
import type { StatName } from "@/domain/pokemon/types/pokemon";

export class Gen3PlusStatRules implements GenerationRules {
  calculateHp(base: number, iv: IV, ev: EV, level: Level): number {
    if (base === 1) return 1; // Shedinja
    const ivNum = iv.value;
    const evNum = ev.value;
    const core = 2 * base + ivNum + Math.floor(evNum / 4);
    return Math.floor(0.01 * core * level.value) + level.value + 10;
  }

  calculateNonHpStat(
    statName: StatName,
    base: number,
    iv: IV,
    ev: EV,
    level: Level,
    nature: Nature,
  ): number {
    const ivNum = iv.value;
    const evNum = ev.value;
    const core = 2 * base + ivNum + Math.floor(evNum / 4);
    const preNatureStat = Math.floor(0.01 * core * level.value) + 5;
    return Math.floor(preNatureStat * this.getNatureModifier(statName, nature));
  }

  private getNatureModifier(statName: StatName, nature: Nature): number {
    if (nature.increasedStat === statName) return 1.1;
    if (nature.decreasedStat === statName) return 0.9;
    return 1.0;
  }
}
