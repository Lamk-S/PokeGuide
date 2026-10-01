"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import type { TeamMember } from "@/domain/team/types/TeamTypes";
import type { PokemonType } from "@/domain/pokemon/types/pokemon";
import { usePokedexStore } from "@/features/pokemon/store/usePokedexStore";

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

function formatName(name: string): string {
  return name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function pokemonToTeamMember(pokemon: PokedexItem): TeamMember {
  const types = extractTypes(pokemon);
  const speed = extractSpeed(pokemon);
  return {
    id: String(pokemon.id),
    name: formatName(pokemon.name),
    species: formatName(pokemon.name),
    types,
    calculatedStats: {
      hp: 100,
      attack: 100,
      defense: 100,
      specialAttack: 100,
      specialDefense: 100,
      speed,
      spAttack: 100,
      spDefense: 100,
    },
  } as unknown as TeamMember;
}

interface Props {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onSelect: (member: TeamMember) => void;
  readonly replacingIndex: number | null;
}

const ROW_HEIGHT = 64;
const CONTAINER_HEIGHT = 384;
const OVERSCAN = 6;

export function PokemonSelector({
  open,
  onClose,
  onSelect,
  replacingIndex,
}: Props) {
  const [query, setQuery] = useState("");
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
      setScrollTop(0);
    }
  }, [open, pokemonList.length, loadPokemon]);

  const filtered = useMemo(() => {
    if (pokemonList.length === 0) return [] as ReadonlyArray<PokedexItem>;
    if (!query) return pokemonList;
    const q = query.toLowerCase().trim();
    if (!q) return pokemonList;
    return pokemonList.filter((p) => {
      const name = p.name.toLowerCase();
      const idMatch =
        String(p.id) === q || String(p.id).padStart(4, "0").includes(q);
      const typeMatch = extractTypes(p).some((t) =>
        t.toLowerCase().includes(q),
      );
      return name.includes(q) || idMatch || typeMatch;
    });
  }, [pokemonList, query]);

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
  const isSearching = query.length > 0;

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-end justify-center bg-zinc-950/20 backdrop-blur-[2px] sm:items-center">
      <div className="flex max-h-[85vh] w-full max-w-120 flex-col rounded-t-[20px] border border-zinc-200 bg-white shadow-[0_16px_64px_rgba(0,0,0,0.12)] sm:rounded-[16px]">
        <div className="border-b border-zinc-100 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-[18px] font-semibold tracking-[-0.02em] text-zinc-900">
              {replacingIndex !== null
                ? `Reemplazar espacio ${replacingIndex + 1}`
                : "Añadir Pokémon"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-zinc-100 p-1.5 text-zinc-500 hover:bg-zinc-200"
              aria-label="Cerrar selector"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <title>Cerrar</title>
                <path
                  d="M4 4L12 12M12 4L4 12"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
              </svg>
            </button>
          </div>
          <div className="mt-4">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, ID o tipo (ej. pikachu, 25, acero)"
              className="w-full rounded-[10px] border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-[13px] outline-none placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11px] tabular-nums text-zinc-500">
                {isLoadingStore
                  ? "Cargando Pokédex..."
                  : `${filtered.length} Pokémon ${isSearching ? `• filtrados de ${pokemonList.length}` : ""}`}
              </span>
              <span className="text-[10px] uppercase tracking-wide text-zinc-400">
                Virtualizado • 60fps
              </span>
            </div>
          </div>
        </div>

        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="relative flex-1 overflow-y-auto"
          style={{ height: CONTAINER_HEIGHT, maxHeight: CONTAINER_HEIGHT }}
        >
          {isLoadingStore ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
              <p className="text-[13px] text-zinc-500">
                Cargando más de 1000 Pokémon...
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 py-16 text-center">
              <p className="text-[13px] font-medium text-zinc-900">
                {isEmptyStore
                  ? "No hay datos de Pokédex"
                  : `Sin resultados para "${query}"`}
              </p>
              <p className="max-w-65 text-[11px] leading-[1.4] text-zinc-500">
                {isEmptyStore
                  ? "Verifica que usePokedexStore haya cargado. Revisa tu conexión a PokeAPI."
                  : "Intenta con otro nombre, ID o tipo. Ej. charizard, 150, fantasma."}
              </p>
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
                  return (
                    <button
                      type="button"
                      key={pokemon.id}
                      onClick={() => {
                        onSelect(member);
                        onClose();
                        setQuery("");
                      }}
                      className="flex h-16 w-full items-center justify-between border-b border-zinc-50 px-3 py-2 text-left transition-colors last:border-b-0 hover:bg-zinc-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-zinc-50 text-[11px] font-mono tabular-nums text-zinc-500">
                          #{String(pokemon.id).padStart(4, "0")}
                        </div>
                        <div>
                          <div className="text-[13px] font-[550] tracking-[-0.01em] text-zinc-900">
                            {displayName}
                          </div>
                          <div className="mt-1 flex gap-1">
                            {types.map((t) => (
                              <span
                                key={t}
                                className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-zinc-500"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] tabular-nums text-zinc-500">
                          VEL {speed}
                        </span>
                        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-400">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            aria-hidden="true"
                          >
                            <title>Añadir</title>
                            <path
                              d="M6 2.5V9.5M2.5 6H9.5"
                              stroke="currentColor"
                              strokeWidth="1.2"
                            />
                          </svg>
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-zinc-100 p-3 text-[11px] leading-[1.4] text-zinc-500">
          Datos reales de Pokédex • {pokemonList.length} especies •
          Virtualización nativa para 60fps.
        </div>
      </div>
    </div>,
    document.body,
  );
}
