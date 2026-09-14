# Mecánicas del Laboratorio de Batalla (Battle Lab)

Este documento detalla el flujo de datos y las reglas mecánicas subyacentes al motor de simulación de combate de PokeGuide.

## 1. El Escenario de Batalla (`BattleScenario`)
A diferencia de una simple "Calculadora de Daño", el Battle Lab orquesta una simulación integral. Un `BattleScenario` agrupa cuatro conceptos fundamentales:

1. **Atacante (`BattlePokemon`):** Una instancia temporal que contiene los IVs, EVs, Naturaleza, Objeto y **Estadísticas Pre-calculadas** (provenientes del `Stat Engine`).
2. **Defensor (`BattlePokemon`):** Contraparte que recibe el impacto.
3. **Movimiento:** El ataque ejecutado, que posee su propio poder base, tipo y categoría (Físico/Especial).
4. **Condiciones (`BattleConditions`):** Factores externos que alteran la matemática del daño (Clima, Terreno, Pantallas, Golpes Críticos).

## 2. Reutilización del Stat Engine
El Battle Lab **no** calcula las estadísticas de los Pokémon. En su lugar, el caso de uso `CalculateBattleScenarioUseCase` inyecta las estadísticas reales generadas previamente por el `Stat Engine`. Esto garantiza que una modificación en la fórmula de HP (por ejemplo) se propague automáticamente al Battle Lab sin duplicar código.

## 3. Análisis de Daño (`DamageResult` y `KOAnalysis`)
El resultado del simulador produce métricas deterministas:
* **Rango de Daño:** El daño mínimo y máximo posible (ej. 142 - 168).
* **Porcentajes:** El daño traducido al HP máximo del defensor (ej. 67.2% - 79.4%).
* **Análisis de KO:** Cálculo exacto de cuántos golpes se necesitan para debilitar al rival (ej. 2HKO) y su probabilidad porcentual.

## 4. Capa de Explicabilidad (Explainability)
El principal diferenciador funcional de PokeGuide es no solo mostrar *cuánto* daño se hace, sino *por qué*.
El motor extrae los factores que alteraron el resultado estándar (Modificadores) y los devuelve en un array estructurado (`BattleExplanationFactor`):
* Efectividad de Tipos (x2, x0.5, etc.)
* STAB (Same Type Attack Bonus)
* Potenciadores de Clima (ej. Sol incrementando ataques tipo Fuego)
* Objetos Equipados (ej. *Life Orb* x1.3)

## 5. UI Guardrails y Restricciones Estrictas
La capa de Presentación (React) implementa validaciones dependientes para evitar estados imposibles en el juego real:
* **Filtro de Learnset:** El `<Combobox>` de movimientos solo muestra ataques que el Pokémon puede aprender (por nivel actual o MT). Si el nivel decrece, los movimientos inválidos se purgan.
* **Filtro de Habilidades:** La habilidad seleccionada se restringe al array de habilidades legales de la especie. Al cambiar de Pokémon, se evalúa si la habilidad sigue siendo válida.
* **Inyección Limpia:** El store consolida los opcionales en objetos sin valores `undefined` explícitos, garantizando compatibilidad con `exactOptionalPropertyTypes`.