# Mecánicas del Laboratorio de Batalla (Battle Lab)

## 1. El Escenario de Batalla (`BattleScenario`)
Agrupación de 4 conceptos:
1.  **Atacante (`BattlePokemon`):** IVs, EVs, Naturaleza, Objeto y Estadísticas Pre-calculadas del Stat Engine.
2.  **Defensor:** Contraparte.
3.  **Movimiento:** Poder base, tipo, categoría.
4.  **Condiciones (`BattleConditions`):** Clima, Terreno, Pantallas, Crítico.

## 2. Reutilización del Stat Engine
El Battle Lab **no** calcula stats. Inyecta las del `Stat Engine`.

## 3. Resolución de Sprites (Nuevo v1.1.2)
El `ParticipantCard` no renderiza directo el id de PokeAPI. Llama a `SpriteResolver.getSpriteChain()`:

- Soporte para `-z` -> `-mega` (absol-z, garchomp-z, lucario-z).
- Cadena: `ani/*.gif` -> `dex/*.png` (HD) -> `gen8` -> `gen5` -> `official-artwork` -> placeholder.
- `MEGA_ARTWORK_ID` mapea megas a su id real de PokeAPI (ej. `absol-mega: 10062`) para artwork HD.

## 4. Análisis de Daño (`DamageResult` y `KOAnalysis`)
- **Rango:** min/max (ej. 142-168).
- **Porcentajes:** vs HP max defensor.
- **KO:** `hitsToKO` evaluando 16 rolls. `guaranteed` si `minDamage * hitsToKO >= HP`. Probabilidad cruzando combinaciones.

## 5. Capa de Explicabilidad (Explainability) e i18n
Factores traducidos a LatAm: STAB, Clima, Terreno, Crítico, Habilidades y Objetos con formato `[Pokemon] usa [Mov] contra [Def] - [min]-[max] ([%]) - [X]HKO [%]`.

## 6. UI Guardrails y Restricciones Estrictas
- **Filtro de Learnset:** Purga si nivel decrece o especie muta.
- **Filtro de Habilidades:** Solo legales.
- **Inyección Limpia:** Objetos consolidados para `exactOptionalPropertyTypes`.
- **Guardrail de Sprites (v1.1.2):** `key={`${id}-${name}`}` en `PokemonSprite`, contenedor `96x96`, `fill` + `object-contain`, reset de índice con `useEffect([chain])`.