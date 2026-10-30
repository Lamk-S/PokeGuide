import type { StatName } from "../types/OptimizationTypes";
import type { EVDistribution } from "../value-objects/EVDistribution";

export type Nature = {
  readonly name: string;
  readonly nameEs: string;
  readonly increasedStat: StatName | null;
  readonly decreasedStat: StatName | null;
};
export type BuildContext = {
  readonly generacion: number;
  readonly formato: string;
  readonly nivel: number;
};
export type FixedParams = {
  readonly naturaleza: Nature;
  readonly ivs: Record<StatName, number>;
  readonly movimientos: string[];
  readonly habilidad?: string;
  readonly objeto?: string;
};
export type BuildConfiguration = {
  readonly pokemonId: number;
  readonly contexto: BuildContext;
  readonly fijos: FixedParams;
  readonly evsActuales: EVDistribution;
  readonly optimizables: { readonly stats: StatName[] };
};
export function validateBuildContext(ctx: BuildContext) {
  if (
    !Number.isInteger(ctx.generacion) ||
    ctx.generacion < 1 ||
    ctx.generacion > 9
  )
    throw new Error(`Generación inválida: ${ctx.generacion}`);
  if (!Number.isInteger(ctx.nivel) || ctx.nivel < 1 || ctx.nivel > 100)
    throw new Error(`Nivel inválido: ${ctx.nivel}`);
}
export function validateIVs(ivs: Record<string, number>) {
  const stats: StatName[] = [
    "hp",
    "attack",
    "defense",
    "special-attack",
    "special-defense",
    "speed",
  ];
  for (const s of stats) {
    const v = ivs[s];
    if (v === undefined) throw new Error(`IV faltante: ${s}`);
    if (!Number.isInteger(v) || v < 0 || v > 31)
      throw new Error(`IV ${s} inválido: ${v}`);
  }
}
