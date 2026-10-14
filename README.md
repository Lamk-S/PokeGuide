# PokeGuide

> Competitive Pokémon Intelligence Platform

Analiza, simula y optimiza escenarios competitivos de Pokémon con explicaciones basadas en datos, algoritmos deterministas y reglas generacionales precisas. Hecho con foco en la comunidad competitiva hispanohablante.

## Engineering Highlights
Este proyecto es una demostración de **Arquitectura de Software y Domain-Driven Design**:
- **Domain-driven separation:** La lógica de negocio está 100% aislada de React.
- **Domain-Driven i18n Isolation:** Uso de Value Objects y Mappers para permitir interfaces en español sin corromper el núcleo matemático en inglés.
- **VGC-Ready Architecture:** Estados locales estrictos (como Golpes Críticos individuales por Pokémon) para evitar contaminación de variables globales.
- **Deterministic optimization:** Uso de Búsqueda en Anchura (BFS) deduplicada mediante *State Hashing* para el planificador de crianza.
- **Quality Hardening:** Pruebas unitarias evaluando matrices matemáticas complejas, TypeScript estricto con `noUncheckedIndexedAccess`, y pruebas E2E (Playwright) en CI.
- **UI de Alta Densidad (React Portals & Zustand):** Implementación de layouts densos controlados con patrones ViewModel apoyados en Selectores Atómicos para prevenir renderizados inútiles, y Portals para máximo rendimiento (60fps).
- **Error & Loading Boundaries Granulares:** Interfaces resilientes y tiempos de respuesta (LCP) perceptibles instantáneos ante comportamientos asíncronos gracias a la arquitectura nativa del App Router de Next.js.

## Arquitectura


```

UI (Next.js / React)
↓
Application (Use Cases)
↓
Domain (Engines & Core Logic)
├── Stat Engine (requiere generation)
├── Battle Lab (EV remaining logic + naturaleza ES)
├── Team Intelligence
├── Build Optimization
├── Breeding Planner
└── Generation Intelligence
↓
Infrastructure (Repositories / Data Adapters)

```

## Getting Started

El entorno de desarrollo requiere [Node.js](https://nodejs.org/es) v24+ y [pnpm](https://pnpm.io/).

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

## Novedades v1.4.0 (Phase 5)

* **Optimización Total en UI:** Refactorización a Selectores Atómicos en Zustand.
* **Tolerancia a Fallos Avanzada:** Implementación de Error Boundaries granulares, `loading.tsx` y `global-error.tsx`. Corrección visual para los caracteres de escape de Tailwind CSS en JSX.
* **TypeScript Endurecido:** Activación de barreras estrictas en la compilación (`noUncheckedIndexedAccess`). Eliminación profunda de código obsoleto.

## Novedades v1.3.0

* **Aislamiento del Modelo de Dominio:** Normalización de traducciones (Value Objects) para proteger el motor de cálculo.
* **Falsos positivos matemáticos resueltos:** Categorización dinámica pura de movimientos.
* **Refactorización VGC:** Escalamiento del estado local (Críticos) para soportar futuros combates Dobles.

## Licencia

[LICENSE](./LICENSE). Pokémon es propiedad de Nintendo/Game Freak. Proyecto de fans no oficial.