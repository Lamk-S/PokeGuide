# Changelog

## [v1.0.0] - Release Base de Dominio

### Added
- **Foundation:** Clean Architecture + pnpm + Next.js 15 + `exactOptionalPropertyTypes`
- **Domain:** `Stat Engine`, `Battle Lab`, `Team Intelligence`, `Build Optimization`, `Breeding Planner (BFS)`, `Generation Intelligence`
- **Application:** `CalculateBattleScenarioUseCase(generation, attacker, defender, moveName)` con inyección de `PokemonRepository` y `BattleCalculator`
- **Quality:** Vitest config con thresholds 80/80/75/80, `tests/regression/battle/BattleDamage.regression.test.ts` con Garchomp vs Sylveon, Playwright `battle-flow.spec.ts`, CI `ci.yml` (pnpm 9 + Node 20)
- **A11y & Perf:** `SkipLink`, `global-error.tsx`, `not-found.tsx`, `ReportWebVitals` con `sendBeacon`, `sitemap.ts` y `robots.ts`

### Fixed
- `StatName` con guión `special-attack` / `special-defense` para compatibilidad PokeAPI
- `BattleResult.damage: { minDamage, maxDamage }` en vez de props planas
- `vitest.config.ts` alias `@` -> `./src` con `fileURLToPath`

### Known Issues
- UI dashboards en placeholder, lógica de dominio lista para conectar