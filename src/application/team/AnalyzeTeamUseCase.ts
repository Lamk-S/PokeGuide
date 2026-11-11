import { normalizeId } from "@/domain/shared/utils/normalizeId";
import {
  type BattleRuleset,
  DEFAULT_BATTLE_RULESET,
} from "@/domain/team/config/battleFormat";
import type { PokemonTeam } from "@/domain/team/entities/PokemonTeam";
import { DefensiveAnalyzer } from "@/domain/team/services/analyzers/DefensiveAnalyzer";
import { OffensiveAnalyzer } from "@/domain/team/services/analyzers/OffensiveAnalyzer";
import { RoleHeuristics } from "@/domain/team/services/analyzers/RoleHeuristics";
import { UtilityAndSpeedAnalyzer } from "@/domain/team/services/analyzers/UtilityAndSpeedAnalyzer";
import { RecommendationEngine } from "@/domain/team/services/RecommendationEngine";
import {
  type BattleFormatRules,
  TeamLegalityValidator,
} from "@/domain/team/services/TeamLegalityValidator";
import type { TeamAnalysis } from "@/domain/team/types/TeamTypes";

type LooseRecord = Record<string, unknown>;

function isRecord(value: unknown): value is LooseRecord {
  return typeof value === "object" && value !== null;
}

function getStringField(record: LooseRecord, key: string): string | undefined {
  const v = record[key];
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

function getDisplayName(ruleset: BattleRuleset): string {
  const r = ruleset as unknown as LooseRecord;
  return (
    getStringField(r, "name") ??
    getStringField(r, "format") ??
    getStringField(r, "id") ??
    "OU"
  );
}

function isVgcByName(ruleset: BattleRuleset): boolean {
  const name = getDisplayName(ruleset).toLowerCase();
  const r = ruleset as unknown as LooseRecord;
  const id = getStringField(r, "id")?.toLowerCase() ?? "";
  return name.includes("vgc") || id.includes("vgc");
}

function getScarfMultiplier(ruleset: BattleRuleset): number {
  const r = ruleset as unknown as LooseRecord;
  const speed = r.speed;
  if (isRecord(speed)) {
    const mult = speed.scarfMultiplier;
    if (typeof mult === "number") return mult;
  }
  const direct = r.scarfMultiplier;
  if (typeof direct === "number") return direct;
  return 1.5;
}

export class AnalyzeTeamUseCase {
  private readonly ruleset: BattleRuleset;
  private readonly formatRules: BattleFormatRules;

  constructor(
    ruleset: BattleRuleset = DEFAULT_BATTLE_RULESET,
    formatRules?: BattleFormatRules,
  ) {
    this.ruleset = ruleset;
    const displayName = getDisplayName(ruleset);
    const isVgc = isVgcByName(ruleset);
    this.formatRules = formatRules ?? {
      name: displayName,
      speciesClause: true,
      itemClause: isVgc,
      maxTeamSize: 6,
    };
  }

  execute(team: PokemonTeam): TeamAnalysis {
    if (!team) throw new Error("PokemonTeam requerido");
    if (team.isEmpty()) throw new Error("Equipo vacío");

    const members = team.getMembers();

    const legalityReport = TeamLegalityValidator.validate(
      team,
      this.formatRules,
    );
    const defensiveDetailed = DefensiveAnalyzer.analyzeDetailed(team);
    const offensiveReport = OffensiveAnalyzer.analyze(team);
    const utilityReport = UtilityAndSpeedAnalyzer.analyze(team);
    const roleReport = RoleHeuristics.analyze(team);

    const averageSpeed =
      members.length > 0
        ? members.reduce((sum, m) => sum + m.calculatedStats.speed, 0) /
          members.length
        : 0;

    const maxSpeed =
      members.length > 0
        ? Math.max(...members.map((m) => m.calculatedStats.speed))
        : 0;

    const scarfMultiplier = getScarfMultiplier(this.ruleset);

    const effectiveMaxSpeed =
      members.length > 0
        ? Math.max(
            ...members.map((m) => {
              const base = m.calculatedStats.speed;
              const itemNorm = normalizeId(m.itemId ?? m.item ?? "");
              const isScarf =
                itemNorm.includes("scarf") || itemNorm === "choice-scarf";
              return isScarf ? Math.floor(base * scarfMultiplier) : base;
            }),
          )
        : 0;

    const masterReport = {
      defensive: defensiveDetailed,
      offensive: offensiveReport,
      utility: utilityReport,
      roles: roleReport,
      legality: legalityReport,
    };

    const recommendations =
      RecommendationEngine.generateActionable(masterReport);

    const analysis: TeamAnalysis = {
      defensiveCoverage: defensiveDetailed.coverage,
      defensiveReport: defensiveDetailed,
      offensiveReport,
      utilityReport,
      roleReport,
      legalityReport: legalityReport,
      recommendations,
      averageSpeed,
      maxSpeed,
      effectiveMaxSpeed,
      teamSize: members.length,
      isLegal: legalityReport.isLegal,
      generatedAt: Date.now(),
    };

    return Object.freeze(analysis) as TeamAnalysis;
  }
}
