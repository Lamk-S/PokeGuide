export type BattleGeneration = 9;
export type BattleFormat = "singles-6v6" | "vgc-regulation" | "smogon-ou";

export interface SpeedThresholds {
  readonly minimumViable: number;
  readonly scarfMultiplier: number;
  readonly fastBase: number;
}

export interface BattleRuleset {
  readonly generation: BattleGeneration;
  readonly format: BattleFormat;
  readonly formatLabelEs: string;
  readonly generationLabelEs: string;
  readonly level: number;
  readonly maxMembers: number;
  readonly speed: SpeedThresholds;
  readonly defensive: {
    readonly criticalWeakCount: number;
    readonly maxDefendersForCritical: number;
    readonly singlePointOfFailureWeak: number;
  };
}

export const DEFAULT_BATTLE_RULESET: BattleRuleset = Object.freeze({
  generation: 9,
  format: "singles-6v6",
  formatLabelEs: "Individual 6c6",
  generationLabelEs: "Gen 9 · Escarlata / Violeta",
  level: 50,
  maxMembers: 6,
  speed: {
    minimumViable: 150,
    scarfMultiplier: 1.5,
    fastBase: 110,
  },
  defensive: {
    criticalWeakCount: 3,
    maxDefendersForCritical: 1,
    singlePointOfFailureWeak: 2,
  },
});

export const VGC_RULESET: BattleRuleset = Object.freeze({
  ...DEFAULT_BATTLE_RULESET,
  format: "vgc-regulation",
  formatLabelEs: "VGC Regulación",
  level: 50,
  speed: {
    minimumViable: 140,
    scarfMultiplier: 1.5,
    fastBase: 100,
  },
});
