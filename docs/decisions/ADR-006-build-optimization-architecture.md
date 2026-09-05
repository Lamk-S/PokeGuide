# ADR 006: Arquitectura de Build Optimization

## Decisión
Implementar un sistema de búsqueda matemática acotada en el Dominio (`SpeedOptimizer`, `SurvivalOptimizer`).
* **Búsqueda Estratégica:** En lugar de fuerza bruta (252^6 permutaciones), analizamos la monotonicidad. Para Speed, usamos Búsqueda Binaria `O(log N)` reduciendo el cálculo a máximo 6 iteraciones.
* **Explainability Matemática:** Al guardar el último candidato que falló (`low - 1`) y el primero que pasó (`mid`), generamos una prueba inmutable (ej. 163 falla, 164 pasa) para el usuario.
* **Reutilización:** Se inyecta `StatCalculator` (Bloque 2) para evaluar candidatos.