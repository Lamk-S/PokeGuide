import type { BattleScenario } from "@/domain/battle/entities/BattleScenario";
import type { BattleResult } from "@/domain/battle/types/BattleTypes";

export interface BattleCalculator {
  calculate(scenario: BattleScenario): BattleResult;
}
