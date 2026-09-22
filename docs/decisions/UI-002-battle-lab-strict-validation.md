# UI 002: UI Strict Dependency Validation (Battle Lab)

## Contexto
El simulador de batalla permite ingresar variables competitivas (Nivel, Movimiento, Habilidad). Sin restricciones, un usuario podría simular escenarios irreales (ej. Pikachu con Terremoto).

## Decisión
Se implementa una validación "Top-Down" reactiva en la UI. 
1. El Pokémon dicta las Habilidades.
2. El Nivel + Pokémon dictan los Movimientos (Learnset).
3. Cualquier cambio en un ancestro (Pokémon/Nivel) purga en cascada los descendientes inválidos en el `useBattleStore`.

## Actualización v1.2.1: Validación de EVs y Naturaleza

**Nueva regla v1.2.1:**

4. **EVs - Límite 510 con restante dinámico:**
   - Total EVs no puede superar 510 (regla oficial).
   - Cada stat EV tiene `maxForThisStat = min(252, 510 - (total - currentStat))`.
   - UI: botón MAX adaptativo muestra `6` cuando quedan 6, no siempre `252`. Si `remaining=0`, botón deshabilitado. Evita `0 0 0` distorsionado de `image_6fe744.png`.
   - Barra de progreso: `0/510 · quedan 510` → `510/510 · lleno`, verde cuando completo, rojo si >510.

5. **Naturaleza - Validación de tipo:**
   - `Nature` es objeto `{ name, nameEs, increasedStat, decreasedStat }`, nunca string. `Combobox value` debe ser `nature.name` (string) y `onChange` mapea a objeto completo via `NATURES.find()`. Fix TS2367 `string vs Nature no overlap`.

6. **IVs/EVs - Separación de concerns:**
   - IVs solo en sección IVs, EVs solo en sección EVs. No mezclar ambos en misma fila (fix distorsión móvil).

## Consecuencias
- **Positivo:** Prevención total de escenarios imposibles. Alta fiabilidad de la herramienta.
- **Positivo (v1.2.1):** EVs competitivos reales (252/252/6 spread), UX sin confusión de botones duplicados.
- **Negativo:** Mayor complejidad en los `useEffect` y derivaciones de estado (`useMemo`) en los componentes cliente.
- **Negativo (v1.2.1):** Requiere recalcular `remaining` en cada render de EV row, pero es O(1) y barato.