# Mecánicas de Inteligencia Generacional

## 1. Disponibilidad vs Soporte
Error común: confundir si existe con si lo soportamos.

*   `availability`: `Available` | `Unavailable` | `Modified`. Lo que hizo Game Freak. Ej: Mega en Gen 9 = `Unavailable`.
*   `supportLevel`: `FullySupported` | `NotSupported` | `NotApplicable`. Lo que hizo PokeGuide. Ej: Terastal existe pero si Battle Lab no lo calcula aún = `NotSupported`.

## 2. Comparación Semántica
`GenerationComparisonService.compare(genA, genB)` + `GenerationComparison` entity.

*   **Added:** `terastallization` no estaba en Gen 3, sí en Gen 9.
*   **Removed:** Mecánica eliminada.
*   **Modified:** `fairy_type`: `Unavailable` -> `Available`. `breeding_ivs`: 3 -> 5.
*   `getChangesByCategory()` devuelve `Record<RuleCategory, SemanticChange[]>` listo para la UI.

## 3. Consumidores
*   **Breeding Planner:** `ruleset.breeding.maxInheritedIVs`, `everstoneChance`, `hasDestinyKnot`.
*   **Battle Lab / Stat Engine:** `ruleset.getMechanic("physical_special_split")`.
*   **UI Interregional:** `CompareGenerationsUseCase.execute(3, 9)` -> Timeline de cambios.