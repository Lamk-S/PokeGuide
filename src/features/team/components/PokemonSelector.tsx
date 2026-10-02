"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import type { TeamMember } from "@/domain/team/types/TeamTypes";
import type { PokemonType } from "@/domain/pokemon/types/pokemon";
import { usePokedexStore } from "@/features/pokemon/store/usePokedexStore";
import { PokemonSprite } from "@/components/ui/PokemonSprite";

type PokedexItem = {
  readonly id: number;
  readonly name: string;
  readonly types?: ReadonlyArray<
    | string
    | { readonly type?: { readonly name?: string }; readonly name?: string }
  >;
  readonly baseStats?: Readonly<Record<string, number>>;
  readonly stats?: Readonly<Record<string, number>>;
};

const ALL_TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
] as const;

function extractTypes(pokemon: PokedexItem): readonly PokemonType[] {
  const raw = pokemon.types;
  if (!raw || raw.length === 0) return ["normal" as PokemonType];
  const parsed = raw
    .map((t) => {
      if (typeof t === "string") return t.toLowerCase();
      const obj = t as {
        readonly type?: { readonly name?: string };
        readonly name?: string;
      };
      return (obj.type?.name ?? obj.name ?? "normal").toLowerCase();
    })
    .filter((v): v is PokemonType => Boolean(v));
  return parsed.length > 0 ? parsed : (["normal" as PokemonType] as const);
}

function extractSpeed(pokemon: PokedexItem): number {
  const base = pokemon.baseStats as Record<string, number> | undefined;
  if (base) {
    if (typeof base.speed === "number") return base.speed;
    if (typeof base.Speed === "number") return base.Speed;
  }
  const stats = pokemon.stats as Record<string, number> | undefined;
  if (stats && typeof stats.speed === "number") return stats.speed;
  return 80;
}

function extractAllStats(pokemon: PokedexItem) {
  const base = (pokemon.baseStats ?? {}) as Record<string, number>;
  return {
    hp: base.hp ?? base.HP ?? 100,
    attack: base.attack ?? base.atk ?? 100,
    defense: base.defense ?? base.def ?? 100,
    specialAttack:
      base["special-attack"] ?? base.specialAttack ?? base.spAtk ?? 100,
    specialDefense:
      base["special-defense"] ?? base.specialDefense ?? base.spDef ?? 100,
    speed: extractSpeed(pokemon),
  };
}

