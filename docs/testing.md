# Estrategia de Pruebas y Calidad - PokeGuide

## 1. Pirámide de Pruebas
No buscamos 100% artificial, buscamos confianza.

*   **Domain / Unit (node):** `StatCalculator`, `BreedingGraphSearch`, `BattleStatusEffectService`. Sin red, ms de ejecución. Mockeamos repositorios y verificamos matrices de reglas estrictas (ej. Quemadura + Ataque Físico vs Especial + Habilidad Guts).
*   **Integration:** `CalculateBattleScenarioUseCase` -> une `StatEngine` + `BattleCalculator`. Valida wiring. Verificamos que la normalización de Value Objects (`AbilityId`, `MoveId`) mantenga el dominio inmune a los labels de la UI en español.
*   **Regression:** `tests/regression/battle/BattleDamage.regression.test.ts`. Valores congelados Garchomp (445) vs Sylveon (700). Si cambia la fórmula de daño o el adaptador de Smogon, falla.
*   **E2E (Playwright):** Solo Happy Path en `/battle-lab`. Usa roles ARIA, no clases CSS. Verifica `SkipLink` y 404 accesible.

## 2. Quality Gates
Definidos en `vitest.config.ts` y forzados en `ci.yml`:

1.  `pnpm typecheck` -> TS compiler actúa como nuestra primera prueba unitaria. En la v1.4.0 se activó `"noUncheckedIndexedAccess": true` para evitar bugs con accesos a arrays indefinidos en tiempo de compilación. Las opciones `exactOptionalPropertyTypes` también están activas.
2.  `pnpm lint` + `format:check`
3.  `pnpm test -- --coverage` -> umbrales 80/80/75/80. Falla si baja. Todo el código muerto (ej. `mockPool`, viejos mappers y test de validaciones obsoletos) debe purgarse sistemáticamente.
4.  `pnpm build` -> Next.js debe compilar

## 3. Prevención de Flakiness
*   Nunca `Date.now()` sin `vi.useFakeTimers()`
*   `Record<StatName, number>` usa guión: `special-attack`, no camelCase. Usar helper `s()` para no repetir.
*   No llamar a PokeAPI real en unit/integration. Fixtures locales en `tests/fixtures/`.
*   Aislamiento: cada test crea su propio caso de uso con mocks nuevos.