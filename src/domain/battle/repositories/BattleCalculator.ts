import type {
  BattleResult,
  IResolvedBattleScenario,
} from "../types/BattleParticipant";

export interface BattleCalculator {
  calculate(
    scenario: IResolvedBattleScenario,
  ): BattleResult | Promise<BattleResult>;
}