function formatName(name: string): string {
  return name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function pokemonToTeamMember(pokemon: PokedexItem): TeamMember {
  const types = extractTypes(pokemon);
  const all = extractAllStats(pokemon);
  return {
    id: String(pokemon.id),
    name: formatName(pokemon.name),
    species: formatName(pokemon.name),
    types,
    calculatedStats: {
      hp: all.hp,
      attack: all.attack,
      defense: all.defense,
      specialAttack: all.specialAttack,
      specialDefense: all.specialDefense,
      speed: all.speed,
      spAttack: all.specialAttack,
      spDefense: all.specialDefense,
    },
  } as unknown as TeamMember;
}

interface Props {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onSelect: (member: TeamMember) => void;
  readonly replacingIndex: number | null;
}

const ROW_HEIGHT = 72;
const CONTAINER_HEIGHT = 420;
const OVERSCAN = 8;

export function PokemonSelector({
  open,
  onClose,
  onSelect,
  replacingIndex,
}: Props) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<PokemonType | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const pokemonList = usePokedexStore(
    (s) => s.pokemonList,
  ) as unknown as ReadonlyArray<PokedexItem>;
  const loadPokemon = usePokedexStore((s) => s.loadPokemon);
  const isLoadingStore = usePokedexStore(
    (s) => (s as unknown as { isLoading?: boolean }).isLoading ?? false,
  );

  useEffect(() => {
    if (open) {
      if (pokemonList.length === 0) {
        void loadPokemon();
      }
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
      setScrollTop(0);
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }
    } else {
      setQuery("");
      setTypeFilter(null);
      setScrollTop(0);
    }
  }, [open, pokemonList.length, loadPokemon]);

  const filtered = useMemo(() => {
    let list = pokemonList;
    if (typeFilter) {
      list = list.filter((p) => extractTypes(p).includes(typeFilter));
    }
    if (!query) return list;
    const q = query.toLowerCase().trim();
    if (!q) return list;
    return list.filter((p) => {
      const name = p.name.toLowerCase();
      const idMatch =
        String(p.id) === q || String(p.id).padStart(4, "0").includes(q);
      const typeMatch = extractTypes(p).some((t) =>
        t.toLowerCase().includes(q),
      );
      return name.includes(q) || idMatch || typeMatch;
    });
  }, [pokemonList, query, typeFilter]);

  const onScroll = useCallback(() => {
    if (!scrollRef.current) return;
    setScrollTop(scrollRef.current.scrollTop);
  }, []);

  const virtual = useMemo(() => {
    const total = filtered.length;
    const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
    const visibleCount =
      Math.ceil(CONTAINER_HEIGHT / ROW_HEIGHT) + OVERSCAN * 2;
    const end = Math.min(total, start + visibleCount);
    return {
      total,
      start,
      end,
      offsetY: start * ROW_HEIGHT,
      totalHeight: total * ROW_HEIGHT,
    };
  }, [filtered.length, scrollTop]);

  const visibleSlice = useMemo(() => {
    return filtered.slice(virtual.start, virtual.end);
  }, [filtered, virtual.start, virtual.end]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  const isEmptyStore = pokemonList.length === 0 && !isLoadingStore;
  const isSearching = query.length > 0 || typeFilter !== null;

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-end justify-center bg-zinc-950/30 backdrop-blur-[3px] sm:items-center sm:p-4">
      <div className="flex max-h-[90vh] w-full max-w-120 flex-col overflow-hidden rounded-t-[24px] border border-[#EDE8E0] bg-[#FFFEFB] shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:rounded-[20px]">
        <div className="border-b border-[#F0EDE6] bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-[18px] font-semibold tracking-[-0.02em] text-zinc-900">
                {replacingIndex !== null
                  ? `Cambiar espacio ${replacingIndex + 1}`
                  : "Añadir Pokémon"}
              </h2>
              <p className="mt-0.5 text-[11px] text-zinc-500">
                Determinista • 1351 especies • 60fps virtualizado
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-full border border-[#EDE8E0] bg-[#F8F5F0] text-zinc-500 transition-colors hover:border-zinc-900 hover:bg-zinc-900 hover:text-white"
              aria-label="Cerrar selector"
            >
              ✕
            </button>
          </div>

          <div className="mt-4">
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                ⌕
              </span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre, ID o tipo — ej. gengar, 94, fantasma"
                className="w-full rounded-[12px] border border-zinc-200 bg-zinc-50 py-2.5 pl-9 pr-3.5 text-[13px] outline-none placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white"
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setTypeFilter(null)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${typeFilter === null ? "bg-zinc-900 text-white" : "border border-[#EDE8E0] bg-white text-zinc-600 hover:border-zinc-900"}`}
              >
                Todos
              </button>
              {ALL_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() =>
                    setTypeFilter(typeFilter === t ? null : (t as PokemonType))
                  }
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide transition-colors ${typeFilter === t ? "bg-[#D93B32] text-white" : "border border-[#EDE8E0] bg-white text-zinc-600 hover:border-zinc-900 hover:text-zinc-900"}`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[11px] tabular-nums text-zinc-500">
                {isLoadingStore
                  ? "Cargando Pokédex..."
                  : `${filtered.length} Pokémon ${isSearching ? `• filtrados de ${pokemonList.length}` : ""}`}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#111] px-2 py-0.5 text-[10px] font-bold tracking-wide text-white">
                <span className="size-1 rounded-full bg-emerald-400 animate-pulse" />
                LOCAL-FIRST
              </span>
            </div>
          </div>
        </div>

        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="relative flex-1 overflow-y-auto bg-[#FFFEFB]"
          style={{ height: CONTAINER_HEIGHT, maxHeight: CONTAINER_HEIGHT }}
        >
          {isLoadingStore ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-16">
              <div className="size-8 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
              <p className="text-[13px] text-zinc-500">
                Cargando más de 1000 Pokémon...
              </p>
              <p className="text-[11px] text-zinc-400">
                Sprites con fallback chain home → artwork → base
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 py-16 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-[#F8F5F0] text-[18px]">
                ◐
              </div>
              <p className="text-[13px] font-medium text-zinc-900">
                {isEmptyStore
                  ? "No hay datos de Pokédex"
                  : `Sin resultados para "${query}"${typeFilter ? ` + ${typeFilter}` : ""}`}
              </p>
              <p className="max-w-65 text-[11px] leading-[1.4] text-zinc-500">
                {isEmptyStore
                  ? "Verifica que usePokedexStore haya cargado. Revisa tu conexión a PokeAPI."
                  : "Prueba con otro nombre, ID o tipo. O limpia el filtro de tipo."}
              </p>
              {typeFilter && (
                <button
                  type="button"
                  onClick={() => setTypeFilter(null)}
                  className="mt-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] hover:border-zinc-900"
                >
                  Limpiar filtro {typeFilter}
                </button>
              )}
            </div>
          ) : (
            <div style={{ height: virtual.totalHeight, position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  transform: `translateY(${virtual.offsetY}px)`,
                }}
              >
                {visibleSlice.map((pokemon) => {
                  const member = pokemonToTeamMember(pokemon);
                  const displayName = formatName(pokemon.name);
                  const types = extractTypes(pokemon);
                  const speed = extractSpeed(pokemon);
                  const stats = extractAllStats(pokemon);
                  return (
                    <button
                      type="button"
                      key={pokemon.id}
                      onClick={() => {
                        onSelect(member);
                        onClose();
                        setQuery("");
                      }}
                      className="group flex h-18 w-full items-center justify-between border-b border-[#F5F1E8] px-4 py-2 text-left transition-colors hover:bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-12 items-center justify-center overflow-hidden rounded-[12px] border border-[#F0EDE6] bg-[#F8F5F0] transition-colors group-hover:border-zinc-900 group-hover:bg-white">
                          <PokemonSprite
                            pokemon={{ id: pokemon.id, name: pokemon.name }}
                            size={44}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-semibold tracking-[-0.01em] text-zinc-900">
                              {displayName}
                            </span>
                            <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-mono tabular-nums text-zinc-500">
                              #{String(pokemon.id).padStart(3, "0")}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-1.5">
                            {types.map((t) => (
                              <span
                                key={t}
                                className="inline-flex items-center gap-1 rounded-full border border-[#EDE8E0] bg-white px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-zinc-600"
                              >
                                <span className="size-1 rounded-full bg-zinc-400" />
                                {t}
                              </span>
                            ))}
                            <span className="ml-1 hidden text-[10px] tabular-nums text-zinc-400 sm:inline">
                              {stats.hp}/{stats.attack}/{stats.defense} • VEL{" "}
                              {speed}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="hidden text-[11px] tabular-nums text-zinc-500 sm:block">
                          VEL {speed}
                        </span>
                        <span className="flex size-7 items-center justify-center rounded-full border border-[#EDE8E0] bg-white text-zinc-400 transition-all group-hover:border-zinc-900 group-hover:bg-zinc-900 group-hover:text-white">
                          <span className="text-[14px]">+</span>
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-[#F0EDE6] bg-[#FCFBF8] p-3 text-[11px] leading-[1.4] text-zinc-500">
          <div className="flex items-center justify-between">
            <span>Datos reales de Pokédex • {pokemonList.length} especies</span>
            <span className="rounded-full bg-white px-2 py-0.5 text-[10px]">
              Sprites fallback chain
            </span>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
