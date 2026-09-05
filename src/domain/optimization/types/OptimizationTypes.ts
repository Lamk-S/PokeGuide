export type ObjectiveDirection = "minimize" | "maximize" | "satisfy";
export type ConstraintOperator = "gte" | "lte" | "eq";

export interface OptimizationConstraint {
  variable: string; // ej. "speed", "damage_taken"
  operator: ConstraintOperator;
  target: number;
}

export interface OptimizationObjective {
  type: string; // ej. "ev_investment"
  direction: ObjectiveDirection;
}

export interface OptimizationExplanation {
  objective: string;
  constraintDescription: string;
  solutionDescription: string;
  evidence: string[]; // ej. ["163 EV → 299 Speed ❌", "164 EV → 301 Speed ✅"]
}

export interface OptimizationResult<T> {
  status: "Optimal" | "Feasible" | "NoSolution" | "Unsupported";
  solution: T | null; // El candidato óptimo (ej. Record<StatName, number> de EVs)
  explanation: OptimizationExplanation | null;
  metrics: {
    candidatesEvaluated: number;
    executionTimeMs: number;
  };
}
