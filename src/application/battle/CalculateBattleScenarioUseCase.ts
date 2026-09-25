import type { PokemonRepository } from "@/domain/pokemon/repositories/pokemon-repository";
import type { BattleCalculator } from "@/domain/battle/repositories/BattleCalculator";
import type { BattleParticipantInput } from "@/features/battle/store/useBattleStore";
import type {
  BattleResult,
  BattleConditions,
  BattlePokemon,
} from "@/domain/battle/types/BattleTypes";
import { calculateStats } from "@/domain/stats/services/StatCalculator";

export class CalculateBattleScenarioUseCase {
  constructor(
    private readonly pokemonRepo: PokemonRepository,
    private readonly calculator: BattleCalculator,
  ) {}

  async execute(
    generation: number,
    attackerInput: BattleParticipantInput,
    defenderInput: BattleParticipantInput,
    moveName: string,
    conditions: BattleConditions = {},
  ): Promise<BattleResult> {
    const attackerEntity = await this.pokemonRepo.getById(
      attackerInput.pokemonId,
    );
    const defenderEntity = await this.pokemonRepo.getById(
      defenderInput.pokemonId,
    );
    if (!attackerEntity)
      throw new Error(
        `Pokémon atacante con ID ${attackerInput.pokemonId} no encontrado`,
      );
    if (!defenderEntity)
      throw new Error(
        `Pokémon defensor con ID ${defenderInput.pokemonId} no encontrado`,
      );

    const attackerCalculated = calculateStats({
      baseStats: attackerEntity.baseStats,
      level: attackerInput.level,
      nature: attackerInput.nature,
      ivs: attackerInput.ivs,
      evs: attackerInput.evs,
      generation,
    });
    const defenderCalculated = calculateStats({
      baseStats: defenderEntity.baseStats,
      level: defenderInput.level,
      nature: defenderInput.nature,
      ivs: defenderInput.ivs,
      evs: defenderInput.evs,
      generation,
    });

    const attacker: BattlePokemon = {
      id: attackerEntity.id,
      name: attackerEntity.name,
      level: attackerInput.level,
      nature: attackerInput.nature,
      evs: attackerInput.evs,
      ivs: attackerInput.ivs,
      calculatedStats: attackerCalculated,
      ...(attackerInput.ability ? { ability: attackerInput.ability } : {}),
      ...(attackerInput.item ? { item: attackerInput.item } : {}),
      ...(attackerInput.status ? { status: attackerInput.status } : {}),
    };

    const defender: BattlePokemon = {
      id: defenderEntity.id,
      name: defenderEntity.name,
      level: defenderInput.level,
      nature: defenderInput.nature,
      evs: defenderInput.evs,
      ivs: defenderInput.ivs,
      calculatedStats: defenderCalculated,
      ...(defenderInput.ability ? { ability: defenderInput.ability } : {}),
      ...(defenderInput.item ? { item: defenderInput.item } : {}),
      ...(defenderInput.status ? { status: defenderInput.status } : {}),
    };

    return this.calculator.calculate({
      generation,
      attacker,
      defender,
      moveName,
      conditions,
    });
  }
}
