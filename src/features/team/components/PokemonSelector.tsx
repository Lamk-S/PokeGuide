"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import type { TeamMember, BaseStats } from "@/domain/team/types/TeamTypes";
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
import { DEFAULT_BATTLE_RULESET } from "@/domain/team/config/battleFormat";
import { normalizeId } from "@/domain/shared/utils/normalizeId";

interface Props {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onSelect: (member: TeamMember) => void;
  readonly replacingIndex: number | null;
}

const ROW_HEIGHT = 56;
const CONTAINER_HEIGHT = 440;
const OVERSCAN = 12;

function displayNameEs(rawName: string): string {
  return rawName.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getStat(
  stats: Readonly<Record<StatName, number>>,
  name: StatName,
): number {
  return stats[name] ?? 0;
}

function pickNature(
  highest: StatName,
  second: StatName,
  baseStats: Record<StatName, number>,
) {
  const speed = baseStats.speed;
  const atk = baseStats.attack;
  const spa = baseStats["special-attack"];
  const find = (name: string) =>
    NATURES.find((n) => n.name === name) ?? NATURES[0];
  switch (highest) {
    case "attack":
      return speed >= 90 ? find("Jolly") : find("Adamant");
    case "special-attack":
      return speed >= 90 ? find("Timid") : find("Modest");
    case "speed":
      return atk > spa ? find("Jolly") : find("Timid");
    case "defense":
      return spa > atk ? find("Bold") : find("Impish");
    case "special-defense":
      return spa > atk ? find("Calm") : find("Careful");
    case "hp":
      if (second === "attack") return find("Adamant");
      if (second === "special-attack") return find("Modest");
      if (second === "speed") return find("Jolly");
      return find("Hardy");
    default:
      return find("Hardy");
  }
}

function toTeamMember(pokemon: Pokemon): TeamMember {
  const baseRaw = pokemon.baseStats as Record<StatName, number>;
  const safeBase: BaseStats = {
    hp: baseRaw.hp ?? 80,
    attack: baseRaw.attack ?? 80,
    defense: baseRaw.defense ?? 80,
    "special-attack": baseRaw["special-attack"] ?? 80,
    "special-defense": baseRaw["special-defense"] ?? 80,
    speed: baseRaw.speed ?? 80,
  };

  const sorted = (Object.entries(safeBase) as [StatName, number][]).sort(
    (a, b) => b[1] - a[1],
  );
  const highest = sorted[0][0];
  const second = sorted[1][0];
  const third = sorted[2][0];

  const nature = pickNature(highest, second, safeBase);

  const evsDist: Record<StatName, number> = {
    hp: 0,
    attack: 0,
    defense: 0,
    "special-attack": 0,
    "special-defense": 0,
    speed: 0,
  };
  evsDist[highest] = 252;
  evsDist[second] = 252;
  evsDist[third] = 4;

  const ivs = IV.createPerfectSet();
  const evs = EV.createSet(evsDist);
  const calculated = calculateStats({
    baseStats: safeBase,
    ivs,
    evs,
    level: DEFAULT_BATTLE_RULESET.level,
    nature,
    generation: DEFAULT_BATTLE_RULESET.generation,
  });

  const defaultAbility = pokemon.abilities?.[0]?.name ?? "";

  return {
    id: String(pokemon.id),
    name: normalizeId(pokemon.name),
    displayNameEs: displayNameEs(pokemon.name),
    species: displayNameEs(pokemon.name),
    types: pokemon.types as readonly PokemonType[],
    abilityId: defaultAbility ? normalizeId(defaultAbility) : null,
    itemId: null,
    ability: defaultAbility || null,
    item: null,
    nature,
    level: DEFAULT_BATTLE_RULESET.level,
    evs,
    ivs,
    calculatedStats: {
      hp: calculated.hp,
      attack: calculated.attack,
      defense: calculated.defense,
      specialAttack: calculated["special-attack"],
      specialDefense: calculated["special-defense"],
      speed: calculated.speed,
    },
    baseStats: safeBase,
  };
}

interface SearchIndex {
  readonly id: number;
  readonly name: string;
  readonly nameNorm: string;
  readonly displayEs: string;
  readonly displayNorm: string;
  readonly numberStr: string;
  readonly numberPadded: string;
  readonly typesEn: string;
  readonly typesEs: string;
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

  const searchIndex = useMemo<SearchIndex[]>(() => {
    return pokemonList.map((p) => {
      const nameNorm = normalizeId(p.name);
      const display = displayNameEs(p.name);
      return {
        id: p.id,
        name: p.name,
        nameNorm,
        displayEs: display,
        displayNorm: normalizeId(display),
        numberStr: String(p.id),
        numberPadded: String(p.id).padStart(3, "0"),
        typesEn: p.types.join(" ").toLowerCase(),
        typesEs: p.types
          .map((t) => translateTypeToSpanish(t).toLowerCase())
          .join(" "),
      };
    });
  }, [pokemonList]);

  const filtered = useMemo(() => {
    if (!query) return pokemonList;
    const q = normalizeId(query.trim());
    if (!q) return pokemonList;

    const matchedIds = new Set<number>();
    for (const entry of searchIndex) {
      if (
        entry.nameNorm.includes(q) ||
        entry.displayNorm.includes(q) ||
        entry.numberStr === q ||
        entry.numberPadded.includes(q) ||
        entry.typesEn.includes(q) ||
        entry.typesEs.includes(q)
      ) {
        matchedIds.add(entry.id);
      }
    }
    return pokemonList.filter((p) => matchedIds.has(p.id));
  }, [pokemonList, searchIndex, query]);

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
      const member = toTeamMember(pokemon);
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#111]/20 p-0 sm:items-center sm:p-6">
      <div className="flex max-h-[92vh] w-full max-w-130 flex-col border border-[#EDE8E0] bg-white shadow-[0_16px_48px_rgba(0,0,0,0.12)]">
        <div className="border-b border-[#EDE8E0] px-5 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-serif text-[18px] font-semibold tracking-[-0.02em] text-[#111]">
                {replacingIndex !== null
                  ? `Cambiar posición ${replacingIndex + 1}`
                  : "Añadir Pokémon"}
              </h2>
              <p className="mt-1 text-[11px] leading-normal text-zinc-600">
                {isLoading
                  ? "Cargando Pokédex local..."
                  : hasData
                    ? `${filtered.length} de ${pokemonList.length} · Nv. ${DEFAULT_BATTLE_RULESET.level} · 252/252/4 competitivo`
                    : "Sin datos"}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="border border-[#EDE8E0] bg-white px-2.5 py-1 text-[11px] text-zinc-600 hover:border-[#111] hover:text-[#111]"
              aria-label="Cerrar selector"
            >
              Cerrar
            </button>
          </div>

          <div className="mt-4">
            <label htmlFor="pokemon-search" className="sr-only">
              Buscar Pokémon
            </label>
            <div className="relative">
              <span
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                aria-hidden
              >
                ⌕
              </span>
              <input
                id="pokemon-search"
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre, número o tipo en español — ej. Gengar, 94, Fantasma"
                className="w-full border border-[#EDE8E0] bg-[#F8F5F0] py-2.5 pl-9 pr-3 text-[13px] outline-none placeholder:text-zinc-400 focus:border-[#111] focus:bg-white"
              />
            </div>
            {error && (
              <div className="mt-2 border border-red-200 bg-[#FEF2F2] px-2.5 py-1.5 text-[11px] text-red-800">
                {error}
              </div>
            )}
          </div>
        </div>

        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="relative flex-1 overflow-y-auto bg-white"
          style={{ height: CONTAINER_HEIGHT }}
        >
          {isLoading ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-16">
              <div className="h-5 w-5 animate-spin border-2 border-[#EDE8E0] border-t-[#111]" />
              <p className="text-[13px] text-zinc-600">
                Cargando {pokemonList.length > 0 ? pokemonList.length : ""}{" "}
                Pokémon...
              </p>
              <p className="text-[11px] text-zinc-500">
                Local-first · Nv.50 · 252/252/4 · Naturaleza favorable · 31 IVs
              </p>
            </div>
          ) : isEmpty ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 py-16 text-center">
              <p className="text-[13px] font-medium text-[#111]">
                Sin resultados para &quot;{query}&quot;
              </p>
              <p className="max-w-[32ch] text-[11px] leading-normal text-zinc-500">
                Prueba con nombre, número o tipo en español. La búsqueda es
                tolerante a mayúsculas y guiones.
              </p>
            </div>
          ) : !hasData ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 py-16 text-center">
              <p className="text-[13px] text-zinc-600">dataset.json vacío</p>
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
                  const display = displayNameEs(pokemon.name);
                  const speed =
                    getStat(
                      pokemon.baseStats as Record<StatName, number>,
                      "speed",
                    ) || 80;
                  return (
                    <button
                      type="button"
                      key={pokemon.id}
                      onClick={() => handleSelect(pokemon)}
                      className="group flex h-14 w-full items-center gap-3 border-b border-[#F5F1E8] bg-white px-4 text-left hover:bg-[#FFFEFB]"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#F8F5F0] group-hover:bg-white">
                        <PokemonSprite
                          pokemon={{ id: pokemon.id, name: pokemon.name }}
                          size={36}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-[13px] font-medium text-[#111]">
                            {display}
                          </span>
                          <span className="border border-[#EDE8E0] bg-[#F8F5F0] px-1 py-0.5 font-mono text-[10px] tabular-nums text-zinc-500">
                            #{String(pokemon.id).padStart(3, "0")}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-1">
                          {pokemon.types.map((t) => (
                            <span
                              key={t}
                              className="border border-[#EDE8E0] px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-zinc-600"
                            >
                              {translateTypeToSpanish(t)}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="hidden text-[11px] tabular-nums text-zinc-500 sm:block">
                          VEL {speed}
                        </span>
                        <span className="border border-[#111] bg-[#111] px-2 py-1 text-[11px] text-white opacity-0 group-hover:opacity-100">
                          Añadir
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-[#EDE8E0] bg-[#F8F5F0] px-4 py-2.5 text-[11px] leading-normal text-zinc-600">
          {pokemonList.length} Pokémon · Nv.{DEFAULT_BATTLE_RULESET.level} ·
          Auto-set competitivo · 252/252/4 · Gen{" "}
          {DEFAULT_BATTLE_RULESET.generation}
        </div>
      </div>
    </div>,
    document.body,
  );
}
