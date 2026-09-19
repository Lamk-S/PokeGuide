# UI 001: Gestión de Estado Global con Patrón ViewModel (Zustand)

## Contexto
La interfaz de usuario de PokeGuide, especialmente en el `Battle Lab` y el `Breeding Planner`, maneja estados profundamente anidados y dependientes (ej. cambiar un Pokémon invalida sus movimientos y estadísticas). Utilizar `useState` y pasar *props* hacia abajo (Prop Drilling) haría los componentes frágiles e in-testeables. Por otro lado, usar React Context provocaría re-renderizados innecesarios en toda la vista.

## Decisión
Se decide implementar **Zustand** siguiendo el **Patrón ViewModel**.
La lógica de presentación y orquestación no reside en los componentes de React, sino en *stores* específicos por módulo (`useBattleStore`, `usePokedexStore`, `useItemStore`). Los componentes React quedan únicamente como hojas de renderizado tontas (Dumb Components) que se suscriben a fragmentos específicos del estado.

## Actualización v1.1.2: Sprite Rendering
`PokemonSprite` sigue siendo Dumb Component pero ahora cumple con Biome y Next.js 15:

- Usa `next/image` con `fill` dentro de contenedor `relative` de tamaño fijo. Evita warnings de `width or height modified`.
- Usa `useMemo([pokemon, hd])` y `useEffect([chain])` con lectura de `chain.length` para resetear fallback sin violar `useExhaustiveDependencies`.
- `ParticipantCard` añade `key={`${id}-${name}`}` al sprite para forzar remount y evitar stale closure del índice de fallback (bug base/mega).

Esto mantiene el principio ViewModel: el store solo da `pokemonId`, el componente deriva la cadena de sprites.

## Consecuencias
- **Positivo:** Excelente rendimiento (Zustand permite suscribirse selectivamente sin re-renderizar hermanos).
- **Positivo:** Separación clara. El estado de la UI puede testearse sin montar el DOM.
- **Positivo (v1.1.2):** Sprites HD nítidos (`image-rendering: pixelated` para ani) y 0 errores de lint / terminal.
- **Negativo:** Requiere disciplina para no convertir los *stores* en monolitos. El store debe llamar a Casos de Uso, no implementar la matemática.