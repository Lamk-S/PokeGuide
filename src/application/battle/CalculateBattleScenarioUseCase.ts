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
import { AbilityLegalityService } from "@/domain/abilities/services/AbilityLegalityService";

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
    private readonly pokemonRepository: PokemonRepository,
    private readonly battleCalculator: BattleCalculator,
  ) {}

  async execute(
    generation: number,
    attackerInput: BattleParticipantInput,
    defenderInput: BattleParticipantInput,
    moveName: string,
  ): Promise<BattleResult> {
    // 1. Obtener Base Stats y Learnsets desde el repositorio
    const attackerData = await this.pokemonRepository.getById(
      attackerInput.pokemonId,
    );
    const defenderData = await this.pokemonRepository.getById(
      defenderInput.pokemonId,
    );

    if (!attackerData || !defenderData) {
      throw new Error("Pokémon no encontrado en el repositorio.");
    }

    // 2. Pre-Flight Validation: Legalidad del Movimiento (Fail-Fast)
    const isMoveLegal = attackerData.moves.some(
      (m) => m.name === moveName && m.levelLearnedAt <= attackerInput.level,
    );
    if (!isMoveLegal) {
      throw new Error(
        `DomainError: El movimiento '${moveName}' no es legal para ${attackerData.name} a nivel ${attackerInput.level}.`,
      );
    }

    // 3. Pre-Flight Validation: Legalidad de Habilidades
    if (
      attackerInput.ability &&
      !AbilityLegalityService.isLegal(
        attackerInput.ability,
        attackerData,
        generation,
      )
    ) {
      throw new Error(
        `La habilidad '${attackerInput.ability}' no es legal para ${attackerData.name} en la Gen ${generation}.`,
      );
    }
    if (
      defenderInput.ability &&
      !AbilityLegalityService.isLegal(
        defenderInput.ability,
        defenderData,
        generation,
      )
    ) {
      throw new Error(
        `La habilidad '${defenderInput.ability}' no es legal para ${defenderData.name} en la Gen ${generation}.`,
      );
    }

    // 4. Ejecutar Stat Engine para calcular atributos reales en combate
    const attackerStats = calculateStats({
      baseStats: attackerData.baseStats,
      ivs: attackerInput.ivs,
      evs: attackerInput.evs,
      level: attackerInput.level,
      nature: attackerInput.nature,
      generation,
    });

    const defenderStats = calculateStats({
      baseStats: defenderData.baseStats,
      ivs: defenderInput.ivs,
      evs: defenderInput.evs,
      level: defenderInput.level,
      nature: defenderInput.nature,
      generation,
    });

    // 5. Ensamblar las Entidades del Dominio
    const attacker: BattlePokemon = {
      ...attackerInput,
      name: attackerData.name,
      calculatedStats: attackerStats,
    };
    const defender: BattlePokemon = {
      ...defenderInput,
      name: defenderData.name,
      calculatedStats: defenderStats,
    };

    const scenario = new BattleScenario(
      generation,
      attacker,
      defender,
      moveName,
      {}, // Aquí se podría inyectar { weather: "Rain", terrain: "Grassy" } en el futuro
    );

    // 6. Delegar el cálculo numérico final a la Infraestructura (Adapter)
    return this.battleCalculator.calculate(scenario);
  }
}
