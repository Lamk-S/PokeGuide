# Mecánicas del Laboratorio de Batalla (Battle Lab)

## 1. El Escenario de Batalla (`BattleScenario`)
Agrupación de conceptos (v1.3.0):
1.  **Atacante (`BattleParticipant`):** IVs, EVs, Naturaleza, Objeto, Habilidad, Estado, y **Golpe Crítico** (ahora es estado local, listo para VGC/Dobles).
2.  **Defensor:** Contraparte.
3.  **Movimiento:** Poder base, tipo y categoría (dinámicamente evaluada).
4.  **Condiciones (`BattleConditions`):** Exclusivamente entorno global (Clima, Terreno, Gravedad).

## 2. Servicios de Dominio Puros (SRP)
En lugar de mezclar lógica condicional en la UI, PokeGuide delega las reglas a servicios especializados:
*   **`BattleStatusEffectService`:** Evalúa limpiamente interacciones complejas. Por ejemplo: sabe que si un Pokémon está quemado (*Burn*) pero ataca con un movimiento *Special* (ej. Bola Sombra) o tiene la habilidad *Guts* (Agallas), la reducción de daño de x0.5 no se aplica. 

## 3. Resolución Dinámica de Categorías (v1.3.0)
El simulador ya no adivina ni hardcodea la categoría de los ataques (`isPhysical = true`). El adaptador extrae la categoría exacta (Físico, Especial o Estado) directamente de la librería matemática en tiempo de ejecución, asegurando 100% de precisión sin importar el movimiento seleccionado.

## 4. Análisis de Daño y Explicabilidad
Factores traducidos a LatAm: STAB, Clima, Terreno, Crítico, Habilidades y Objetos. El sistema provee notas tácticas detalladas evaluando si un movimiento garantiza un KO o si un cambio de clima podría cambiar el curso del combate.