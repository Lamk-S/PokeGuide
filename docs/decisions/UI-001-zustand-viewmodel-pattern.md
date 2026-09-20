# UI 001: Gestión de Estado Global con Patrón ViewModel (Zustand)

## Contexto
La interfaz de usuario de PokeGuide, especialmente en el `Battle Lab` y el `Breeding Planner`, maneja estados profundamente anidados y dependientes (ej. cambiar un Pokémon invalida sus movimientos y estadísticas). Utilizar `useState` y pasar *props* hacia abajo (Prop Drilling) haría los componentes frágiles e in-testeables. Por otro lado, usar React Context provocaría re-renderizados innecesarios en toda la vista.

## Decisión
Se decide implementar **Zustand** siguiendo el **Patrón ViewModel**.
La lógica de presentación y orquestación no reside en los componentes de React, sino en *stores* específicos por módulo (`useBattleStore`, `usePokedexStore`, `useItemStore`). Los componentes React quedan únicamente como hojas de renderizado tontas (Dumb Components) que se suscriben a fragmentos específicos del estado.

## Actualización v1.2.0: Editorial Clásica

Problema: screenshot con atacante expandido y defensor a mitad de pantalla, fuentes `text-lg font-black` y stats no distribuidos.

Decisión:
- `BattleLabView`: `grid grid-cols-1 lg:grid-cols-2 gap-8 items-start`. NUNCA centrar vertical. Cada card `self-start w-full`. Si una se expande, la otra se queda arriba.
- `ParticipantCard` header: `min-h- max-h-` grid `[48px_minmax(0,1fr)_auto]`. Sprite `w-11 h-11` (44x44) `bg-white border-zinc-100 rounded-lg`.
- Info: rol `text- uppercase tracking-[0.15em] text-zinc-400` arriba del nombre. Nombre `text-[13.5px] font-medium tracking-tight truncate` via `formatPokemonDisplayName()`. Lv pill sutil `bg-zinc-900 text-white text- px-1.5 py-0.5`. Habilidad/Naturaleza `text- text-zinc-500` sin badges negros.
- Stats: `grid grid-cols-6 gap-0 divide-x divide-zinc-100 border-l pl-3`, cada `min-w- text-center`, label `text- font-semibold uppercase tracking-widest text-zinc-400`, valor `text-[11.5px] font-medium tabular-nums text-zinc-700`. Móvil `grid-cols-3` abajo.
- Estética: solo zinc, `border-zinc-200/70`, `shadow-[0_1px_2px_rgba(0,0,0,0.04)]`, `p-4`, inputs `h-8 text-`, quitar `font-black`, `bg-black`, `rounded-full` pesados.
- Botón: fix `text-` roto -> `h-9 px-5 rounded-lg bg-zinc-900 text-white text- font-medium`.

Mantiene ViewModel: store da `pokemonId`, componente deriva sprite y display name. `SmogonSpeciesMapper` intacto.

## Consecuencias
- **Positivo:** Excelente rendimiento (Zustand permite suscribirse selectivamente sin re-renderizar hermanos).
- **Positivo:** Separación clara. El estado de la UI puede testearse sin montar el DOM.
- **Positivo (v1.1.2):** Sprites HD nítidos (`image-rendering: pixelated` para ani) y 0 errores de lint / terminal.
- **Negativo:** Requiere disciplina para no convertir los *stores* en monolitos. El store debe llamar a Casos de Uso, no implementar la matemática.