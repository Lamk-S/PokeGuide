# PokeGuide

> Competitive Pokémon Intelligence Platform

Analiza, simula y optimiza escenarios competitivos de Pokémon con explicaciones basadas en datos, algoritmos deterministas y reglas generacionales precisas.

[GitHub](https://github.com/Lamk-S/PokeGuide)

## ¿Qué problema resuelve?
Las herramientas tradicionales de Pokémon competitivo suelen ser calculadoras aisladas (solo daño, solo crianza). **PokeGuide** unifica esto en un ecosistema centralizado donde el resultado de un motor (Stat Engine) alimenta directamente a otro (Battle Lab o Breeding Planner), respetando las diferencias históricas (Gen III vs Gen IX).

## Engineering Highlights
Este proyecto es una demostración de **Arquitectura de Software y Domain-Driven Design**:
- **Domain-driven separation:** La lógica de negocio está 100% aislada de React.
- **Generation-aware rules:** Un motor central inyecta reglas históricas (ej. *Physical/Special split*) para evitar sentencias `if` anidadas y dispersas.
- **Deterministic optimization:** Uso de Búsqueda en Anchura (BFS) deduplicada mediante *State Hashing* para el planificador de crianza (Breeding Planner).
- **Quality Hardening:** Pruebas unitarias, de integración, invariantes de regresión y E2E (Vitest + Playwright) integrados en un CI Pipeline riguroso.

## Arquitectura

\`\`\`text
UI (Next.js / React)
  ↓
Application (Use Cases)
  ↓
Domain (Engines & Core Logic)
  ├── Stat Engine
  ├── Battle Lab
  ├── Team Intelligence
  ├── Build Optimization
  ├── Breeding Planner
  └── Generation Intelligence
  ↓
Infrastructure (Repositories / Data Adapters)
\`\`\`

## Getting Started

El entorno de desarrollo requiere [Node.js](https://nodejs.org/) v20+ y [pnpm](https://pnpm.io/).

\`\`\`bash
# Instalar dependencias
pnpm install

# Ejecutar validaciones y tests (Quality Gates)
pnpm lint
pnpm typecheck
pnpm test

# Iniciar servidor local
pnpm dev
\`\`\`

## Limitaciones Conocidas
* **UI Work-in-Progress:** Los motores de dominio están al 100% testeados, pero la conexión con la interfaz visual (Dashboards de React) se encuentra en estado de *placeholder*.
* **Soporte Generacional:** Gen VI y Gen IX están soportadas como prueba de concepto. Generaciones antiguas requieren el volcado del dataset correspondiente.

## Licencia
MIT. Pokémon es propiedad de Nintendo/Game Freak. Proyecto de fans no oficial.