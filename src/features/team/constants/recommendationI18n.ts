import type { PokemonType } from "@/domain/pokemon/types/pokemon";
import type {
  TeamRecommendation,
  Severity,
  RecommendationCategory,
} from "@/domain/team/types/TeamTypes";
import { translateTypeToSpanish } from "./typeTranslations";

export const SEVERITY_I18N: Record<
  Severity,
  { label: string; descripcion: string }
> = {
  Critical: { label: "Crítico", descripcion: "Corrige antes de competir" },
  High: { label: "Alto", descripcion: "Atención prioritaria" },
  Medium: { label: "Medio", descripcion: "Mejora recomendada" },
  Low: { label: "Bajo", descripcion: "Informativo" },
  Info: { label: "Info", descripcion: "Nota táctica" },
};

export const CATEGORY_I18N: Record<RecommendationCategory, string> = {
  defensive_gap: "Sinergia defensiva",
  dependency: "Dependencia",
  speed: "Velocidad",
};

function suggestResistFor(type: PokemonType): string {
  const map: Partial<Record<PokemonType, string>> = {
    fire: "Agua, Roca o Dragón",
    water: "Planta, Eléctrico",
    ice: "Acero, Fuego, Lucha",
    ground: "Planta, Volador con Levitación",
    electric: "Tierra o Planta",
    grass: "Fuego, Volador, Hielo",
    flying: "Roca, Eléctrico, Hielo",
    psychic: "Siniestro, Fantasma, Bicho",
    bug: "Fuego, Volador, Roca",
    rock: "Acero, Agua, Planta, Lucha, Tierra",
    ghost: "Siniestro, Fantasma",
    dragon: "Hada, Hielo, Dragón",
    dark: "Lucha, Hada, Bicho",
    steel: "Fuego, Lucha, Tierra",
    fairy: "Acero, Veneno",
    fighting: "Volador, Psíquico, Hada",
    poison: "Tierra, Psíquico",
    normal: "Lucha",
  };
  return map[type] ?? "resistencia complementaria";
}

export function getRecommendationTitle(
  rec: TeamRecommendation,
  affectedCount: number,
  resistCount: number,
): string {
  const tipoEs = translateTypeToSpanish(rec.targetType);
  switch (rec.issueCode) {
    case "massive_weakness":
      return `${affectedCount} Pokémon son débiles a ${tipoEs} y solo ${resistCount} ofrece resistencia.`;
    case "single_point_failure":
      return `Dependencia crítica a ${tipoEs}: ${affectedCount} débiles, solo ${resistCount} resiste.`;
    case "redundant_weakness":
      return `Debilidad compartida a ${tipoEs} en ${affectedCount} miembros.`;
    default:
      return `Exposición a ${tipoEs}`;
  }
}

export function getRecommendationReason(rec: TeamRecommendation): string {
  const tipoEs = translateTypeToSpanish(rec.targetType);
  switch (rec.issueCode) {
    case "massive_weakness":
      return `Tu equipo recibe x2 o más daño de tipo ${tipoEs} en ${rec.evidence.weak} miembros. Si el rival tiene cobertura ${tipoEs}, puede presionar repetidamente sin costo y forzar cambios constantes.`;
    case "single_point_failure":
      return `Solo ${rec.evidence.resist + rec.evidence.immune} Pokémon resiste o es inmune a ${tipoEs}. Si ese pivote cae o está debilitado, el resto del equipo queda expuesto a barridos.`;
    case "redundant_weakness":
      return `Dos o más miembros comparten debilidad a ${tipoEs}. El oponente puede explotar esa sinergia con un solo set.`;
    default:
      return `Se detectó exposición defensiva a tipo ${tipoEs}.`;
  }
}

export function getRecommendationAction(rec: TeamRecommendation): string {
  const tipoEs = translateTypeToSpanish(rec.targetType);
  const sugerencia = suggestResistFor(rec.targetType);
  switch (rec.issueCode) {
    case "massive_weakness":
      return `Añade un tipo que resista ${tipoEs} (${sugerencia}) o una habilidad de inmunidad como Levitación, Absorbe Agua, o equipar Globo / Bota Gruesa para mejorar pivoteo.`;
    case "single_point_failure":
      return `Refuerza la resistencia a ${tipoEs} con un segundo pivote (${sugerencia}) o con objeto defensivo como Chaleco Asalto, Lodo Negro o Casco Dentado.`;
    default:
      return `Revisa la matriz para validar el impacto. Considera añadir ${sugerencia} contra ${tipoEs}.`;
  }
}
