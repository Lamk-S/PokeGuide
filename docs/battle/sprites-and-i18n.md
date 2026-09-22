# Sprites e Internacionalización (Battle Lab)

## 1. Mapeo de Especies - Id-first Estático

**Problema anterior:** `SpriteResolver` usaba Showdown `ani/` + `dex/` + `MEGA_ARTWORK_ID` + `Z_TO_MEGA` (`absol-z` -> `absol-mega`). Causaba bug `absol-mega` -> `latias-mega`.

**Solución v1.2.0:** 100% Id-first, sin Showdown animado.

`SpriteResolver.getSpriteChain(pokemon, _hd?)` ahora es:

1. `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/{id}.png` (estático 512px)
2. `.../other/official-artwork/{id}.png`
3. `.../pokemon/{id}.png`
4. `/placeholder-sprite.png`

`ShowdownSpriteResolver` es ahora wrapper que también retorna `home/{id}.png`. No hay `MEGA_ARTWORK_ID`, no hay `Z_TO_MEGA`. El ID manda: `10062` = Absol-Mega, `10080` = Pikachu Rock Star, `10307` = Absol-Mega-Z.

### 1.1 Display Name - Separación de responsabilidades

El cálculo sigue usando `SmogonSpeciesMapper` sin tocar. La presentación usa nuevo servicio:

`src/domain/pokemon/services/PokemonDisplayName.ts` -> `formatPokemonDisplayName(slug)`

| Slug | Display |
| :--- | :--- |
| `eternatus-eternamax` | `Eternatus Eternamax` |
| `absol-mega` | `Mega Absol` |
| `absol-mega-z` | `Mega Absol Z` |
| `charizard-mega-x` | `Mega Charizard X` |
| `pikachu-alola-cap` | `Pikachu con Gorra de Alola` |
| `pikachu-original-cap` | `Pikachu con Gorra de Original` |
| `raichu-alola` | `Raichu de Alola` |
| `zygarde-50` | `Zygarde 50%` |

Reglas: Mega regex `^(.*)-mega-([xyz])$`, caps `*-cap` -> `con Gorra de {region}`, regionales `-(alola|galar|hisui|paldea)` -> `de {region}`, fallback genérico capitalizado.

Se aplica en `pokemonOptions`, título de `ParticipantCard` y `BattleResultCard`.

### 1.2 Naturalezas - i18n Español (v1.2.1)

`src/domain/stats/constants/natures.ts` ahora incluye `nameEs`:

| name | nameEs | Efecto |
| :--- | :--- | :--- |
| Adamant | Firme | +Atk -SpA |
| Jolly | Alegre | +Spe -SpA |
| Modest | Modesta | +SpA -Atk |
| Timid | Miedosa | +Spe -Atk |
| Hardy | Fuerte | Neutra |

UI: `ParticipantCard` muestra `nameEs` como label (`Firme` en lugar de `Adamant`), con descripción `+attack -special-attack • Adamant`. El `Combobox` usa `value=name` interno pero `label=nameEs` visible. Fix de bug donde `value` era objeto y no cambiaba visualmente.

## 2. Calidad y Renderizado v1.2.0

- No `image-rendering: pixelated` necesario, son PNG estáticos HD.
- `next/image` con `fill + unoptimized + loader={({src:s})=>s}` y contenedor `relative 44x44`.
- `object-fit: contain`, 0 warnings.
- Bug de selección resuelto por Id-first: `key={`${id}-${name}`}` + remount, no `useEffect([chain])` con `chain.length`.

## 3. UI Guardrails v1.2.1

- `BattleLabView`: `grid-cols-1 lg:grid-cols-2 gap-8 items-start`, hijos `self-start`. Header único (fix doble título): título + descripción generacional + selector Gen + badge estado. Evita duplicado de `app/battle-lab/page.tsx` + `BattleLabView`.
- `ParticipantCard`: header compacto `min-h- max-h-` grid `[48px_1fr_auto]`. Stats overview `grid-cols-3 md:grid-cols-6`.
- **IVs**: `IvRow` separado, solo controles IV: input 0-31 + slider + botón 31. Sin EV mezclado (fix distorsión `image_52acf9.png`).
- **EVs**: `EvRow` separado, solo controles EV con lógica de restante:
  - `remaining = 510 - (total - current)`
  - `maxForThisStat = min(252, remaining)`
  - Botón derecho muestra `6` cuando quedan 6 EVs (ej. 252+252=504, queda 6), no siempre 252. Si `remaining=0`, botón deshabilitado gris (fix `image_6fe744.png`).
  - Mensaje de restante solo en header de sección `510/510 · lleno`, no por fila.
- `Header`: Rediseño editorial con logo `Flame` gradiente, nav en pills `rounded-full`, active `bg-zinc-900 text-white`, mobile con cards. Evita barra vacía de `image_f01bba.png`.