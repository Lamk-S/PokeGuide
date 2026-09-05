# ADR 005: Arquitectura de Team Intelligence

## Estado
Aceptado

## Contexto
PokeGuide debe incluir una herramienta de construcción y análisis de equipos (Team Builder & Analyzer). El análisis de un equipo requiere evaluar la cobertura de tipos, redundancias defensivas, distribución de roles y velocidad. Si esta lógica se implementa directamente en los componentes visuales (React/Zustand), el código se volverá in-testeable, frágil y acoplado a la UI, impidiendo futuras integraciones (ej. simulaciones automáticas en background o reportes estáticos). 

Además, se requiere un sistema que brinde **Explainability** (Explicabilidad) al usuario, diciéndole *por qué* su equipo falla, sin depender de descripciones estáticas.

## Decisión
Se ha decidido aislar toda la lógica de "Team Intelligence" en la capa de **Dominio** y orquestarla mediante un Caso de Uso en la capa de **Aplicación**.

1. **Entidades Clave:** Se crea `PokemonTeam` como raíz del agregado para proteger las invariantes del equipo (máximo 6 miembros).
2. **Single Source of Truth:** `TypeChart.ts` centraliza las multiplicaciones de efectividad de tipos.
3. **Analizadores Puros:** Clases estáticas puras (ej. `DefensiveAnalyzer`) reciben el equipo y retornan métricas en bruto (`TypeExposure`).
4. **Recommendation Engine (Determinista):** En lugar de usar modelos de IA (LLMs) que introducen latencia, costos y alucinaciones, el motor evalúa las métricas en bruto usando un árbol de reglas de negocio deterministas. Esto garantiza respuestas inmediatas (0 latencia) y consistentes.
5. **Orquestación:** `AnalyzeTeamUseCase` une los analizadores y entrega un objeto DTO (`TeamAnalysis`) limpio a la presentación.

## Alternativas Consideradas
* **Cálculo dentro de React Components:** Descartado categóricamente. Rompe *Clean Architecture* y hace imposible probar los algoritmos de análisis sin montar un DOM virtual (jsdom).
* **Uso de IA generativa para el feedback:** Descartado. La inteligencia competitiva requiere precisión matemática exacta. Un LLM podría equivocarse en las resistencias o inventar un análisis. El enfoque basado en reglas (Rule-based engine) es 100% determinista.
* **Evaluación en Backend:** Descartado para mantener el principio de *Local-First* y respuesta en tiempo real en cada cambio de slider/dropdown.

## Consecuencias

### Positivas
* **Testabilidad 100%:** Las reglas de recomendación pueden probarse en milisegundos con tests unitarios.
* **Reusabilidad:** El `AnalyzeTeamUseCase` podrá ser invocado en el futuro por una CLI o un script de optimización automatizado.
* **Rendimiento:** Las funciones puras aseguran que la UI permanezca fluida.

### Negativas
* Se requiere mantener a mano las reglas dentro de `RecommendationEngine`. A medida que el análisis se vuelva más profundo (Roles, Velocidad), este motor requerirá una arquitectura de plugins o patrones *Chain of Responsibility* para no convertirse en un archivo gigante.