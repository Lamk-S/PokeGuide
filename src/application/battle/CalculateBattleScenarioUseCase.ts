import type {
  IPokemonBaseProvider,
  IBattleParticipantInput,
  IBattleConditions,
  IResolvedBattleScenario,
  IResolvedParticipant,
  BattleResult,
} from "@/domain/battle/types/BattleParticipant";
import type { BattleCalculator } from "@/domain/battle/repositories/BattleCalculator";
import { normalizeId } from "@/domain/shared/utils/normalizeId";

export class CalculateBattleScenarioUseCase {
  constructor(
    private readonly baseProvider: IPokemonBaseProvider,
    private readonly calculator: BattleCalculator,
  ) {}

  async execute(
    generation: number,
    attackerInput: IBattleParticipantInput,
    defenderInput: IBattleParticipantInput,
    moveName: string,
    conditions: IBattleConditions = { weather: "none", terrain: "none" },
  ): Promise<BattleResult> {
    const attackerBase = await this.baseProvider.getBaseDataById(
      attackerInput.pokemonId,
    );
    const defenderBase = await this.baseProvider.getBaseDataById(
      defenderInput.pokemonId,
    );

    if (!attackerBase)
      throw new Error(`Pokemon ${attackerInput.pokemonId} not found`);
    if (!defenderBase)
      throw new Error(`Pokemon ${defenderInput.pokemonId} not found`);

    const attacker: IResolvedParticipant = {
      ...attackerInput,
      id: attackerBase.id,
      name: attackerBase.name,
      baseStats: attackerBase.baseStats,
    };

    const defender: IResolvedParticipant = {
      ...defenderInput,
      id: defenderBase.id,
      name: defenderBase.name,
      baseStats: defenderBase.baseStats,
    };

    const scenario: IResolvedBattleScenario = {
      generation,
      attacker,
      defender,
      moveName,
      moveId: normalizeId(moveName),
      conditions,
    };

    return this.calculator.calculate(scenario);
  }
}
