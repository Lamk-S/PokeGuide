# ADR 003: Arquitectura del Motor de Estadísticas (Stat Engine)

## Estado
Aceptado

## Contexto
PokeGuide necesita calcular las estadísticas finales de un Pokémon basándose en sus estadísticas base, IVs, EVs, nivel, naturaleza y generación. Si implementamos esta lógica matemática directamente dentro de los componentes de React o manejadores de estado (Zustand), acoplaremos fuertemente las reglas de negocio a la interfaz de usuario. Esto imposibilitaría reutilizar el motor para cálculos intensivos sin interfaz (como el futuro *Build Optimizer*) y dificultaría el testing determinista.

## Decisión
Se ha decidido implementar el **Stat Engine** como un módulo puro dentro de la capa de Dominio (`src/domain/stats/`).

La arquitectura se compone de:
1. **Value Objects:** `IV`, `EV` y `Level` validan sus límites matemáticos en el momento de instanciación. Ningún valor inválido puede llegar a la fórmula.
2. **Strategy Pattern para Generaciones:** Se define una interfaz `GenerationRules`. Las mecánicas específicas (ej. `Gen3PlusStatRules`) implementan esta interfaz, permitiendo extender el cálculo a generaciones antiguas (Gen 1-2) sin modificar el calculador principal.
3. **Inmutabilidad y Determinismo:** El `StatCalculator` es una función pura. Misma entrada garantiza siempre el mismo resultado. No hay dependencias de red, fechas, ni estado global.

## Consecuencias

### Positivas
* **Testabilidad:** Se puede alcanzar 100% de cobertura en la lógica matemática sin necesidad de montar un entorno DOM o de React.
* **Reusabilidad:** El motor puede ser invocado miles de veces por segundo por algoritmos de optimización sin penalización de renderizado.
* **Seguridad:** Los Value Objects garantizan que el sistema jamás procese un Pokémon con 300 EVs en una estadística o con Nivel 0.

### Negativas
* Mayor verbosidad inicial al requerir mapear las entradas de la UI hacia el objeto `StatCalculationInput` y sus respectivos Value Objects.

## Alternativas Consideradas
* **Cálculo in-component (React):** Descartado por violar separación de responsabilidades y bloquear la reutilización en algoritmos de fondo.
* **Cálculo en Backend (API):** Descartado porque introduciría latencia de red inaceptable para una herramienta interactiva donde los sliders de EV/IV deben actualizar las estadísticas en tiempo real.