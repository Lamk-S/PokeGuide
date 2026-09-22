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

## Actualización v1.2.1: Fix Naturaleza ES + IV/EV Separation + Header

**Problema v1.2.1:**
- Naturaleza no cambiaba visualmente porque `value` era objeto `Nature`, no `string`. Además mostraba inglés `Adamant` en lugar de español `Firme`.
- IVs/EVs en misma fila causaba distorsión móvil (`image_52acf9.png`, `image_ce5e89.png`): `IV 31 [slider] 31 EV 0 [slider] 0 252` todo en una línea.
- EVs con total 510 mostraba `0 0 0` / `6 0 6` duplicado y mensaje `Quedan 0 libres` por fila (`image_6fe744.png`).
- Header con doble título (`image_fa559c.png`): page.tsx + BattleLabView ambos con h1.

**Decisión v1.2.1:**
- **Naturaleza:** `NATURES` con `nameEs`. `natureOptions = { value: name, label: nameEs }`. `Combobox value={input.nature.name}`. `currentNatureLabel = input.nature.nameEs`. Fix TS2367 eliminando `typeof === "string"`.
- **IV/EV Separation:** Separar en `IvRow` y `EvRow`. IV solo: input + slider + botón 31. EV solo: input + slider + botones 0/max. `maxForThisStat = min(252, 510 - (total - current))`. Botón derecho adaptativo: si quedan 6, muestra `6`, no `252`. Si queda 0, deshabilitado gris. Mensaje restante solo en header de sección, no por fila.
- **Header:** Nuevo `Header.tsx` con logo Flame gradiente, nav pills `rounded-full`, active `bg-zinc-900 text-white`. `BattleLabView` header único con título + descripción generacional + Gen selector + badge estado. Documentar en `layout.tsx` que `app/battle-lab/page.tsx` no debe tener h1 propio si usa `BattleLabView`.
- **Mobile:** Stats overview `grid-cols-3 md:grid-cols-6`, `BattleSummary` solo 1 tipo en móvil, bottom bar con `pb-[env(safe-area-inset-bottom)]` y sin `N` de dev overlay.

## Consecuencias
- **Positivo:** Excelente rendimiento (Zustand permite suscribirse selectivamente sin re-renderizar hermanos).
- **Positivo:** Separación clara. El estado de la UI puede testearse sin montar el DOM.
- **Positivo (v1.1.2):** Sprites HD nítidos (`image-rendering: pixelated` para ani) y 0 errores de lint / terminal.
- **Positivo (v1.2.1):** Naturalezas en español, EVs con límite dinámico (UX competitiva real), sin distorsión móvil, header editorial único.
- **Negativo:** Requiere disciplina para no convertir los *stores* en monolitos. El store debe llamar a Casos de Uso, no implementar la matemática.