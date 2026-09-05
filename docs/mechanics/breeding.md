# Mecánicas de Crianza (Breeding Planner)

Este documento detalla cómo PokeGuide modela la herencia genética para la planificación de crianza.

## 1. Reglas Generacionales (`GenerationRules`)
El motor evalúa las reglas según la generación solicitada. Actualmente, se garantiza soporte para las mecánicas modernas:

* **Gen VI y Gen IX (Soportadas):**
  * `Destiny Knot` permite heredar hasta 5 IVs de los padres.
  * `Everstone` garantiza el 100% de herencia de la naturaleza del portador.
  * Los movimientos huevo (`Egg Moves`) pueden transferirse.

* **Gen III, IV y V (No Soportadas / En Progreso):**
  * Las reglas heredan un máximo de 3 IVs.
  * La probabilidad de `Everstone` varía (50% en Gen 4).
  * El motor devuelve `Unsupported` explícitamente para evitar dar planes estadísticamente incorrectos a los usuarios.

## 2. Prevención de Ciclos y Poda (State Deduplication)
Para evitar que el algoritmo evalúe cruces inútiles, cada estado de crianza genera una huella única (Hash) basada en la especie actual, la naturaleza y los rasgos ya heredados.
Si el motor encuentra un estado genético que ya fue visitado en la misma o menor cantidad de pasos, esa rama se poda inmediatamente.

## 3. Explicabilidad (Evidence)
El `BreedingPlan` no solo dice "Cría X con Y". Cada `BreedingStep` generado contiene un objeto `BreedingEvidence`, el cual incluye:
* La regla utilizada (ej. `DESTINY_KNOT_5IV`).
* La descripción textual de por qué el paso funciona en esa generación.
* Los rasgos faltantes (`remainingRequirements`) para alcanzar el objetivo.