import type { PokemonType } from "@/domain/pokemon/types/pokemon";
import type { Nature } from "@/domain/stats/types/StatTypes";

export type EVSet = {
  readonly hp: number;
  readonly attack: number;
  readonly defense: number;
  readonly "special-attack": number;
  readonly "special-defense": number;
  readonly speed: number;
};

export type IVSet = EVSet;
export type BaseStats = EVSet;

export interface CalculatedStats {
  readonly hp: number;
  readonly attack: number;
  readonly defense: number;
  readonly specialAttack: number;
  readonly specialDefense: number;
  readonly speed: number;
  readonly spAttack?: number;
  readonly spDefense?: number;
}

export interface ResolvedMove {
  readonly id: string;
  readonly name: string;
  readonly nameEs: string;
  readonly type: PokemonType;
  readonly power: number | null;
  readonly accuracy: number | null;
  readonly category: "physical" | "special" | "status";
  readonly priority?: number;
  readonly pp?: number;
  readonly effect?: string;
  readonly shortEffect?: string;
  readonly isInvalid?: boolean;
}

export interface TeamMember {
  readonly id: string;
  readonly pokemonId: number;
  readonly name: string;
  readonly displayNameEs?: string;
  readonly species?: string;
  readonly types: readonly PokemonType[];
  readonly abilityId: string | null;
  readonly itemId: string | null;
  readonly ability: string | null;
  readonly item: string | null;
  readonly nature: Nature;
  readonly level: number;
  readonly evs: EVSet;
  readonly ivs: IVSet;
  readonly calculatedStats: CalculatedStats;
  readonly baseStats: BaseStats;
  readonly moves: readonly ResolvedMove[];
  readonly isCustom?: boolean;
  readonly teraType?: PokemonType;
  readonly isTeraActive?: boolean;
}

export interface TeamMemberInput extends TeamMember {
  readonly id: string;
  readonly pokemonId: number;
  readonly name: string;
  readonly types: readonly PokemonType[];
  readonly level: number;
  readonly moves: readonly ResolvedMove[];
  readonly teraType?: PokemonType;
  readonly isTeraActive?: boolean;
}

export type TypeExposure = {
  readonly weak: number;
  readonly resist: number;
  readonly immune: number;
  readonly neutral: number;
};

export type DefensiveCoverage = Record<string, TypeExposure> &
  Partial<Record<PokemonType, TypeExposure>>;

export interface SafeSwitchIns {
  readonly type: PokemonType;
  readonly count: number;
  readonly members: readonly string[];
  readonly isSafe: boolean;
}

export interface DefensiveReport {
  readonly coverage: DefensiveCoverage;
  readonly safeSwitchIns: readonly SafeSwitchIns[];
  readonly criticalWeaknesses: readonly PokemonType[];
  readonly mitigatedWeaknesses: readonly {
    type: PokemonType;
    originalWeak: number;
    mitigatedWeak: number;
    mitigationSources: string[];
  }[];
}

export interface OffensiveCoverage {
  readonly type: PokemonType;
  readonly superEffectiveHits: number;
  readonly membersCovering: readonly string[];
  readonly isCovered: boolean;
}

export interface OffensiveReport {
  readonly coverage: readonly OffensiveCoverage[];
  readonly uncoveredTypes: readonly PokemonType[];
  readonly totalCovered: number;
  readonly coveragePercent: number;
  readonly physicalMoves: number;
  readonly specialMoves: number;
  readonly hasPhysicalAttacker: boolean;
  readonly hasSpecialAttacker: boolean;
  readonly isBalanced: boolean;
  readonly stallVulnerability: boolean;
  readonly wallbreakerPresent: boolean;
  readonly teraStabTypes?: readonly PokemonType[];
}

export interface SpeedControlReport {
  readonly hasTailwind: boolean;
  readonly hasTrickRoom: boolean;
  readonly hasStickyWeb: boolean;
  readonly hasThunderWave: boolean;
  readonly hasIcyWind: boolean;
  readonly hasPriority: boolean;
  readonly hasChoiceScarf: boolean;
  readonly hasBoosterEnergy: boolean;
  readonly controlMethods: readonly string[];
  readonly isSpeedControlPresent: boolean;
  readonly conflict: boolean;
}

export interface HazardControlReport {
  readonly hasStealthRock: boolean;
  readonly hasSpikes: boolean;
  readonly hasToxicSpikes: boolean;
  readonly hasDefog: boolean;
  readonly hasRapidSpin: boolean;
  readonly hasCourtChange: boolean;
  readonly hasHeavyDutyBoots: number;
  readonly setters: readonly string[];
  readonly removers: readonly string[];
  readonly isHazardControlPresent: boolean;
  readonly isRemovalPresent: boolean;
}

