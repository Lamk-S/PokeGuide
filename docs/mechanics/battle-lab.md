# Mecánicas del Laboratorio de Batalla (Battle Lab)

## 1. El Escenario de Batalla (`BattleScenario`)
Agrupación de 4 conceptos:
1.  **Atacante (`BattlePokemon`):** IVs, EVs, Naturaleza, Objeto y Estadísticas Pre-calculadas del Stat Engine.
2.  **Defensor:** Contraparte.
3.  **Movimiento:** Poder base, tipo, categoría.
4.  **Condiciones (`BattleConditions`):** Clima, Terreno, Pantallas, Crítico.

## 2. Reutilización del Stat Engine
El Battle Lab **no** calcula stats. Inyecta las del `Stat Engine`.

`StatCalculationInput` requiere `generation` desde v1.2.0:
```ts
{
  baseStats: Pokemon.baseStats,
  ivs, evs, level,
  nature: Nature, // { name, nameEs, increasedStat, decreasedStat }
  generation: number
}
```

## 3. Resolución de Sprites (v1.2.0 Id-first)
`ParticipantCard` ya no resuelve por slug Showdown. Llama a `SpriteResolver.getSpriteChain({id, name})` que es 100% ID:
- `home/{id}.png` -> estático, sin movimiento.
- Corrige bug `absol-mega` -> `latias-mega`.
- Soporta custom `10307 absol-mega-z`, `10080 pikachu-rock-star`, `10085 pikachu-original-cap`.

Display name separado en `PokemonDisplayName.ts`.

## 4. Análisis de Daño (`DamageResult` y `KOAnalysis`)
- **Rango:** min/max (ej. 142-168).
- **Porcentajes:** vs HP max defensor.
- **KO:** `hitsToKO` evaluando 16 rolls. `guaranteed` si `minDamage * hitsToKO >= HP`. Probabilidad cruzando combinaciones.

## 5. Capa de Explicabilidad (Explainability) e i18n
Factores traducidos a LatAm: STAB, Clima, Terreno, Crítico, Habilidades y Objetos con formato `[Pokemon] usa [Mov] contra [Def] - [min]-[max] ([%]) - [X]HKO [%]`.

Naturalezas en español desde v1.2.1:
- `NATURES[].nameEs`: `Fuerte, Dócil, Seria, Tímida, Rara, Huraña, Audaz, Firme, Pícara, Osada, Plácida, Agitada, Floja, Miedosa, Activa, Alegre, Ingenua, Modesta, Afable, Mansa, Alocada, Serena, Amable, Grosera, Cauta`
- UI muestra `Firme` con subtítulo `+attack • Adamant`.

## 6. UI Guardrails y Restricciones v1.2.1

### v1.2.0
- Filtro Learnset / Habilidades igual.
- Guardrail Sprites: `home/{id}.png` + `key={`${id}-${name}`}`.
- Guardrail Layout: `items-start` + `self-start`, header 72px, stats `grid-cols-6 divide-x`, botón `h-9 bg-zinc-900 text-white`.

### v1.2.1 Nuevo
- **Header único:** Fix doble título de `image_fa559c.png`. `BattleLabView` ahora tiene un solo header con título + descripción generacional + Gen selector + badge estado. `app/battle-lab/page.tsx` no debe tener h1 propio.
- **Header global:** Nuevo `Header.tsx` editorial con logo Flame, nav pills `rounded-full`, active `bg-zinc-900`. Evita barra vacía de `image_f01bba.png`. Soporte scroll blur `backdrop-blur-xl`.
- **IVs/EVs:** Separación total:
  - IVs: `IvRow` solo IV, input 0-31 + slider + botón 31.
  - EVs: `EvRow` solo EV con `maxForThisStat = min(252, 510 - (total - current))`. Botón MAX adaptativo: muestra `6` cuando quedan 6, no `252`. Deshabilitado gris cuando `remaining=0`. Mensaje restante solo en header sección, no por fila.
- **Naturaleza:** `Combobox value={nature.name}` + `label={nature.nameEs}`. Fix TS2367 y bug visual "sigue diciendo Naturaleza".
- **Mobile:** `BattleSummary` 1 tipo en móvil, stats `grid-cols-3 md:grid-cols-6`, bottom bar `pb-[env(safe-area-inset-bottom)]`.