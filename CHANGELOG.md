# Changelog

# Changelog

## [v1.1.2] - fix(battle): Calidad de Sprites, Soporte Mega Z y Biome

### Fixed
- **PokemonSprite:** Migrado de `<img>` a `next/image` con `fill`, `unoptimized` y `loader` custom. Elimina warnings de terminal `Image with src ... has either width or height modified`.
- **Calidad y Tamaño:** Contenedor 96x96, sprite 88px, `image-rendering: pixelated` para `ani` y `gen5`, `auto` para `dex` y `official-artwork`. Uso de `dex/*.png` (HD) como fallback principal en lugar de `gen5`.
- **Soporte Mega Z:** Nuevo mapa `Z_TO_MEGA` (`absol-z` -> `absol-mega`, `garchomp-z` -> `garchomp-mega`, `lucario-z` -> `lucario-mega`, etc.) y lógica genérica `-z` -> `-mega`. Añadido `MEGA_ARTWORK_ID` para artwork HD de megas.
- **Bug de Selección:** Al seleccionar Pokémon se veía la forma base hasta refrescar. Causa: `index` de fallback no se reseteaba. Fix con `useMemo([pokemon, hd])` + `useEffect([chain]) { setIndex(0) }` y `key` en `ParticipantCard`.
- **Lint Biome:** Corregidos `lint/performance/noImgElement` y `lint/correctness/useExhaustiveDependencies` (deps ahora `[pokemon, hd]` y `[chain]` con uso de `chain.length`).

## [v1.1.1] - fix(battle): Algoritmo de KO, i18n y Sprites

### Fixed
- **KO Chance Algorithm:** Se corrigió el cálculo de KO que anteriormente solo mostraba 0% o 100% al evaluar únicamente OHKO. Ahora el algoritmo calcula correctamente el `hitsToKO` y la probabilidad cruzando los pares de *rolls* de daño (1HKO, 2HKO, 3HKO). La propiedad `guaranteed` ahora se determina matemáticamente mediante `minDamage * hitsToKO >= HP`.
- **Traducción de Modificadores (i18n):** Los factores y modificadores en el Battle Lab ahora se localizan al español LatAm utilizando diccionarios dedicados. Las habilidades y objetos reflejan su nomenclatura oficial (ej. `Habilidad de Pecharunt: Marioneta Tóxica (poison-puppeteer) x1`).
- **Sprites de Formas Alternativas:** Se resolvieron los errores de carga de imágenes (404) provenientes de Showdown. Las formas cosméticas exclusivas de PokeAPI (Pikachu caps, Zygarde Power Construct, Totems, Gmax) ahora se sanitizan y mapean a su forma base funcional mediante el `SmogonSpeciesMapper`.

## [v1.0.0] - Release Base de Dominio

### Added
- **Foundation:** Clean Architecture + pnpm + Next.js 15 + `exactOptionalPropertyTypes`
- **Domain:** `Stat Engine`, `Battle Lab`, `Team Intelligence`, `Build Optimization`, `Breeding Planner (BFS)`, `Generation Intelligence`
- **Application:** `CalculateBattleScenarioUseCase(generation, attacker, defender, moveName)` con inyección de `PokemonRepository` y `BattleCalculator`
- **Quality:** Vitest config con thresholds 80/80/75/80, `tests/regression/battle/BattleDamage.regression.test.ts` con Garchomp vs Sylveon, Playwright `battle-flow.spec.ts`, CI `ci.yml` (pnpm 9 + Node 24)
- **A11y & Perf:** `SkipLink`, `global-error.tsx`, `not-found.tsx`, `ReportWebVitals` con `sendBeacon`, `sitemap.ts` y `robots.ts`

### Fixed
- `StatName` con guión `special-attack` / `special-defense` para compatibilidad PokeAPI
- `BattleResult.damage: { minDamage, maxDamage }` en vez de props planas
- `vitest.config.ts` alias `@` -> `./src` con `fileURLToPath`

### Known Issues
- UI dashboards en placeholder, lógica de dominio lista para conectar

## [v1.1.0] - React UI Foundation & Battle Lab
### Added
- **Application Shell:** Header responsivo, menús de navegación, tema y Zustand `ui-store`.
- **Route Scaffolding:** Estructura completa de rutas (App Router) con SEO metadatos y estados de carga (`loading.tsx`).
- **Feature Layer:** Patrón ViewModel estricto con `useBattleStore`, `usePokedexStore`, `useMoveStore` y `useItemStore`.
- **Battle Lab UI:** Panel de simulación 1vs1 con validación estricta de Learnsets, niveles, habilidades, objetos y Naturalezas. Traductor de Smogon al español integrado.