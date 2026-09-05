import type { BattleScenario } from "../entities/BattleScenario";
import type { BattleResult } from "../types/BattleTypes";

export interface BattleCalculator {
  calculate(scenario: BattleScenario): BattleResult;
}
