# Mecánicas de Optimización (Build Optimizer)

## Búsqueda de Velocidad (Speed Optimization)
* **Objetivo:** Encontrar el mínimo esfuerzo (EVs) requerido para alcanzar o superar una Velocidad objetivo (`Target Speed`).
* **Algoritmo:** Binary Search. El dominio de EV útil es `[0, 4, 8, 12 ... 252]`. Al ser la fórmula de estadística monotónicamente creciente, dividimos el arreglo a la mitad y probamos la estadística con el `Stat Engine`.
* **Complejidad:** `O(log N)`. Garantiza encontrar el óptimo matemático evaluando máximo 6 configuraciones en menos de `0.1ms`.

## Búsqueda de Supervivencia (Survival Optimization)
* **Objetivo:** Encontrar la suma mínima de EVs en HP y Defensa (o Defensa Especial) que garantice que un ataque rival no logre un OHKO.
* **Algoritmo:** `Branch and Bound + Binary Search`. Al ser un problema de 2 variables, iteramos los 64 valores posibles de HP. Por cada iteración, hacemos una Búsqueda Binaria sobre los EVs de Defensa para encontrar el punto exacto de supervivencia.
* **Poda (Pruning):** Si el EV iterado de HP ya es mayor o igual al "mejor total" (`bestTotalEVs`) encontrado en iteraciones anteriores, abortamos la búsqueda instantáneamente porque cualquier Defensa añadida empeorará el resultado.
* **Complejidad:** `O(N log N)`. Evalúa un máximo aproximado de ~250 escenarios de los 4096 posibles. Tarda `< 2ms` en encontrar el resultado matemático perfecto.