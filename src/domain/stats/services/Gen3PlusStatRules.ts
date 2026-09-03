import type { GenerationRules } from "../entities/GenerationRules";
import type { Nature } from "../types/StatTypes";
import type { Level } from "../value-objects/Level";
import type { IV } from "../value-objects/IV";
import type { EV } from "../value-objects/EV";
import type { StatName } from "@/domain/pokemon/types/pokemon";

export class Gen3PlusStatRules implements GenerationRules {
  calculateHp(base: number, iv: IV, ev: EV, level: Level): number {
    // Excepción conocida en la mecánica: Shedinja (Base HP = 1) siempre tiene 1 HP.
    if (base === 1) return 1;

    // Fórmula: Math.floor(0.01 * (2 * Base + IV + Math.floor(EV / 4)) * Level) + Level + 10
    const core = 2 * base + iv.value + Math.floor(ev.value / 4);
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
    // Fórmula base: Math.floor(0.01 * (2 * Base + IV + Math.floor(EV / 4)) * Level) + 5
    const core = 2 * base + iv.value + Math.floor(ev.value / 4);
    const preNatureStat = Math.floor(0.01 * core * level.value) + 5;

    return Math.floor(preNatureStat * this.getNatureModifier(statName, nature));
  }

  private getNatureModifier(statName: StatName, nature: Nature): number {
    if (nature.increasedStat === statName) return 1.1;
    if (nature.decreasedStat === statName) return 0.9;
    return 1.0;
  }
}
