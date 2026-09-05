# ADR 008: Arquitectura de Inteligencia Generacional (Generation Intelligence)

## Estado
Aceptado

## Contexto
PokeGuide tiene 3 motores: Stat Engine, Battle Lab y Breeding Planner. Cada uno tenía su propio `if (generation === 9)` para decidir si existía Destiny Knot, Fairy Type o Terastallization. Esto causaba que Gen 9 funcionara en crianza pero crasheara en combate.

## Decisión
Centralizar toda la historia en el **Generation Intelligence Engine**.

1.  **Single Source of Truth:** `GenerationRulesProvider` es el único lugar donde se definen `GenerationRuleset` (Hoenn, Kalos, Paldea). Usa cache inmutable y `Object.freeze`.
2.  **Separación de Conceptos:** `MechanicStatus` divide `availability` (¿Game Freak lo metió en el juego?) de `supportLevel` (¿PokeGuide ya lo programó?). Esto evita mentir en la UI.
3.  **Consumo por Dependencia:** `Breeding` ya no tiene su propio `RULESETS`. `src/domain/breeding/rules/GenerationRules.ts` ahora es una fachada que delega a `GenerationRulesProvider`. `CompareGenerationsUseCase` retorna `GenerationComparison` agrupable por categoría para la UI.

## Alternativas Consideradas
*   **Herencia `Gen3Rules extends Gen2Rules`:** Descartado. Frágil ante reinicios como LGPE.
*   **JSON puro sin tipos:** Descartado. Sin tipado no hay seguridad con `exactOptionalPropertyTypes`.

## Consecuencias
*   **Positivas:** Añadir Gen 10 es añadir un objeto en el Provider y todo el ecosistema escala. La UI puede hacer `getChangesByCategory()` y pintar tabs de Breeding / Battle / Types.
*   **Negativas:** Obliga a migrar los motores viejos a usar el Provider.