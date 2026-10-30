import type { BuildComparison, StatName } from "../types/OptimizationTypes";
import type { EVDistribution } from "../value-objects/EVDistribution";
export function compareEVDistributions(
  original: EVDistribution,
  optimized: EVDistribution,
): BuildComparison {
  const stats: StatName[] = [
    "hp",
    "attack",
    "defense",
    "special-attack",
    "special-defense",
    "speed",
  ];
  const diffs = stats
    .map((s) => ({
      stat: s,
      original: original.get(s),
      optimizado: optimized.get(s),
    }))
    .filter((d) => d.original !== d.optimizado);
  return {
    ahorro: original.total() - optimized.total(),
    libres: optimized.remaining(),
    diffs,
    originalTotal: original.total(),
    optimizedTotal: optimized.total(),
  };
}
export function compareBuilds(o: EVDistribution, opt: EVDistribution) {
  return compareEVDistributions(o, opt);
}
