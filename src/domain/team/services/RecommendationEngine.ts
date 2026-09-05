import type { TypeExposure, TeamRecommendation } from "../types/TeamTypes";

export const RecommendationEngine = {
  generate(
    defensiveCoverage: Record<string, TypeExposure>,
  ): TeamRecommendation[] {
    const recommendations: TeamRecommendation[] = [];

    for (const [type, exposure] of Object.entries(defensiveCoverage)) {
      // Regla 1: Debilidad compartida masiva (CRITICAL)
      if (exposure.weak >= 3 && exposure.resist + exposure.immune <= 1) {
        recommendations.push({
          type: "Defensive Gap",
          severity: "Critical",
          title: `Vulnerabilidad crítica frente a ${type.toUpperCase()}`,
          reason: `3 o más miembros reciben daño súper efectivo y existe 1 o menos respuestas defensivas.`,
          description: `Considera sustituir un miembro débil a ${type} por uno que lo resista o sea inmune para mejorar la redundancia defensiva.`,
        });

        // Exclusividad: Si es crítico, no reportamos los problemas de menor severidad para este tipo.
        continue;
      }

      // Regla 2: Punto único de fallo
      if (
        exposure.weak >= 2 &&
        exposure.resist === 1 &&
        exposure.immune === 0
      ) {
        recommendations.push({
          type: "Dependency",
          severity: "High",
          title: `Dependencia defensiva frente a ${type.toUpperCase()}`,
          reason: `Tienes múltiples debilidades y dependes de un solo miembro para resistir este tipo.`,
          description: `Si tu única respuesta a ${type} es debilitada, el equipo entero quedará expuesto. Añade redundancia defensiva.`,
        });
      }
    }

    return recommendations;
  },
};
