import type {
  OptimizationObjective,
  OptimizationConstraint,
} from "../types/OptimizationTypes";
import type { Nature } from "@/domain/stats/types/StatTypes";
import type { StatName } from "@/domain/pokemon/types/pokemon";

export class OptimizationProblem {
  constructor(
    public readonly objective: OptimizationObjective,
    public readonly constraints: OptimizationConstraint[],
    public readonly fixedContext: {
      baseStats: Record<StatName, number>;
      ivs: Record<StatName, number>;
      level: number;
      nature: Nature;
      generation: number;
    },
  ) {}
}
