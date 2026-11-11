export const BATTLE_GENERATION = 9 as const;
export type BattleGeneration = typeof BATTLE_GENERATION;

export type BattleFormat = "singles-6v6" | "vgc-regulation" | "smogon-ou";

export interface SpeedThresholds {
  readonly minimumViable: number;
  readonly scarfMultiplier: number;
  readonly fastBase: number;
}

export interface DefensiveThresholds {
  readonly criticalWeakCount: number;
  readonly maxDefendersForCritical: number;
  readonly singlePointOfFailureWeak: number;
}

export interface BattleRuleset {
  readonly id?: string;
  readonly name?: string;
  readonly generation: BattleGeneration;
  readonly format: BattleFormat;
  readonly formatLabelEs: string;
  readonly generationLabelEs: string;
  readonly level: number;
  readonly maxMembers: number;
  readonly speed: SpeedThresholds;
  readonly defensive: DefensiveThresholds;
  readonly speciesClause?: boolean;
  readonly itemClause?: boolean;
  readonly allowItemClause?: boolean;
}

export const DEFAULT_BATTLE_RULESET: BattleRuleset = Object.freeze({
  id: "singles-6v6",
  name: "Singles 6v6",
  generation: BATTLE_GENERATION,
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
  speciesClause: true,
  itemClause: false,
} as BattleRuleset);

export const VGC_RULESET: BattleRuleset = Object.freeze({
  ...DEFAULT_BATTLE_RULESET,
  id: "vgc-regulation",
  name: "VGC Regulation",
  format: "vgc-regulation",
  formatLabelEs: "VGC Regulación",
  level: 50,
  speed: {
    minimumViable: 140,
    scarfMultiplier: 1.5,
    fastBase: 100,
  },
  defensive: {
    criticalWeakCount: 4,
    maxDefendersForCritical: 1,
    singlePointOfFailureWeak: 2,
  },
  speciesClause: true,
  itemClause: true,
  allowItemClause: true,
} as BattleRuleset);

type LooseRecord = Record<string, unknown>;
function getStringField(r: LooseRecord, k: string): string | undefined {
  const v = r[k];
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

export function getRulesetDisplayName(ruleset: BattleRuleset): string {
  const r = ruleset as unknown as LooseRecord;
  return (
    getStringField(r, "name") ??
    getStringField(r, "formatLabelEs") ??
    getStringField(r, "format") ??
    getStringField(r, "id") ??
    "OU"
  );
}

export function isVgcRuleset(ruleset: BattleRuleset): boolean {
  const display = getRulesetDisplayName(ruleset).toLowerCase();
  const r = ruleset as unknown as LooseRecord;
  const id = getStringField(r, "id")?.toLowerCase() ?? "";
  const format = getStringField(r, "format")?.toLowerCase() ?? "";
  const allowItemClause = r.allowItemClause;
  return (
    display.includes("vgc") ||
    id.includes("vgc") ||
    format.includes("vgc") ||
    allowItemClause === true
  );
}

export function getScarfMultiplier(ruleset: BattleRuleset): number {
  return ruleset.speed.scarfMultiplier ?? 1.5;
}
