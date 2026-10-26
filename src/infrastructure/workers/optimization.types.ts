export type OptimizationType = "SPEED" | "SURVIVAL" | "DAMAGE";
export type OptimizationStatus = "SUCCESS" | "ERROR";

export interface StatSetPayload {
  hp: number;
  attack: number;
  defense: number;
  "special-attack": number;
  "special-defense": number;
  speed: number;
}

export interface SpeedOptimizationPayload {
  baseStats: StatSetPayload;
  level: number;
  natureName: string;
  ivs: StatSetPayload;
  evsBudget: number;
  targetSpeed: number;
  opponentSpeed?: number;
  generation?: number;
}

export interface SurvivalOptimizationPayload {
  baseStats: StatSetPayload;
  level: number;
  natureName: string;
  ivs: StatSetPayload;
  evsBudget: number;
  generation: number;
  survivalTarget: {
    incomingMovePower: number;
    incomingMoveType: string;
    attackerLevel: number;
    attackerBaseStats: StatSetPayload;
    attackerNatureName: string;
    requiredSurvivalPercent: number;
    weather?: string;
    terrain?: string;
  };
}

export interface DamageOptimizationPayload {
  baseStats: StatSetPayload;
  level: number;
  natureName: string;
  ivs: StatSetPayload;
  evsBudget: number;
  generation: number;
  damageTarget: {
    defenderBaseStats: StatSetPayload;
    defenderLevel: number;
    defenderNatureName: string;
    movePower: number;
    moveType: string;
    moveCategory: "Physical" | "Special";
    requiredDamagePercent: number;
    weather?: string;
    terrain?: string;
  };
}

export interface SpeedOptimizationResult {
  evs: StatSetPayload;
  achievedSpeed: number;
  targetSpeed: number;
  isSuccessful: boolean;
  iterations: number;
}

export interface SurvivalOptimizationResult {
  evs: StatSetPayload;
  achievedSurvivalPercent: number;
  requiredPercent: number;
  isSuccessful: boolean;
  iterations: number;
}

export interface DamageOptimizationResult {
  evs: StatSetPayload;
  achievedDamagePercent: number;
  requiredPercent: number;
  isSuccessful: boolean;
  iterations: number;
}

export type OptimizationResult =
  | SpeedOptimizationResult
  | SurvivalOptimizationResult
  | DamageOptimizationResult;

export interface OptimizationWorkerRequestBase {
  id: string;
  type: OptimizationType;
}

export interface SpeedWorkerRequest extends OptimizationWorkerRequestBase {
  type: "SPEED";
  payload: SpeedOptimizationPayload;
}

export interface SurvivalWorkerRequest extends OptimizationWorkerRequestBase {
  type: "SURVIVAL";
  payload: SurvivalOptimizationPayload;
}

export interface DamageWorkerRequest extends OptimizationWorkerRequestBase {
  type: "DAMAGE";
  payload: DamageOptimizationPayload;
}

export type OptimizationWorkerRequest =
  | SpeedWorkerRequest
  | SurvivalWorkerRequest
  | DamageWorkerRequest;

export interface OptimizationWorkerResponseBase {
  id: string;
  type: OptimizationType;
  status: OptimizationStatus;
}

export interface SpeedSuccessResponse extends OptimizationWorkerResponseBase {
  type: "SPEED";
  status: "SUCCESS";
  data: SpeedOptimizationResult;
}

export interface SurvivalSuccessResponse
  extends OptimizationWorkerResponseBase {
  type: "SURVIVAL";
  status: "SUCCESS";
  data: SurvivalOptimizationResult;
}

export interface DamageSuccessResponse extends OptimizationWorkerResponseBase {
  type: "DAMAGE";
  status: "SUCCESS";
  data: DamageOptimizationResult;
}

export interface OptimizationErrorResponse
  extends OptimizationWorkerResponseBase {
  status: "ERROR";
  error: string;
}

export type OptimizationWorkerSuccessResponse =
  | SpeedSuccessResponse
  | SurvivalSuccessResponse
  | DamageSuccessResponse;

export type OptimizationWorkerResponse =
  | OptimizationWorkerSuccessResponse
  | OptimizationErrorResponse;
