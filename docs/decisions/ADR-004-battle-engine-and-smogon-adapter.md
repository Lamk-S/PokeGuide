# ADR 004: Motor de Batalla y Adaptador de Smogon

## Estado
Aceptado

## Contexto
El "Battle Lab" de PokeGuide requiere calcular el daño resultante de un ataque, considerando cientos de variables: fórmulas generacionales, debilidades, resistencias, STAB, climas, terrenos, objetos (ej. *Life Orb*, *Choice Band*), habilidades y tiradas aleatorias (Damage Rolls). 
Implementar y mantener estas fórmulas matemáticas desde cero para 9 generaciones es un esfuerzo masivo y propenso a errores que desviaría el foco del proyecto de su objetivo real: la Inteligencia Competitiva y la Explicabilidad.

## Decisión
Se ha decidido incorporar la librería oficial de la comunidad competitiva: `@smogon/calc`, pero bajo una estricta regla arquitectónica: **aislamiento total mediante el Patrón Adapter**.

1. **Puerto de Dominio:** Se define la interfaz `BattleCalculator` y las entidades `BattleScenario`, `BattlePokemon` y `BattleResult` de forma puramente interna en PokeGuide.
2. **Adaptador de Infraestructura:** Se crea la clase `SmogonCalculatorAdapter` que implementa el `BattleCalculator`. Esta clase es el único lugar del proyecto donde se importa `@smogon/calc`.
3. **Flujo Invertido:** La interfaz gráfica (UI) y los Casos de Uso solo conocen las entidades de PokeGuide. 

## Alternativas Consideradas
* **Implementar las fórmulas de daño desde cero:** Descartado. La cantidad de excepciones matemáticas (edge-cases) históricas consumiría los recursos del proyecto.
* **Llamar a `@smogon/calc` directamente desde los componentes React:** Descartado categóricamente. Acoplaría la vista a contratos de datos de terceros, haciendo la aplicación frágil a actualizaciones de la librería e in-testeable.

## Consecuencias

### Positivas
* **Precisión Absoluta:** Garantizamos que los cálculos de daño sean 100% fieles al juego real.
* **Arquitectura Limpia:** Si en el futuro `@smogon/calc` deja de mantenerse o decidimos migrar a otro motor (por ejemplo, Rust/WASM para extrema velocidad), solo se modificará el archivo `SmogonCalculatorAdapter.ts`. El resto de la aplicación permanecerá intacto.

### Negativas
* Introducimos una dependencia externa crítica.
* El Adaptador debe lidiar con algunas inconsistencias de tipado de la librería externa (ej. falta de tipos exportados para Clima/Terreno), las cuales se mitigan con interfaces locales estrictas.