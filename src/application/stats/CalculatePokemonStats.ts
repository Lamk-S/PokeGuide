import { calculateStats } from "@/domain/stats/services/StatCalculator";
import type {
  StatCalculationInput,
  CalculatedStats,
} from "@/domain/stats/types/StatTypes";

export class CalculatePokemonStats {
  execute(input: StatCalculationInput): CalculatedStats {
    // Orquestación: aquí podría registrarse métricas, telemetría o cachés futuros
    return calculateStats(input);
  }
}
