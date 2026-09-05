export type SupportLevel =
  | "FullySupported"
  | "PartiallySupported"
  | "NotSupported"
  | "NotApplicable"
  | "Unknown";
export type Availability = "Available" | "Unavailable" | "Modified" | "Unknown";
export type RuleCategory =
  | "Stats"
  | "Battle"
  | "Breeding"
  | "SpecialMechanics"
  | "Types";

export interface MechanicStatus {
  readonly id: string;
  readonly name: string;
  readonly category: RuleCategory;
  readonly availability: Availability;
  readonly supportLevel: SupportLevel;
  readonly description: string;
}

export interface BreedingRulesConfig {
  readonly maxInheritedIVs: number;
  readonly everstoneChance: 0.5 | 1.0;
  readonly hasDestinyKnot: boolean;
  readonly inheritableTraits: ReadonlyArray<string>; // TraitKey pero sin depender de breeding
}
