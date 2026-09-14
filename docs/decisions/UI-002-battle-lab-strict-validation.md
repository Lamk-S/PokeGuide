# UI 002: UI Strict Dependency Validation (Battle Lab)

## Contexto
El simulador de batalla permite ingresar variables competitivas (Nivel, Movimiento, Habilidad). Sin restricciones, un usuario podría simular escenarios irreales (ej. Pikachu con Terremoto).

## Decisión
Se implementa una validación "Top-Down" reactiva en la UI. 
1. El Pokémon dicta las Habilidades.
2. El Nivel + Pokémon dictan los Movimientos (Learnset).
3. Cualquier cambio en un ancestro (Pokémon/Nivel) purga en cascada los descendientes inválidos en el `useBattleStore`.

## Consecuencias
- **Positivo:** Prevención total de escenarios imposibles. Alta fiabilidad de la herramienta.
- **Negativo:** Mayor complejidad en los `useEffect` y derivaciones de estado (`useMemo`) en los componentes cliente.