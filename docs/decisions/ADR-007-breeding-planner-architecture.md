# ADR 007: Arquitectura del Planificador de Crianza (Breeding Planner)

## Estado
Aceptado

## Contexto
PokeGuide necesita un sistema que planifique cómo obtener un Pokémon competitivo desde cero. Las mecánicas de crianza (Breeding) cambian drásticamente entre generaciones, involucran objetos especiales (Everstone, Destiny Knot) y requieren heredar múltiples características (Naturaleza, Movimientos Huevo, IVs).
Programar scripts imperativos llenos de `if/else` para cada Pokémon haría que el sistema fuera inmantenible e incapaz de encontrar la ruta más corta.

## Decisión
Se ha decidido modelar la Crianza Pokémon como un **Problema de Búsqueda en Grafos**.
1. **Nodos (BreedingState):** Representan el estado genético de un huevo en un momento dado (ej. "Tiene Naturaleza y 1 IV").
2. **Aristas (BreedingStep):** Representan la acción de criar con otro progenitor para heredar una nueva característica.
3. **Algoritmo (BFS):** Dado que cada paso de crianza tiene el mismo costo (1 huevo / 1 ciclo), una Búsqueda en Anchura garantiza matemáticamente encontrar la ruta con el menor número de pasos.
4. **Reglas Aisladas:** Se utiliza `GenerationRules` como un diccionario estricto. Si una generación no está soportada (ej. Gen 4), el algoritmo aborta con estado `Unsupported`.

## Alternativas Consideradas
* **Fuerza bruta de combinaciones genéticas:** Descartado por explosión combinatoria.
* **A* (A-Star):** Descartado inicialmente porque para un máximo de ~5 rasgos a heredar, la sobrecarga de calcular heurísticas complejas es mayor que el beneficio sobre un BFS con deduplicación de estados (Hashing).

## Consecuencias
* **Positivas:** El algoritmo es agnóstico del Pokémon. Puede encontrar rutas óptimas para cualquier especie. La inmutabilidad garantiza que no haya mutaciones accidentales en el historial.
* **Negativas:** La deduplicación de estados (`IdentityHash`) debe ser muy precisa; de lo contrario, el motor podría entrar en bucles infinitos evaluando al mismo Pokémon repetidamente.