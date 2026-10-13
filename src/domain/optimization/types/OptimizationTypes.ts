export type OptimizationStatus =
  | "Optimal"
  | "Infeasible"
  | "Invalid"
  | "Unsupported";

export interface OptimizationResult<T> {
  status: OptimizationStatus;
  solution: T | null;
  explanation: {
    summary: string;
    evidence: string[];
  };
  metrics: {
    candidatesEvaluated: number;
  };
  cost?: number;
  steps?: unknown[];
}
