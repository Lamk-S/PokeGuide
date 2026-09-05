export type Stat =
  | "hp"
  | "attack"
  | "defense"
  | "specialAttack"
  | "specialDefense"
  | "speed";
export type Gender = "Male" | "Female" | "Genderless";
export type IVRequirement = "Exact_31" | "Exact_0" | "Any";
export type NatureRequirement = string | "Any";
export type TraitKey = `iv_${Stat}` | "nature" | "eggMove";

// --- Mapas Inmutables ---
export type IVMapRequirement = Readonly<Record<Stat, IVRequirement>>;
export type IVMap = Readonly<Record<Stat, number>>; // Valores 0-31

// --- Entidades del Dominio ---
export interface BreedingRequirements {
  readonly species: string;
  readonly generation: number; // 3-9
  readonly nature?: NatureRequirement;
  readonly ivs: IVMapRequirement;
  readonly eggMove?: string;
}

export interface BreedingParent {
  readonly species: string;
  readonly nature: string;
  readonly ivs: IVMap;
  readonly moves: ReadonlyArray<string>;
  readonly gender: Gender;
  readonly isEggMoveCarrier?: boolean;
}

export interface BreedingEvidence {
  readonly ruleId: string;
  readonly description: string;
  readonly generation: number;
  readonly requiredItem?: string | undefined;
}

export interface BreedingStep {
  readonly stepNumber: number;
  readonly parentA: BreedingParent;
  readonly parentB: BreedingParent;
  readonly childResult: BreedingParent;
  readonly inheritedProperties: ReadonlyArray<TraitKey>;
  readonly remainingRequirements: ReadonlyArray<TraitKey>;
  readonly evidence: BreedingEvidence;
  readonly cost: number;
}

export type BreedingPlanStatus =
  | "Optimal"
  | "Feasible"
  | "NoSolution"
  | "Unsupported";

export interface BreedingPlan {
  readonly status: BreedingPlanStatus;
  readonly target: BreedingRequirements;
  readonly steps: ReadonlyArray<BreedingStep>;
  readonly cost: number;
  readonly explanation: string;
}
