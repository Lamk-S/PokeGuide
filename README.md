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
- **Sprite System HD:** Resolución Id-first 100% estática `PokeAPI/sprites/.../other/home/{id}.png`, sin animaciones ni `MEGA_ARTWORK_ID`, corrige mapping cruzado de megas, soporta formas custom `-z` y caps. Display i18n via `PokemonDisplayName`.
- **Editorial UI:** Battle Lab con layout `items-start` + `self-start`, header compacto 72px, stats distribuidos uniforme, estética zinc clásica.

## Arquitectura

```
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
```

## Getting Started

El entorno de desarrollo requiere [Node.js](https://nodejs.org/?utm_source=gemini) v20+ y [pnpm](https://pnpm.io/?utm_source=gemini).

```bash
# Instalar dependencias
pnpm install

# Ejecutar validaciones y tests (Quality Gates)
pnpm lint
pnpm typecheck
pnpm test

# Iniciar servidor local
pnpm dev

```

## Limitaciones Conocidas

* **Soporte Generacional:** Gen VI y Gen IX están soportadas como prueba de concepto. Generaciones antiguas requieren el volcado del dataset correspondiente.

## Licencia

MIT. Pokémon es propiedad de Nintendo/Game Freak. Proyecto de fans no oficial.