# Mecánicas del Laboratorio de Batalla (Battle Lab)

## 1. El Escenario de Batalla (`BattleScenario`)
Agrupación de 4 conceptos:
1.  **Atacante (`BattlePokemon`):** IVs, EVs, Naturaleza, Objeto y Estadísticas Pre-calculadas del Stat Engine.
2.  **Defensor:** Contraparte.
3.  **Movimiento:** Poder base, tipo, categoría.
4.  **Condiciones (`BattleConditions`):** Clima, Terreno, Pantallas, Crítico.

## 2. Reutilización del Stat Engine
El Battle Lab **no** calcula stats. Inyecta las del `Stat Engine`.

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

## 6. UI Guardrails y Restricciones v1.2.0
- Filtro Learnset / Habilidades igual.
- Guardrail Sprites: `home/{id}.png` + `key={`${id}-${name}`}`.
- Guardrail Layout: `items-start` + `self-start`, header 72px, stats `grid-cols-6 divide-x`, botón `h-9 bg-zinc-900 text-white`.