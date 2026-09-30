# Sprites e Internacionalización (Battle Lab)

## 1. Mapeo de Especies - Id-first Estático
**Solución v1.2.0:** 100% Id-first, sin Showdown animado. `SpriteResolver.getSpriteChain` usa URLs predecibles estáticas basadas estrictamente en IDs (`home/{id}.png`).

### 1.1 Display Name - Separación de responsabilidades
El motor de Smogon procesa IDs y nombres en inglés. La presentación usa `PokemonDisplayName.ts` para renderizar `Mega Absol Z` o `Raichu de Alola` en la UI sin romper el motor matemático.

### 1.2 Naturalezas - i18n Español (v1.2.1)
`NATURES` incluye `nameEs`. El `Combobox` utiliza `value=name` (interno en inglés) pero expone `label=nameEs` en pantalla.

## 2. Aislamiento de Idioma en el Dominio (v1.3.0)

**El Problema:** Al localizar movimientos y habilidades ("Agallas", "Imagen"), se corrían riesgos de fallas lógicas si el núcleo de dominio intentaba evaluar reglas matemáticas comparando cadenas traducidas (`if (ability === "agallas")`).

**La Solución DDD (Domain-Driven Design):** 
Se crearon **Value Objects** (`AbilityId`, `MoveId`) con funciones de normalización estrictas (`normalizeAbilityId`, `normalizeMoveId`). 
*   La UI puede mostrar "Agallas" o "Intimidación".
*   El servicio `BattleScenarioNormalizer` lo intercepta y lo convierte inmutablemente a `AbilityId.GUTS` o `AbilityId.INTIMIDATE`.
*   El servicio `BattleStatusEffectService` opera con la seguridad de que los IDs son constantes inmutables en inglés.

Esto garantiza que el proyecto sea 100% amigable para LATAM sin sacrificar la integridad del motor de cálculo.