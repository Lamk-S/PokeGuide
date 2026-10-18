export type SpeedObjective = {
  readonly type: "speed";
  readonly target: number;
  readonly stat: "speed";
};
export type DamageObjective = {
  readonly type: "damage";
  readonly targetPercent: number;
  readonly offensiveStat: "attack" | "special-attack";
  readonly moveId: string;
  readonly defenderId: number;
  readonly defenderLevel?: number;
};
export type SurvivalObjective = {
  readonly type: "survival";
  readonly defenseStat: "defense" | "special-defense";
  readonly moveId: string;
  readonly attackerId: number;
  readonly attackerLevel?: number;
};
export type Objective = SpeedObjective | DamageObjective | SurvivalObjective;

export function validateObjective(obj: Objective) {
  if (obj.type === "speed") {
    if (!Number.isFinite(obj.target) || obj.target <= 0)
      throw new Error("Objetivo velocidad >0");
  } else if (obj.type === "damage") {
    if (!Number.isFinite(obj.targetPercent) || obj.targetPercent <= 0)
      throw new Error("Porcentaje inválido");
    if (!obj.moveId) throw new Error("moveId requerido");
    if (!obj.defenderId) throw new Error("defenderId requerido");
  } else if (obj.type === "survival") {
    if (!obj.moveId) throw new Error("moveId requerido");
    if (!obj.attackerId) throw new Error("attackerId requerido");
  }
}
export const isSpeedObjective = (o: Objective): o is SpeedObjective =>
  o.type === "speed";
export const isDamageObjective = (o: Objective): o is DamageObjective =>
  o.type === "damage";
export const isSurvivalObjective = (o: Objective): o is SurvivalObjective =>
  o.type === "survival";
