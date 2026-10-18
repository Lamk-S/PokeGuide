import {
  OptimizeSpeedUseCase,
  type OptimizeSpeedInput,
} from "./OptimizeSpeedUseCase";

export async function OptimizeBuildUseCase(input: OptimizeSpeedInput) {
  return OptimizeSpeedUseCase(input);
}
