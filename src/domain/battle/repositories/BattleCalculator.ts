import type {
  IResolvedBattleScenario,
  BattleResult,
} from "../types/BattleParticipant";

export interface BattleCalculator {
  calculate(
    scenario: IResolvedBattleScenario,
  ): BattleResult | Promise<BattleResult>;
}
