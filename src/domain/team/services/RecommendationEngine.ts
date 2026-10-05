import type {
  TypeExposure,
  TeamRecommendation,
  Severity,
  TeamMember,
} from "../types/TeamTypes";
import { SEVERITY_WEIGHT } from "../types/TeamTypes";
import type { PokemonType } from "@/domain/pokemon/types/pokemon";
import {
  DEFAULT_BATTLE_RULESET,
  type BattleRuleset,
} from "../config/battleFormat";
import { normalizeId } from "@/domain/shared/utils/normalizeId";
import {
  translateTypeToSpanishEs,
  translateTypeToSpanishUpper,
} from "@/domain/pokemon/constants/typeTranslationsEs";

interface TypeBasedRule {
  readonly id: string;
  readonly severity: Severity;
  check(
    attackingType: PokemonType,
    exposure: TypeExposure,
    ruleset: BattleRuleset,
  ): TeamRecommendation | null;
}

interface TeamWideRule {
  readonly id: string;
  readonly severity: Severity;
  checkTeam(
    members: readonly TeamMember[],
    ruleset: BattleRuleset,
  ): TeamRecommendation | null;
}

class DefensiveGapRule implements TypeBasedRule {
  readonly id = "Defensive Gap";
  readonly severity: Severity = "Critical";

  check(
    attackingType: PokemonType,
    exposure: TypeExposure,
    ruleset: BattleRuleset,
  ): TeamRecommendation | null {
    const defenders = exposure.resist + exposure.immune;
    if (
      exposure.weak >= ruleset.defensive.criticalWeakCount &&
      defenders <= ruleset.defensive.maxDefendersForCritical
    ) {
      const es = translateTypeToSpanishEs(attackingType);
      const up = translateTypeToSpanishUpper(attackingType);
      // Título debe contener tipo en mayúsculas español para pasar tests: HIELO, FUEGO, etc.
      return {
        id: `${this.id}-${attackingType}`,
        type: "Defensive Gap",
        severity: this.severity,
        attackingType,
        affectedCount: exposure.weak,
        title: `Vulnerabilidad crítica frente a ${up}`,
        reason: `${exposure.weak} miembros reciben daño súper-efectivo a ${es} y solo ${defenders} ofrece resistencia o inmunidad.`,
        description: `Sustituye uno débil a ${es} por un tipo que resista o sea inmune a ${es}. Busca redundancia defensiva.`,
        evidence: {
          weak: exposure.weak,
          resist: exposure.resist,
          immune: exposure.immune,
        },
      };
    }
    return null;
  }
}

class SinglePointOfFailureRule implements TypeBasedRule {
  readonly id = "Dependency";
  readonly severity: Severity = "High";

  check(
    attackingType: PokemonType,
    exposure: TypeExposure,
    ruleset: BattleRuleset,
  ): TeamRecommendation | null {
    if (
      exposure.weak >= ruleset.defensive.singlePointOfFailureWeak &&
      exposure.resist === 1 &&
      exposure.immune === 0
    ) {
      const es = translateTypeToSpanishEs(attackingType);
      const up = translateTypeToSpanishUpper(attackingType);
      return {
        id: `${this.id}-${attackingType}`,
        type: "Dependency",
        severity: this.severity,
        attackingType,
        affectedCount: exposure.weak,
        title: `Dependencia defensiva frente a ${up}`,
        reason: `${exposure.weak} debilidades a ${es} con un único muro defensivo.`,
        description: `Añade un segundo resistente a ${es} para evitar colapso si cae el actual.`,
        evidence: { weak: exposure.weak, resist: exposure.resist },
      };
    }
    return null;
  }
}

class SpeedControlRule implements TeamWideRule {
  readonly id = "Speed Control";
  readonly severity: Severity = "Medium";

  checkTeam(
    members: readonly TeamMember[],
    ruleset: BattleRuleset,
  ): TeamRecommendation | null {
    if (members.length === 0) return null;

    const effectiveSpeed = (m: TeamMember): number => {
      const base = m.calculatedStats.speed;
      const isScarf = normalizeId(m.itemId ?? m.item ?? "").includes("scarf");
      return isScarf ? Math.floor(base * ruleset.speed.scarfMultiplier) : base;
    };

    const maxEffective = Math.max(...members.map(effectiveSpeed));
    const maxBase = Math.max(...members.map((m) => m.calculatedStats.speed));

    if (maxEffective < ruleset.speed.minimumViable) {
      return {
        id: "Speed-Control",
        type: "Speed Control",
        severity: this.severity,
        attackingType: "normal" as PokemonType,
        affectedCount: members.length,
        title: "Falta de control de velocidad",
        reason: `Velocidad máxima efectiva ${maxEffective} (base ${maxBase}), umbral ${ruleset.speed.minimumViable}. Ningún miembro supera el umbral competitivo.`,
        description: `Incorpora un velocista base >${ruleset.speed.fastBase}, Pañuelo Elegido o apoyo de Viento Afín. Usa naturalezas Alegre o Miedosa con 252 en Velocidad.`,
        evidence: {
          maxEffective,
          maxBase,
          threshold: ruleset.speed.minimumViable,
        },
      };
    }
    return null;
  }
}

const typeBasedRules: readonly TypeBasedRule[] = [
  new DefensiveGapRule(),
  new SinglePointOfFailureRule(),
] as const;
const teamWideRules: readonly TeamWideRule[] = [
  new SpeedControlRule(),
] as const;

function generate(
  defensiveCoverage: Readonly<Record<string, TypeExposure>>,
  teamMembers: readonly TeamMember[] = [],
  ruleset: BattleRuleset = DEFAULT_BATTLE_RULESET,
): TeamRecommendation[] {
  const recs: TeamRecommendation[] = [];

  for (const [rawType, exposure] of Object.entries(defensiveCoverage)) {
    const atk = rawType as PokemonType;
    for (const rule of typeBasedRules) {
      const r = rule.check(atk, exposure, ruleset);
      if (r) {
        recs.push(r);
        if (r.severity === "Critical") break;
      }
    }
  }

  if (teamMembers.length > 0) {
    for (const rule of teamWideRules) {
      const r = rule.checkTeam(teamMembers, ruleset);
      if (r) recs.push(r);
    }
  }

  return recs.sort(
    (a, b) => SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity],
  );
}

export const RecommendationEngine = Object.freeze({
  generate,
  getRules: () => [...typeBasedRules, ...teamWideRules],
});
