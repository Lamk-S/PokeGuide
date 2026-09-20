import type { BattlePokemon, BattleConditions } from "../types/BattleTypes";

export interface BattleScenario {
  generation: number;
  attacker: BattlePokemon;
  defender: BattlePokemon;
  moveName: string;
  conditions: BattleConditions;
}
