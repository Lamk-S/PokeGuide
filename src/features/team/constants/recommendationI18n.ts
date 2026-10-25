import type { PureTeamRecommendation } from "@/domain/team/services/RecommendationEngine";
import { TYPE_TRANSLATIONS_ES } from "./typeTranslations";
import type {
  Severity,
  RecommendationCategory,
  TeamRecommendation,
  RecommendationIssueCode,
} from "@/domain/team/types/TeamTypes";

export type RecommendationI18nPayload = {
  title: string;
  description: string;
};

function getTypeEs(typeId: string): string {
  const normalized = typeId.toLowerCase().trim();
  const dict = TYPE_TRANSLATIONS_ES as Record<string, string>;
  return dict[normalized] ?? typeId;
}

// --- FASE 3: API pura - cubre TODOS los issueCode de TeamTypes ---
type TemplateFn = (
  typeEs: string,
  rec: PureTeamRecommendation,
) => RecommendationI18nPayload;

const ISSUE_TEMPLATES: Record<RecommendationIssueCode, TemplateFn> = {
  massive_weakness: (typeEs: string, rec: PureTeamRecommendation) => ({
    title: `Debilidad masiva a ${typeEs}`,
    description: `${rec.weak} Pokémon son débiles a ${typeEs} y solo ${rec.resist + rec.immune} lo resiste. Añade resistencias o inmunidades a ${typeEs}.`,
  }),
  single_point_failure: (typeEs: string, rec: PureTeamRecommendation) => ({
    title: `Dependencia crítica: ${typeEs}`,
    description: `${rec.weak} Pokémon dependen de un único Pokémon que resiste ${typeEs}. Si cae, el equipo queda expuesto.`,
  }),
  redundant_weakness: (typeEs: string, rec: PureTeamRecommendation) => ({
    title: `Redundancia de debilidad a ${typeEs}`,
    description: `${rec.weak} Pokémon comparten debilidad a ${typeEs}. Diversifica tipos.`,
  }),
  speed_control_gap: (typeEs: string, _rec: PureTeamRecommendation) => ({
    title: `Falta control de velocidad vs ${typeEs}`,
    description: `El equipo no tiene respuesta rápida contra ${typeEs}. Considera Trick Room, Tailwind o priority.`,
  }),
} as unknown as Record<RecommendationIssueCode, TemplateFn>;

export function getRecommendationI18n(
  recommendation: PureTeamRecommendation | TeamRecommendation,
): RecommendationI18nPayload & { severityLabel: string } {
  const targetType =
    (recommendation as PureTeamRecommendation).targetType ??
    (recommendation as TeamRecommendation).targetType;
  const typeEs = getTypeEs(targetType);
  const issueCode = recommendation.issueCode as RecommendationIssueCode;
  const template = ISSUE_TEMPLATES[issueCode];
  const base = template
    ? template(typeEs, recommendation as PureTeamRecommendation)
    : { title: `${typeEs}`, description: `Código: ${issueCode}` };

  const severityLabelMap: Record<string, string> = {
    Critical: "Crítico",
    High: "Alto",
    Medium: "Medio",
    Low: "Bajo",
    Info: "Info",
  };

  return {
    ...base,
    severityLabel:
      severityLabelMap[recommendation.severity] ?? recommendation.severity,
  };
}

export const RECOMMENDATION_I18N = {
  get: getRecommendationI18n,
};

// --- COMPATIBILIDAD UI EXISTENTE ---
export const SEVERITY_I18N: Record<
  Severity,
  { label: string; descripcion: string }
> = {
  Critical: { label: "Crítico", descripcion: "Requiere acción inmediata" },
  High: { label: "Alto", descripcion: "Vulnerabilidad importante" },
  Medium: { label: "Medio", descripcion: "Mejorable" },
  Low: { label: "Bajo", descripcion: "Informativo" },
  Info: { label: "Info", descripcion: "Información" },
} as Record<Severity, { label: string; descripcion: string }>;

export const CATEGORY_I18N = {
  defensive_gap: "Brecha defensiva",
  dependency: "Dependencia",
  offensive_gap: "Brecha ofensiva",
  synergy: "Sinergia",
  speed: "Velocidad",
  coverage: "Cobertura",
  offensive: "Ofensiva",
  defensive: "Defensiva",
  speed_control_gap: "Control de velocidad",
  redundant_weakness: "Debilidad redundante",
} as unknown as Record<RecommendationCategory, string>;

export function getRecommendationTitle(
  rec: TeamRecommendation,
  affectedCount: number,
  resistCount: number,
): string {
  const typeEs = getTypeEs(rec.targetType);
  if (rec.issueCode === "massive_weakness") {
    return `Debilidad masiva a ${typeEs} (${affectedCount} afectados)`;
  }
  if (rec.issueCode === "single_point_failure") {
    return `Dependencia crítica: ${typeEs} solo resiste ${resistCount}`;
  }
  return getRecommendationI18n(rec).title;
}

export function getRecommendationReason(rec: TeamRecommendation): string {
  const typeEs = getTypeEs(rec.targetType);
  const ev = rec.evidence;
  if (rec.issueCode === "massive_weakness") {
    return `${ev.weak} Pokémon son débiles a ${typeEs} y solo ${ev.resist + ev.immune} lo resisten.`;
  }
  if (rec.issueCode === "single_point_failure") {
    return `Si el único Pokémon que resiste ${typeEs} cae, ${ev.weak} quedan expuestos.`;
  }
  return getRecommendationI18n(rec).description;
}

export function getRecommendationAction(rec: TeamRecommendation): string {
  const typeEs = getTypeEs(rec.targetType);
  if (rec.issueCode === "massive_weakness") {
    return `Añade un Pokémon tipo ${typeEs} resistente o inmune, o cambia un objeto/habilidad.`;
  }
  if (rec.issueCode === "single_point_failure") {
    return `Duplica la resistencia a ${typeEs} con otro Pokémon o añade inmunidad.`;
  }
  return `Mejora la cobertura contra ${typeEs}.`;
}
