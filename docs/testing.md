# Estrategia de Pruebas y Calidad - PokeGuide

## 1. Pirámide de Pruebas
No buscamos 100% artificial, buscamos confianza.

*   **Domain / Unit (node):** `StatCalculator`, `BreedingGraphSearch`, `GenerationRulesProvider`. Sin red, ms de ejecución. Mockeamos `PokemonRepository`.
*   **Integration:** `CalculateBattleScenarioUseCase` -> une `StatEngine` + `BattleCalculator`. Valida wiring.
*   **Regression:** `tests/regression/battle/BattleDamage.regression.test.ts`. Valores congelados Garchomp (445) vs Sylveon (700). Si cambia `StatName` de `special-attack` a `specialAttack` o la fórmula de daño, falla.
*   **E2E (Playwright):** Solo Happy Path en `/battle-lab`. Usa roles ARIA, no clases CSS. Verifica `SkipLink` y 404 accesible.

## 2. Quality Gates
Definidos en `vitest.config.ts` y forzados en `ci.yml`:

1.  `pnpm typecheck` -> `exactOptionalPropertyTypes` activo
2.  `pnpm lint` + `format:check`
3.  `pnpm test -- --coverage` -> umbrales 80/80/75/80. Falla si baja.
4.  `pnpm build` -> Next.js debe compilar

## 3. Prevención de Flakiness
*   Nunca `Date.now()` sin `vi.useFakeTimers()`
*   `Record<StatName, number>` usa guión: `special-attack`, no camelCase. Usar helper `s()` para no repetir.
*   No llamar a PokeAPI real en unit/integration. Fixtures locales en `tests/fixtures/`.
*   Aislamiento: cada test crea su propio `CalculateBattleScenarioUseCase` con mocks nuevos.