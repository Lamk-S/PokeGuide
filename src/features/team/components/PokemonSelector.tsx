"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import type { TeamMember } from "@/domain/team/types/TeamTypes";
import type {
  Pokemon,
  PokemonType,
  StatName,
} from "@/domain/pokemon/types/pokemon";
import { translateTypeToSpanish } from "../constants/typeTranslations";
import { PokemonSprite } from "@/components/ui/PokemonSprite";
import { usePokedexStore } from "@/features/pokemon/store/usePokedexStore";
import { calculateStats } from "@/domain/stats/services/StatCalculator";
import { NATURES } from "@/domain/stats/constants/natures";
import { IV } from "@/domain/stats/value-objects/IV";
import { EV } from "@/domain/stats/value-objects/EV";

interface Props {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onSelect: (member: TeamMember) => void;
  readonly replacingIndex: number | null;
}

const ROW_HEIGHT = 56;
const CONTAINER_HEIGHT = 420;
const OVERSCAN = 10;

function formatName(name: string): string {
  return name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getStat(
  stats: Readonly<Record<StatName, number>>,
  name: StatName,
): number {
  return stats[name] ?? 0;
}

function pokemonToTeamMember(pokemon: Pokemon): TeamMember {
  const neutralNature = NATURES.find((n) => n.name === "Hardy") ?? NATURES[0];
  const baseStats = pokemon.baseStats as Record<StatName, number>;

  const safeBase: Record<StatName, number> = {
    hp: baseStats.hp ?? 80,
    attack: baseStats.attack ?? 80,
    defense: baseStats.defense ?? 80,
    "special-attack": baseStats["special-attack"] ?? 80,
    "special-defense": baseStats["special-defense"] ?? 80,
    speed: baseStats.speed ?? 80,
  };

  const calculated = calculateStats({
    baseStats: safeBase,
    ivs: IV.createPerfectSet(),
    evs: EV.createEmptySet(),
    level: 50,
    nature: neutralNature,
    generation: 9,
  });

  const hp = calculated.hp;
  const atk = calculated.attack;
  const def = calculated.defense;
  const spa = calculated["special-attack"];
  const spd = calculated["special-defense"];
  const spe = calculated.speed;

  return {
    id: String(pokemon.id),
    name: formatName(pokemon.name),
    species: formatName(pokemon.name),
    types: pokemon.types as readonly PokemonType[],
    calculatedStats: {
      hp,
      attack: atk,
      defense: def,
      specialAttack: spa,
      specialDefense: spd,
      speed: spe,
      spAttack: spa,
      spDefense: spd,
    },
    baseStats: safeBase,
  } as unknown as TeamMember;
}

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

  const { pokemonList, isLoading, error, loadPokemon } = usePokedexStore();

  useEffect(() => {
    if (open) {
      void loadPokemon();
      const id = requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
      return () => cancelAnimationFrame(id);
    }
    setQuery("");
    setScrollTop(0);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [open, loadPokemon]);

  const filtered = useMemo(() => {
    if (!query) return pokemonList;
    const q = query.toLowerCase().trim();
    if (!q) return pokemonList;

    return pokemonList.filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(q);
      const idMatch =
        String(p.id) === q || String(p.id).padStart(3, "0").includes(q);
      if (nameMatch || idMatch) return true;

      const typesEn = p.types.join(" ").toLowerCase();
      const typesEs = p.types
        .map((t) => translateTypeToSpanish(t).toLowerCase())
        .join(" ");
      return typesEn.includes(q) || typesEs.includes(q);
    });
  }, [pokemonList, query]);

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

  const visibleSlice = useMemo(
    () => filtered.slice(virtual.start, virtual.end),
    [filtered, virtual.start, virtual.end],
  );

  const onScroll = useCallback(() => {
    if (!scrollRef.current) return;
    setScrollTop(scrollRef.current.scrollTop);
  }, []);

  const handleSelect = useCallback(
    (pokemon: Pokemon) => {
      const member = pokemonToTeamMember(pokemon);
      onSelect(member);
      onClose();
      setQuery("");
    },
    [onSelect, onClose],
  );

  if (!open) return null;
  if (typeof document === "undefined") return null;

  const isEmpty = !isLoading && filtered.length === 0;
  const hasData = pokemonList.length > 0;

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-end justify-center bg-zinc-950/20 backdrop-blur-[2px] sm:items-center sm:p-4">
      <div className="flex max-h-[90vh] w-full max-w-120 flex-col overflow-hidden rounded-t-[20px] border border-zinc-200 bg-white shadow-[0_16px_64px_rgba(0,0,0,0.12)] sm:rounded-[16px]">
        <div className="border-b border-zinc-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-[18px] font-semibold tracking-[-0.02em] text-zinc-900">
                {replacingIndex !== null
                  ? `Cambiar espacio ${replacingIndex + 1}`
                  : "Añadir Pokémon"}
              </h2>
              <p className="mt-1 text-[11px] text-zinc-500">
                {isLoading
                  ? "Cargando Pokédex..."
                  : hasData
                    ? `${filtered.length} de ${pokemonList.length} • NV.50`
                    : "Sin datos"}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
              aria-label="Cerrar"
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
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-zinc-400">
                ⌕
              </span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre, ID o tipo — ej. Gengar, 94, Fantasma"
                className="w-full rounded-[10px] border border-zinc-200 bg-zinc-50 py-2.5 pl-9 pr-3.5 text-[13px] outline-none placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white"
              />
            </div>
            {error && (
              <div className="mt-2 rounded-[8px] bg-red-50 px-2.5 py-1.5 text-[11px] text-red-700">
                {error}
              </div>
            )}
          </div>
        </div>

        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="relative flex-1 overflow-y-auto bg-white"
          style={{ height: CONTAINER_HEIGHT, maxHeight: CONTAINER_HEIGHT }}
        >
          {isLoading ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-16">
              <div className="size-6 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
              <p className="text-[13px] text-zinc-600">
                Cargando {pokemonList.length > 0 ? pokemonList.length : ""}{" "}
                Pokémon desde dataset.json...
              </p>
              <p className="text-[11px] text-zinc-400">
                Local-first • NV.50 • Stats reales con IV 31 • Sprites fallback
              </p>
            </div>
          ) : isEmpty ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 py-16 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-zinc-100 text-[16px]">
                ◐
              </div>
              <p className="text-[13px] font-medium text-zinc-900">
                Sin resultados para &quot;{query}&quot;
              </p>
              <p className="max-w-72 text-[11px] leading-normal text-zinc-500">
                Prueba con nombre, ID o tipo en español (Acero, Hada, Fantasma).
              </p>
            </div>
          ) : !hasData ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 py-16 text-center">
              <p className="text-[13px] text-zinc-600">dataset.json vacío</p>
              <p className="text-[11px] text-zinc-400">
                Verifica data/pokemon/dataset.json y custom-forms.json
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
                  const displayName = formatName(pokemon.name);
                  const speed = getStat(pokemon.baseStats, "speed") || 80;
                  return (
                    <button
                      type="button"
                      key={pokemon.id}
                      onClick={() => handleSelect(pokemon)}
                      className="group flex h-14 w-full items-center gap-3 border-b border-zinc-50 px-4 text-left transition-colors hover:bg-zinc-50"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-zinc-50 group-hover:bg-white">
                        <PokemonSprite
                          pokemon={{ id: pokemon.id, name: pokemon.name }}
                          size={36}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-[13px] font-medium text-zinc-900">
                            {displayName}
                          </span>
                          <span className="rounded bg-zinc-100 px-1 py-0.5 text-[10px] font-mono tabular-nums text-zinc-500">
                            #{String(pokemon.id).padStart(3, "0")}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-1">
                          {pokemon.types.map((t) => (
                            <span
                              key={t}
                              className="rounded-[6px] bg-zinc-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-zinc-600"
                            >
                              {translateTypeToSpanish(t)}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="hidden text-[11px] tabular-nums text-zinc-400 sm:block">
                          VEL {speed}
                        </span>
                        <span className="flex size-6 items-center justify-center rounded-full bg-zinc-900 text-[12px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                          +
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-zinc-100 bg-zinc-50/80 px-4 py-2.5 text-[11px] leading-normal text-zinc-500">
          <div className="flex items-center justify-between">
            <span>{pokemonList.length} Pokémon • NV.50</span>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
