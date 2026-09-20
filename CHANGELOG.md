# Changelog
Todos los cambios notables de PokeGuide.

## [v1.2.0] - Battle Lab Id-first y UI Editorial

### Added
- **Display Name:** Nuevo servicio `formatPokemonDisplayName()` para nombres legibles. `absol-mega` -> `Mega Absol`, `absol-mega-z` -> `Mega Absol Z`, `eternatus-eternamax` -> `Eternatus Eternamax`, `pikachu-alola-cap` -> `Pikachu con Gorra de Alola`, regionales `de Alola / Galar / Hisui / Paldea`, `zygarde-50` -> `Zygarde 50%`.

### Fixed
- **Sprites:** Ahora 100% por ID con imagen estática `other/home/{id}.png`. Se eliminó `MEGA_ARTWORK_ID` y `Z_TO_MEGA` que causaba el bug de `Absol-Mega` mostrando `Latias-Mega`. Soporte real para `10080+` (Pikachu caps/rock-star) y `10307+` (Mega-Z). Cero GIFs con movimiento.
- **Layout:** `BattleLabView` ahora `grid-cols-1 lg:grid-cols-2 gap-8 items-start`. Ambas cards con `self-start`. El defensor siempre queda arriba, no se centra al expandir el atacante.
- **ParticipantCard:** Header compacto `72px`, grid `[48px_1fr_auto]`, sprite `44x44` con borde `zinc-100`. Nombre `13.5px font-medium truncate`, Lv en pill sutil, habilidad/naturaleza en `text-zinc-500` sin badges negros. Stats en `grid-cols-6 divide-x` con `tabular-nums`, `min-w-`, sin `font-black`.
- **Botón Calcular Daño:** Corregido `className="h-8 text- font-medium"` que dejaba el texto invisible. Ahora `h-9 bg-zinc-900 text-white`.

### Changed
- Docs: `sprites-and-i18n.md`, `UI-001-zustand-viewmodel-pattern.md`, `battle-lab.md`.

## [v1.1.2] - Calidad de Sprites y Soporte Mega-Z

### Fixed
- `PokemonSprite` migrado a `next/image` con `fill` para eliminar warnings de Next.js.
- Calidad HD usando `dex/*.png` como fallback principal.
- Soporte para sufijo custom `-z` mapeado a mega real y bug de selección que mostraba forma base hasta refrescar.

## [v1.1.1] - Algoritmo de KO e i18n

### Fixed
- **KO:** Cálculo de `hitsToKO` y probabilidad cruzando los 16 rolls. Antes solo daba 0% o 100%.
- **i18n:** Modificadores y habilidades traducidos a LatAm.
- **Sprites:** Formas cosméticas de PokeAPI (caps, totems, gmax) mapeadas a base funcional.

## [v1.1.0] - React UI Foundation

### Added
- Shell de la app, navegación, tema y stores Zustand (`useBattleStore`, `usePokedexStore`).
- Scaffolding de rutas con App Router.
- Battle Lab UI 1vs1 con validación de learnsets, habilidades y naturalezas.

## [v1.0.0] - Release Base de Dominio

### Added
- Arquitectura Clean + Next.js 15 + pnpm.
- Domain: `Stat Engine`, `Battle Lab`, `Team Intelligence`, `Breeding Planner` (BFS), `Generation Intelligence`.
- Quality: Vitest (80% threshold), regresión `Garchomp vs Sylveon`, Playwright, CI.
- A11y: `SkipLink`, `global-error`, `not-found`, `ReportWebVitals`.