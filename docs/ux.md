# Guías de Experiencia de Usuario (UX) - PokeGuide

## 1. Principios Fundamentales
*   **Claridad sobre Estética:** Un resultado de `Battle Lab` debe ser legible en 1 segundo. El número de daño va primero, el gráfico después.
*   **Prevención de Errores:** EVs máx 510, IVs 0-31, naturaleza. El input impide el error (slider con tope, no mensaje post-cálculo).
*   **Divulgación Progresiva:** `Breeding Planner` muestra 2 pasos por defecto. El árbol completo y la evidencia de `Everstone / Destiny Knot` está colapsado en "Ver detalles". `GenerationComparison` agrupa por `getChangesByCategory()` y muestra tabs, no una lista gigante.

## 2. Accesibilidad (WCAG 2.1 AA)
*   `SkipLink` apunta a `#main-content` con `tabIndex={-1}`. Todos los modales de confirmación deben hacer focus trap.
*   Estados vacíos (Empty State) accionables: 404 lleva a `/` y `/pokedex`, no solo a `/`.
*   `global-error.tsx` tiene `role="alert"` y `aria-live="assertive"`.

## 3. Consistencia de Interacción
*   **Destructivas:** Limpiar equipo en `Team Builder` requiere confirmación. Editar un Pokémon no.
*   **Feedback:** Optimización async -> Skeleton para layouts (tabla de generaciones), Spinner para botón (Calcular crianza). `ReportWebVitals` mide si el feedback llega en <200ms (INP).
*   **Lenguaje:** Español por defecto, términos competitivos en inglés (STAB, IVs, EVs) con tooltip.

## 3. Estrategia Responsive
*   **Mobile-First:** Comparación de generaciones: stacked cards <768px, tabla real >768px. Sprites con `width/height` fijo para evitar CLS.