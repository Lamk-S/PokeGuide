# Mecánicas de Cálculo de Estadísticas

Este documento detalla las fórmulas matemáticas utilizadas por el motor de cálculo de estadísticas de PokeGuide. Actualmente documenta el estándar moderno (Generación 3 en adelante).

## Variables
* **Base:** Estadística base de la especie del Pokémon.
* **IV:** Valor Individual (Individual Value). Rango: 0 a 31.
* **EV:** Puntos de Esfuerzo (Effort Values). Rango: 0 a 252 (Total máximo: 510).
* **Level:** Nivel del Pokémon. Rango: 1 a 100.
* **Nature:** Naturaleza del Pokémon (modificador de x1.1 o x0.9).

## Reglas de Redondeo
El motor utiliza `Math.floor()` de manera estricta. En Pokémon, los decimales siempre se truncan hacia abajo en cada paso intermedio, nunca se redondea al entero más cercano.

---

## 1. Cálculo de Puntos de Salud (HP)

La estadística de HP (Hit Points) tiene una fórmula exclusiva y no se ve afectada por la Naturaleza.

```text
HP = Math.floor(0.01 * (2 * Base + IV + Math.floor(EV / 4)) * Level) + Level + 10

```

### Excepciones (Edge Cases)

* **Shedinja:** Si la estadística Base de HP es exactamente `1`, el HP final siempre será `1`, ignorando EVs, IVs y Nivel.

---

## 2. Cálculo de Estadísticas (No-HP)

Para Ataque, Defensa, Ataque Especial, Defensa Especial y Velocidad, el cálculo se divide en dos pasos para respetar el redondeo del motor del juego.

### Paso A: Cálculo base (antes de la Naturaleza)

```text
Core = 2 * Base + IV + Math.floor(EV / 4)
PreStat = Math.floor(0.01 * Core * Level) + 5

```

### Paso B: Modificador de Naturaleza

Una vez obtenido el `PreStat`, se aplica el multiplicador de la naturaleza y se vuelve a aplicar un truncamiento hacia abajo.

```text
FinalStat = Math.floor(PreStat * NatureModifier)

```

**Modificadores:**

* Naturaleza favorable (ej. Jolly en Velocidad): `1.1`
* Naturaleza desfavorable (ej. Jolly en Ataque Especial): `0.9`
* Naturaleza neutral o estadística no afectada: `1.0`

---

## Diferencias Generacionales (Contexto Futuro)

* En **Gen 1 y Gen 2**, la mecánica de EVs (conocida entonces como *Stat Exp*) permitía maximizar todas las estadísticas simultáneamente.
* En **Gen 1 y Gen 2**, existía una única estadística de `Special` en lugar de Ataque Especial y Defensa Especial.
Estas mecánicas requerirán implementaciones de `GenerationRules` separadas cuando el motor ofrezca retro-compatibilidad.