export interface UtilityReport {
  readonly speedControl: SpeedControlReport;
  readonly hazardControl: HazardControlReport;
  readonly hasPivot: boolean;
  readonly pivotMembers: readonly string[];
  readonly hasKnockOff: boolean;
  readonly hasTaunt: boolean;
}

export type CompetitiveRole =
  | "sweeper"
  | "wallbreaker"
  | "tank"
  | "wall"
  | "pivot"
  | "revenge_killer"
  | "hazard_setter"
  | "hazard_remover"
  | "speed_controller"
  | "cleric"
  | "support"
  | "stallbreaker"
  | "unclassified";

export interface RoleAssignment {
  readonly memberId: string;
  readonly roles: readonly CompetitiveRole[];
  readonly primaryRole: CompetitiveRole;
  readonly reasoning: readonly string[];
}

export interface RoleReport {
  readonly assignments: readonly RoleAssignment[];
  readonly roleCounts: Record<CompetitiveRole, number>;
  readonly hasBalancedRoles: boolean;
  readonly missingRoles: readonly CompetitiveRole[];
  readonly redundantRoles: readonly CompetitiveRole[];
}

export type LegalityIssueCode =
  | "species_clause"
  | "item_clause"
  | "ability_illegal"
  | "move_illegal"
  | "ev_overflow"
  | "level_illegal";

export interface LegalityIssue {
  readonly code: LegalityIssueCode;
  readonly message: string;
  readonly membersInvolved: readonly string[];
  readonly severity: "Critical" | "High" | "Medium" | "Low" | "Info";
}

export interface LegalityReport {
  readonly isLegal: boolean;
  readonly issues: readonly LegalityIssue[];
  readonly format: string;
}

export type Severity = "Critical" | "High" | "Medium" | "Low" | "Info";

export type RecommendationIssueCode =
  | LegalityIssueCode
  | "massive_weakness"
  | "single_point_failure"
  | "redundant_weakness"
  | "speed_control_gap"
  | "offensive_coverage_gap"
  | "stall_vulnerability"
  | "hazard_control_missing"
  | "hazard_removal_missing"
  | "speed_control_missing"
  | "trick_room_conflict"
  | "redundant_roles"
  | "redundant_items"
  | "redundant_abilities"
  | "redundant_moves"
  | "no_physical_attacker"
  | "no_special_attacker"
  | "pivot_missing"
  | "illegal_team"
  | "balance_issue"
  | "wallbreaker_missing"
  | "priority_missing"
  | "safe_switch_missing"
  | "sweeper_missing";

export type RecommendationCategory =
  | "defensive_gap"
  | "dependency"
  | "speed"
  | "offensive_gap"
  | "utility"
  | "synergy"
  | "legality"
  | "balance"
  | "coverage"
  | "redundancy";

export interface TeamRecommendationEvidence extends TypeExposure {}

export interface TeamRecommendation {
  readonly id: string;
  readonly severity: Severity;
  readonly issueCode: RecommendationIssueCode;
  readonly category: RecommendationCategory;
  readonly attackingType: PokemonType;
  readonly targetType: PokemonType;
  readonly evidence: TeamRecommendationEvidence;
}

export interface ActionableRecommendation {
  readonly id: string;
  readonly severity: Severity;
  readonly category: RecommendationCategory;
  readonly issueCode: RecommendationIssueCode;
  readonly problemDescription: string;
  readonly evidence: readonly string[];
  readonly actionableAdvice: string;
  readonly attackingType?: PokemonType;
  readonly targetType?: PokemonType;
  readonly relatedMemberIds?: readonly string[];
  readonly priorityScore: number;
  readonly weak?: number;
  readonly resist?: number;
  readonly immune?: number;
  readonly neutral?: number;
}

export interface TeamAnalysis {
  readonly defensiveCoverage: DefensiveCoverage;
  readonly defensiveReport: DefensiveReport;
  readonly offensiveReport: OffensiveReport;
  readonly utilityReport: UtilityReport;
  readonly roleReport: RoleReport;
  readonly legalityReport: LegalityReport;
  readonly recommendations: readonly ActionableRecommendation[];
  readonly averageSpeed: number;
  readonly maxSpeed: number;
  readonly effectiveMaxSpeed: number;
  readonly teamSize: number;
  readonly isLegal: boolean;
  readonly generatedAt: number;
  readonly analysisVersion?: number;
}
