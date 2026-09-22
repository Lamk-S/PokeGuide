# Changelog
Todos los cambios notables de PokeGuide.

## [v1.2.1] - Fix Naturaleza ES, IV/EV Distortion, EV Remaining, Header

### Fixed
- **Naturaleza:** Ahora muestra español (`Firme` en lugar de `Adamant`). Fix bug donde select no cambiaba visualmente porque `value` era objeto `Nature` en lugar de `string`. Ahora `value={nature.name}` + `label={nature.nameEs}`. Fix TS2367 `string vs Nature no overlap`. Aplica `nameEs` de `natures.ts` con 25 naturalezas.
- **IVs/EVs Distorsión:** Separación total `IvRow` y `EvRow`. Antes mostraba IV+EV en misma fila: `IV 31 [slider] 31 EV 0 [slider] 0 252` causando distorsión móvil (`image_52acf9.png`, `image_ce5e89.png`). Ahora cada sección solo muestra sus controles.
- **EVs Remaining Logic:** Botón MAX adaptativo. Cuando total es 504 (252+252), el tercer stat ya no dice `252`, dice `6` (lo que queda). Si queda 0, botón deshabilitado gris, no `0 0 0` duplicado (`image_6fe744.png`). Barra progreso `0/510 · quedan 510` → `510/510 · lleno` verde, rojo si >510. Mensaje "Quedan 0 libres" solo en header, no por fila.
- **Header Doble Título:** Fix `image_fa559c.png` con dos h1 "Laboratorio de Batalla" + "Laboratorio de batalla". `BattleLabView` ahora header único con descripción generacional completa + Gen selector + badge estado.
- **Header Global:** Rediseño `Header.tsx` editorial con logo Flame gradiente, nav pills `rounded-full`, active `bg-zinc-900 text-white`, mobile con cards. Fix barra vacía de `image_f01bba.png`. Soporte `backdrop-blur-xl` al hacer scroll.
- **Mobile:** `ParticipantCard` stats `grid-cols-3 md:grid-cols-6`, `BattleSummary` solo 1 tipo en móvil para evitar wrap, bottom bar `pb-[env(safe-area-inset-bottom)]` sin `N` de dev overlay.
- **Lint:** 0 `any`, 0 `useHookAtTopLevel`. Todos los hooks antes de early return `if (!input)`.

### Changed
- Docs: `sprites-and-i18n.md` (sección 1.2 Naturalezas ES + 3. UI Guardrails v1.2.1), `UI-001-zustand-viewmodel-pattern.md` (Actualización v1.2.1), `UI-002-battle-lab-strict-validation.md` (EVs remaining + Naturaleza validación), `battle-lab.md` (sección 2 generation required + 5 i18n naturalezas + 6 guardrails v1.2.1).

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
- Domain: `Stat Engine`, `Battle Lab`, `Team Intelligence`, `Build Optimization`, `Breeding Planner` (BFS), `Generation Intelligence`.
- Quality: Vitest (80% threshold), regresión `Garchomp vs Sylveon`, Playwright, CI.
- A11y: `SkipLink`, `global-error`, `not-found`, `ReportWebVitals`.