import type { StatCalculationInput, CalculatedStats } from "../types/StatTypes";
import { Level } from "../value-objects/Level";
import { IV } from "../value-objects/IV";
import { EV } from "../value-objects/EV";
import { Gen3PlusStatRules } from "./Gen3PlusStatRules";
import type { StatName } from "@/domain/pokemon/types/pokemon";

export function calculateStats(input: StatCalculationInput): CalculatedStats {
  // 1. Validación estricta a través de Value Objects
  const level = Level.create(input.level);
  const ivs = IV.createSet(input.ivs);
  const evs = EV.createSet(input.evs);

  // 2. Resolución de reglas (Extensible a futuro para Gen 1/2)
  // Actualmente Gen 3 a 9 usan las mismas reglas matemáticas base.
  const rules =
    input.generation >= 3 ? new Gen3PlusStatRules() : new Gen3PlusStatRules();

  const stats: Partial<CalculatedStats> = {};
  const statNames: StatName[] = [
    "hp",
    "attack",
    "defense",
    "special-attack",
    "special-defense",
    "speed",
  ];

  for (const stat of statNames) {
    if (stat === "hp") {
      stats[stat] = rules.calculateHp(
        input.baseStats[stat],
        ivs[stat],
        evs[stat],
        level,
      );
    } else {
      stats[stat] = rules.calculateNonHpStat(
        stat,
        input.baseStats[stat],
        ivs[stat],
        evs[stat],
        level,
        input.nature,
      );
    }
  }

  return stats as CalculatedStats;
}
