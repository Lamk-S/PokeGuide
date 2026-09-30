# Guías de Experiencia de Usuario (UX) - PokeGuide

## 1. Principios Fundamentales
*   **Claridad sobre Estética:** Un resultado de `Battle Lab` debe ser legible en 1 segundo. El número de daño va primero, el gráfico después.
*   **Prevención de Errores:** EVs máx 510, IVs 0-31, naturaleza. El input impide el error (slider con tope, no mensaje post-cálculo).
*   **Divulgación Progresiva:** `Breeding Planner` muestra 2 pasos por defecto. `GenerationComparison` agrupa por `getChangesByCategory()` y muestra tabs.

## 2. Accesibilidad (WCAG 2.1 AA)
*   `SkipLink` apunta a `#main-content` con `tabIndex={-1}`. Todos los modales de confirmación deben hacer focus trap.
*   Estados vacíos (Empty State) accionables: 404 lleva a `/` y `/pokedex`.
*   `global-error.tsx` tiene `role="alert"` y `aria-live="assertive"`.

## 3. Consistencia de Interacción
*   **Sincronización Local vs Global:** Las variables que pertenecen a un Pokémon específico (como el *Golpe Crítico*) están atadas a su estado local (Participant Card). Al pulsar "Intercambiar", estas variables viajan con el Pokémon o se reinician, evitando falsos positivos que arruinen la toma de decisiones.
*   **Destructivas:** Limpiar equipo en `Team Builder` requiere confirmación. Editar un Pokémon no.
*   **Feedback:** Optimización async -> Skeleton para layouts, Spinner para botón. 
*   **Lenguaje:** Español por defecto en la UI, manteniendo la exactitud y los mapeos internos en inglés inmutables.

## 4. Estrategia Responsive
*   **Mobile-First:** Comparación de generaciones: stacked cards <768px, tabla real >768px. Componentes complejos como Combobox usan React Portals para evitar cortes de overflow en pantallas pequeñas.