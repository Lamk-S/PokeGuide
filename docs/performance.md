# Políticas de Rendimiento - PokeGuide

## 1. Core Web Vitals - Objetivos
*   **LCP < 2.5s:** Sprites activos en `Battle Lab` con `fetchPriority="high"` y `next/image` con `priority`.
*   **INP < 200ms:** `BreedingGraphSearch` (BFS) corre en cliente pero con `MAX_ITERATIONS=1000` y `visited Set`. Si supera 200ms en gama baja, mover a Web Worker (futuro).
*   **CLS < 0.1:** Reservar espacio con `aspect-ratio` para gráficos y resultados. `main-content` tiene `min-h-screen`.

## 2. Rendering Strategy
*   **Server Components por defecto:** `GenerationRulesProvider`, `GenerationComparisonService` y `CompareGenerationsUseCase` son puros, estáticos y memoizados con `Map`. Deben ejecutarse en servidor.
*   **Client Leaf Nodes:** `"use client"` solo en hojas: `ReportWebVitals`, `SkipLink`, sliders de EVs, selector de naturaleza. Nunca en `app/layout.tsx`.
*   **Memoización:** `GenerationRulesProvider` tiene `CACHE` interno. `GenerationComparison.getChangesByCategory()` hace `Object.freeze`.

## 3. Monitorización
*   `ReportWebVitals.tsx` usa `navigator.sendBeacon` + `keepalive: true` para no bloquear Main Thread.
*   Endpoint `/api/analytics/vitals` ingesta RUM. En dev solo `console.log`.
*   Alertar si INP > 200ms en Breeding Planner o LCP > 2.5s en Pokédex.