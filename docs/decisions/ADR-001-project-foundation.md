# ADR 001: Project Foundation

## Context
Se requiere establecer la base técnica para PokeGuide, garantizando escalabilidad, performance y mantenibilidad para cálculos intensivos.

## Decision
- **Next.js (App Router):** Para optimizar renderizado de métricas y aplicar Server Components.
- **pnpm:** Por su eficiencia y control estricto del node_modules.
- **Biome:** Sustituye a ESLint/Prettier por velocidad y unificación.
- **Zustand:** Manejo de estado ligero, solo cuando sea estrictamente necesario.
- **Vitest + Playwright:** Para unit testing (vital en fórmulas matemáticas) y flujos críticos E2E.
- **Local-First Data:** Para evitar latencia contra PokeAPI durante cálculos intensivos.

## Consequences
- Mayor carga inicial de configuración.
- El equipo técnico no podrá depender de dependencias mágicas; se exige código puro en el dominio.