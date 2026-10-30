import { NATURES } from "@/domain/stats/constants/natures";
import type { Nature } from "@/domain/stats/types/StatTypes";
import type {
  DamageOptimizationPayload,
  DamageOptimizationResult,
  SpeedOptimizationPayload,
  SpeedOptimizationResult,
  SurvivalOptimizationPayload,
  SurvivalOptimizationResult,
} from "./optimization.types";

export interface WorkerOptimizeInput {
  pokemonId: number;
  level: number;
  buildConfiguration?: unknown;
  objective: unknown;
  currentEvs?: Record<string, number>;
  currentIvs?: Record<string, number>;
  baseStats?: Record<string, number>;
  natureId?: string;
  generation: number;
  moveId?: string;
  type?: "speed" | "damage" | "survival" | "build";
}

export interface WorkerOptimizeResult {
  status: "Optimal" | "Infeasible" | "Unsupported" | "Error";
  solution?: unknown;
  cost?: number;
  explanation?: {
    evidence: string[];
    summary?: string;
    proof?: unknown;
  };
}

function getNatureById(id?: string): Nature {
  if (!id) return NATURES.find((n) => n.name === "Serious") as Nature;
  const found = NATURES.find(
    (n) =>
      n.name.toLowerCase() === id.toLowerCase() ||
      n.name.toLowerCase() === id.replace("-", "").toLowerCase(),
  );
  return (found ?? NATURES.find((n) => n.name === "Serious")) as Nature;
}

export class OptimizationWorkerClient {
  private static _instance: OptimizationWorkerClient | null = null;
  private worker: Worker | null = null;

  private constructor() {
    if (typeof window !== "undefined" && typeof Worker !== "undefined") {
      try {
        this.worker = new Worker(
          new URL("./optimization.worker.ts", import.meta.url),
        );
      } catch {
        this.worker = null;
      }
    }
  }

  static getInstance(): OptimizationWorkerClient {
    if (!OptimizationWorkerClient._instance) {
      OptimizationWorkerClient._instance = new OptimizationWorkerClient();
    }
    return OptimizationWorkerClient._instance;
  }

  async optimizeSpeed(
    input: SpeedOptimizationPayload,
  ): Promise<SpeedOptimizationResult> {
    const result = await this.executeInternal({
      ...input,
      type: "speed",
    } as unknown as WorkerOptimizeInput);
    return result as unknown as SpeedOptimizationResult;
  }

  async optimizeDamage(
    input: DamageOptimizationPayload,
  ): Promise<DamageOptimizationResult> {
    const result = await this.executeInternal({
      ...input,
      type: "damage",
    } as unknown as WorkerOptimizeInput);
    return result as unknown as DamageOptimizationResult;
  }

  async optimizeSurvival(
    input: SurvivalOptimizationPayload,
  ): Promise<SurvivalOptimizationResult> {
    const result = await this.executeInternal({
      ...input,
      type: "survival",
    } as unknown as WorkerOptimizeInput);
    return result as unknown as SurvivalOptimizationResult;
  }

  async run(input: WorkerOptimizeInput): Promise<WorkerOptimizeResult> {
    return this.executeInternal(input);
  }

  async execute(input: WorkerOptimizeInput): Promise<WorkerOptimizeResult> {
    return this.executeInternal(input);
  }

  async optimize(input: WorkerOptimizeInput): Promise<WorkerOptimizeResult> {
    return this.executeInternal(input);
  }

  private async executeInternal(
    input: WorkerOptimizeInput,
  ): Promise<WorkerOptimizeResult> {
    if (!this.worker) {
      try {
        const { SpeedOptimizer } = await import(
          "@/domain/optimization/services/SpeedOptimizer"
        );
        const { OptimizationProblem } = await import(
          "@/domain/optimization/entities/OptimizationProblem"
        );

        const nature = getNatureById((input as { natureId?: string }).natureId);

        const context = {
          baseStats: (input as { baseStats?: Record<string, number> })
            .baseStats ?? {
            hp: 100,
            attack: 100,
            defense: 100,
            "special-attack": 100,
            "special-defense": 100,
            speed: 100,
          },
          ivs: (input as { currentIvs?: Record<string, number> })
            .currentIvs ?? {
            hp: 31,
            attack: 31,
            defense: 31,
            "special-attack": 31,
            "special-defense": 31,
            speed: 31,
          },
          level: input.level ?? 50,
          generation: input.generation ?? 9,
          currentEVs: input.currentEvs ?? {},
          nature,
        };

        const problem = new OptimizationProblem(
          { type: "ev_investment", direction: "minimize" },
          [{ variable: "speed", operator: "gte", target: 100 }],
          context as never,
        );

        const result = SpeedOptimizer.optimize(problem as never);
        return {
          status: result.status as WorkerOptimizeResult["status"],
          solution: (result as { solution?: unknown }).solution,
          cost: (result as { cost?: number }).cost,
          explanation:
            result.explanation as WorkerOptimizeResult["explanation"],
        };
      } catch (e) {
        return {
          status: "Error",
          explanation: {
            evidence: [(e as Error).message],
            summary: "Fallback error",
          },
        };
      }
    }

    return new Promise<WorkerOptimizeResult>((resolve, reject) => {
      const worker = this.worker as Worker;
      const timeout = setTimeout(
        () => reject(new Error("Worker timeout")),
        15000,
      );

      const handleMessage = (event: MessageEvent<WorkerOptimizeResult>) => {
        clearTimeout(timeout);
        worker.removeEventListener("message", handleMessage);
        resolve(event.data);
      };

      const handleError = (event: ErrorEvent) => {
        clearTimeout(timeout);
        worker.removeEventListener("message", handleMessage);
        reject(new Error(event.message));
      };

      worker.addEventListener("message", handleMessage);
      worker.addEventListener("error", handleError, { once: true });
      worker.postMessage(input);
    });
  }

  terminate() {
    this.worker?.terminate();
    this.worker = null;
  }
}
