import {
  type OptimizeSpeedInput,
  type OptimizeSpeedOutput,
  optimizeSpeedUseCase,
} from "./OptimizeSpeedUseCase";

export async function OptimizeBuildUseCase(
  input: OptimizeSpeedInput,
): Promise<OptimizeSpeedOutput> {
  return optimizeSpeedUseCase.execute(input);
}

export type OptimizeBuildInput = OptimizeSpeedInput;
export type OptimizeBuildOutput = OptimizeSpeedOutput;
