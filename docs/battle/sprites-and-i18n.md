# Sprites e Internacionalización (Battle Lab)

## 1. Mapeo de Especies (SpriteResolver + SmogonSpeciesMapper)

Debido a discrepancias entre `PokeAPI`, identificadores custom (`-z`) y `Pokémon Showdown`, se unificó la resolución de sprites en `SpriteResolver`. `ShowdownSpriteResolver` ahora es solo un wrapper.

Toda consulta pasa por `SpriteResolver.normalize()` y `getSpriteChain()`.

### 1.1 Formas Cosméticas Ignoradas (Mapeadas a Base)

| Identificador PokeAPI | Sprite Fallback (Showdown/Base) | Razón |
| :--- | :--- | :--- |
| `pikachu-original-cap` | `pikachu` | Forma cosmética (gorra). |
| `zygarde-50-power-construct`| `zygarde` | Cambio in-battle; Showdown usa base. |
| `mimikyu-totem-busted` | `mimikyu-busted` | Totems sin sprite dedicado. |
| `castform-normal` | `castform` | Sufijo redundante de PokeAPI. |

### 1.2 Formas Custom Mega Z -> Mega Real

El proyecto usa sufijo `-z` para variantes Mega custom. Showdown no tiene `absol-z`, sino `absol-mega`. Se mapea explícitamente:

| Identificador Custom | Mapeo Showdown | 
| :--- | :--- |
| `absol-z`, `absol-mega-z` | `absol-mega` |
| `garchomp-z` | `garchomp-mega` |
| `lucario-z` | `lucario-mega` |
| `gengar-z` | `gengar-mega` |
| `charizard-z` | `charizard-megay` |

Lógica genérica: si `name.endsWith("-z")` y la base está en `MEGA_POKEMON`, se convierte a `${base}-mega`. También se normaliza `-mega-x` -> `-megax` y `-mega-y` -> `-megay`.

## 2. Calidad, Tamaño y Optimización (v1.1.2)

### Cadena de Fallback
El nuevo `getSpriteChain()` genera cadena HD primero:

1. `https://play.pokemonshowdown.com/sprites/ani/{specific}.gif` (animado pixelado)
2. `https://play.pokemonshowdown.com/sprites/dex/{specific}.png` (PNG HD de Showdown, 2x mejor que gen5)
3. `gen8/{specific}.png` / `gen5/{specific}.png`
4. `PokeAPI/sprites/.../official-artwork/{megaId}.png` (con `MEGA_ARTWORK_ID` para megas)
5. `/placeholder-sprite.png`

### Renderizado sin warnings
Se migró de `<img>` a `next/image` con patrón `fill`:

- Contenedor `relative` de `96x96` con hijo `88px`.
- `fill + unoptimized + loader={({src:s})=>s}` evita optimización de gifs.
- `style={{ objectFit: 'contain', imageRendering: isPixelArt ? 'pixelated' : 'auto' }}` -> sprites ani se ven nítidos, no borrosos.
- Elimina warnings de terminal: `Image with src ... has either width or height modified`.

### Fix de Bug de Selección
Bug: al seleccionar un Pokémon, a veces se veía la forma base y al refrescar aparecía la mega.
Causa: `useState(index)` del fallback no se reseteaba cuando cambiaba `chain`.
Fix:
```ts
const chain = useMemo(() => getSpriteChain(pokemon, hd), [pokemon, hd])
useEffect(() => { if(chain.length) setIndex(0) }, [chain])