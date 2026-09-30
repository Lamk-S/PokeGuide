# ADR 004: Motor de Batalla y Adaptador de Smogon

## Estado
Aceptado (Evolucionado en v1.3.0)

## Contexto
El "Battle Lab" requiere calcular el daño resultante con precisión absoluta. Mantener estas fórmulas para 9 generaciones desde cero es inviable. Se decidió usar `@smogon/calc`, aislado bajo el Patrón Adapter.

## Decisión y Evolución (v1.3.0)
El `SmogonCalculatorAdapter` implementa `BattleCalculator`. 

**Principios de Integridad Aplicados:**
1. **Cero Falsos Positivos:** El adaptador **nunca** debe adivinar parámetros matemáticos. Las categorías de los movimientos (Físico/Especial) se extraen dinámicamente mediante `resolveMoveCategory(move)` desde la librería original.
2. **Traducción de Idioma:** El adaptador actúa como puente entre los "Value Objects" normalizados de PokeGuide (`MoveId`, `AbilityId`) y los requerimientos estrictos de nomenclatura en inglés del motor de Smogon.
3. **Flujo Invertido:** La UI solo conoce `BattleResult`. Smogon no dicta la estructura de la aplicación, es solo un proveedor de matemáticas.

## Consecuencias
*   **Positivas:** Precisión absoluta. Los servicios de dominio de PokeGuide (`BattleStatusEffectService`) pueden aplicar reglas tácticas complejas con total confianza porque el adaptador les provee datos reales, no inferidos.
*   **Negativas:** Obliga a mantener mappers actualizados (ej. `SmogonSpeciesMapper`) ante irregularidades de la librería externa.