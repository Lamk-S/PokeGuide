# Mecánicas de Inteligencia de Equipo (Team Intelligence)

Este documento detalla las reglas de negocio y los algoritmos utilizados por PokeGuide para evaluar un equipo Pokémon y generar recomendaciones explicables (*Explainability*).

## 1. Composición del Equipo
* El modelo `PokemonTeam` acepta desde 0 hasta un máximo estricto de 6 `TeamMember`.
* Un `TeamMember` es equivalente a un `BattlePokemon` configurado (posee un Pokémon base, nivel, naturaleza, objeto, habilidades, IVs, EVs, y estadísticas pre-calculadas).

## 2. Análisis de Cobertura Defensiva
El motor de inteligencia evalúa cómo el equipo entero responde frente a cada uno de los 18 tipos del juego. Por cada tipo atacante, se categoriza a cada miembro del equipo en uno de cuatro grupos:

* **Weak (Débil):** El multiplicador de daño recibido es > 1 (Súper Efectivo).
* **Resist (Resistente):** El multiplicador de daño recibido es < 1 y > 0 (Poco Efectivo).
* **Immune (Inmune):** El multiplicador de daño recibido es exactamente 0.
* **Neutral:** El multiplicador de daño recibido es exactamente 1.

La métrica resultante se denomina `TypeExposure`.

## 3. Motor de Recomendaciones (Explainability)
El `RecommendationEngine` evalúa el mapa de `TypeExposure` de los 18 tipos y aplica reglas deterministas para detectar vulnerabilidades estructurales. Cada hallazgo se estandariza en un formato legible.

### Regla A: Vulnerabilidad Crítica (Defensive Gap)
* **Condición:** Si un tipo atacante tiene `>= 3` miembros categorizados como *Weak*, y al mismo tiempo la suma de miembros *Resist* + *Immune* es `<= 1`.
* **Severidad:** `Critical`.
* **Razón (Por qué ocurre):** Más de la mitad del equipo recibe daño amplificado y casi no hay respuestas seguras para cambiar de Pokémon (*switch-in*).

### Regla B: Dependencia Defensiva (Single Point of Failure)
* **Condición:** Si un tipo atacante tiene `>= 2` miembros categorizados como *Weak*, exactamente `1` miembro categorizado como *Resist*, y `0` categorizados como *Immune*.
* **Severidad:** `High`.
* **Razón (Por qué ocurre):** El equipo depende de un único integrante para frenar una amenaza compartida. Si ese miembro es debilitado en combate, el equipo completo pierde su cobertura frente a ese tipo.

*(Nota: Este motor será extendido próximamente con Análisis Ofensivo, Análisis de Roles y Benchmark de Velocidades).*

## 4. Niveles de Severidad
Las recomendaciones se emiten bajo las siguientes clasificaciones estandarizadas para la UI:
* **Critical (Crítico):** Fallo estructural grave que será fácilmente explotado en competitivo.
* **High (Alto):** Riesgo notable, como dependencias únicas (SPFs).
* **Medium (Medio):** Problema moderado de optimización.
* **Low (Bajo):** Pequeñas ineficiencias de cobertura.
* **Info (Informativo):** Observaciones generales sobre el estilo del equipo (ej. "Equipo altamente orientado a ataque físico").