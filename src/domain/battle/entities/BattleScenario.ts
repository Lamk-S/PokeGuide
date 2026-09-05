import type { BattlePokemon, BattleConditions } from "../types/BattleTypes";

export class BattleScenario {
  constructor(
    public readonly generation: number,
    public readonly attacker: BattlePokemon,
    public readonly defender: BattlePokemon,
    public readonly moveName: string,
    public readonly conditions: BattleConditions = {},
  ) {}
}
