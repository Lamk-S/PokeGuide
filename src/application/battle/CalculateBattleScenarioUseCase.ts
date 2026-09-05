import { calculateStats } from "@/domain/stats/services/StatCalculator";
import { BattleScenario } from "@/domain/battle/entities/BattleScenario";
import type { BattleCalculator } from "@/domain/battle/repositories/BattleCalculator";
import type { PokemonRepository } from "@/domain/pokemon/repositories/pokemon-repository";
import type {
  BattleResult,
  BattlePokemon,
} from "@/domain/battle/types/BattleTypes";
import type { Nature } from "@/domain/stats/types/StatTypes";
import type { StatName } from "@/domain/pokemon/types/pokemon";

interface BattleParticipantInput {
  pokemonId: number;
  level: number;
  nature: Nature;
  ability?: string;
  item?: string;
  ivs: Record<StatName, number>;
  evs: Record<StatName, number>;
}

export class CalculateBattleScenarioUseCase {
  constructor(
    private pokemonRepo: PokemonRepository,
    private battleCalculator: BattleCalculator,
  ) {}

  async execute(
    generation: number,
    attackerInput: BattleParticipantInput,
    defenderInput: BattleParticipantInput,
    moveName: string,
  ): Promise<BattleResult> {
    // 1. Obtener base stats desde repositorio
    const attackerBase = await this.pokemonRepo.getById(
      attackerInput.pokemonId,
    );
    const defenderBase = await this.pokemonRepo.getById(
      defenderInput.pokemonId,
    );

    if (!attackerBase || !defenderBase)
      throw new Error("Pokémon no encontrado en el dataset local.");

    // 2. Ejecutar Stat Engine llamando a la función calculateStats
    const attackerStats = calculateStats({
      baseStats: attackerBase.baseStats,
      ivs: attackerInput.ivs,
      evs: attackerInput.evs,
      level: attackerInput.level,
      nature: attackerInput.nature,
      generation,
    });

    const defenderStats = calculateStats({
      baseStats: defenderBase.baseStats,
      ivs: defenderInput.ivs,
      evs: defenderInput.evs,
      level: defenderInput.level,
      nature: defenderInput.nature,
      generation,
    });

    // 3. Ensamblar BattlePokemon
    const attacker: BattlePokemon = {
      ...attackerInput,
      name: attackerBase.name,
      calculatedStats: attackerStats,
    };
    const defender: BattlePokemon = {
      ...defenderInput,
      name: defenderBase.name,
      calculatedStats: defenderStats,
    };

    // 4. Crear Escenario y Calcular
    const scenario = new BattleScenario(
      generation,
      attacker,
      defender,
      moveName,
    );

    return this.battleCalculator.calculate(scenario);
  }
}
