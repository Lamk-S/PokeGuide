"use client";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PokemonSprite } from "@/components/ui/PokemonSprite";
import { resolveBaseName } from "@/domain/pokemon/mappers/PokemonIdMapper";
import type { PokemonType, StatName } from "@/domain/pokemon/types/pokemon";
import { normalizeId } from "@/domain/shared/utils/normalizeId";
import { NATURES } from "@/domain/stats/constants/natures";
import { calculateStats } from "@/domain/stats/services/StatCalculator";
import type { Nature } from "@/domain/stats/types/StatTypes";
import { EV } from "@/domain/stats/value-objects/EV";
import { IV } from "@/domain/stats/value-objects/IV";
import { DEFAULT_BATTLE_RULESET } from "@/domain/team/config/battleFormat";
import type { BaseStats, TeamMember } from "@/domain/team/types/TeamTypes";
import { usePokedexStore } from "@/features/pokemon/store/usePokedexStore";
import type { PokemonFull } from "@/infrastructure/local-data/repositories/local-pokemon.repository";
import { translateTypeToSpanish } from "../constants/typeTranslations";

interface Props {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onSelect: (member: TeamMember) => void;
  readonly replacingIndex: number | null;
}

const FALLBACK_NATURE: Nature = {
  name: "Hardy",
  nameEs: "Fuerte",
  increasedStat: null,
  decreasedStat: null,
};

function displayNameEs(rawName: string): string {
  return rawName.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function pickNature(
  highest: StatName,
  second: StatName,
  baseStats: Record<StatName, number>,
): Nature {
  const find = (name: string) =>
    NATURES.find((n) => n.name === name) ?? NATURES[0] ?? FALLBACK_NATURE;
  const speed = baseStats.speed ?? 80;
  const atk = baseStats.attack ?? 80;
  const spa = baseStats["special-attack"] ?? 80;
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

type OptimizedWithTypes = {
  readonly id: number;
  readonly name: string;
  readonly types: readonly PokemonType[];
};

export function PokemonSelector({
  open,
  onClose,
  onSelect,
  replacingIndex,
}: Props) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const pokemonList = usePokedexStore((s) => s.pokemonList);
  const isLoading = usePokedexStore((s) => s.isLoading);
  const error = usePokedexStore((s) => s.error);
  const loadPokemon = usePokedexStore((s) => s.loadPokemon);
  const getPokemonById = usePokedexStore((s) => s.getPokemonById);

  useEffect(() => {
    if (open) {
      void loadPokemon();
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
    setQuery("");
  }, [open, loadPokemon]);

  const searchIndex = useMemo(
    () =>
      pokemonList.map((p) => ({
        id: p.id,
        nameNorm: normalizeId(p.name),
        displayNorm: normalizeId(displayNameEs(p.name)),
        numberStr: String(p.id),
        numberPadded: String(p.id).padStart(3, "0"),
        typesEn: p.types.join(" ").toLowerCase(),
        typesEs: p.types
          .map((t) => translateTypeToSpanish(t).toLowerCase())
          .join(" "),
      })),
    [pokemonList],
  );

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
      )
        matchedIds.add(entry.id);
    }
    return pokemonList.filter((p) => matchedIds.has(p.id));
  }, [pokemonList, searchIndex, query]);

  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 12,
  });

  const toTeamMember = useCallback((full: PokemonFull): TeamMember => {
    const baseRaw = full.baseStats as unknown as Record<StatName, number>;
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
    const highest = sorted[0]?.[0] ?? "attack";
    const secondName = sorted[1]?.[0] ?? "speed";
    const nature = pickNature(highest, secondName, safeBase);
    const evsDist: Record<StatName, number> = {
      hp: 0,
      attack: 0,
      defense: 0,
      "special-attack": 0,
      "special-defense": 0,
      speed: 0,
    };
    evsDist[highest] = 252;
    evsDist[secondName] = 252;
    evsDist[sorted[2]?.[0] ?? "hp"] = 4;
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
    const defaultAbility =
      (full.abilities as readonly { name: string }[] | undefined)?.[0]?.name ??
      "";
    const calc = calculated as unknown as Record<StatName, number>;
    return {
      id: String(full.id),
      name: normalizeId(full.name),
      displayNameEs: displayNameEs(full.name),
      species: displayNameEs(full.name),
      types: full.types as readonly PokemonType[],
      abilityId: defaultAbility ? normalizeId(defaultAbility) : null,
      itemId: null,
      ability: defaultAbility || null,
      item: null,
      nature,
      level: DEFAULT_BATTLE_RULESET.level,
      evs,
      ivs,
      calculatedStats: {
        hp: calc.hp,
        attack: calc.attack,
        defense: calc.defense,
        specialAttack: calc["special-attack"],
        specialDefense: calc["special-defense"],
        speed: calc.speed,
      },
      baseStats: safeBase,
      moves: [],
    } as unknown as TeamMember;
  }, []);

  const handleSelect = useCallback(
    async (optimized: OptimizedWithTypes) => {
      const full = await getPokemonById(optimized.id);
      if (!full) return;
      const member = toTeamMember(full as unknown as PokemonFull);
      onSelect(member);
      onClose();
      setQuery("");
    },
    [getPokemonById, toTeamMember, onSelect, onClose],
  );

  if (!open || typeof document === "undefined") return null;
  const virtualItems = virtualizer.getVirtualItems();
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
                  ? "Cargando Pokédex optimizada..."
                  : `${filtered.length} de ${pokemonList.length} · Nv. ${DEFAULT_BATTLE_RULESET.level}`}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="border border-[#EDE8E0] bg-white px-2.5 py-1 text-[11px] text-zinc-600 hover:border-[#111] hover:text-[#111]"
            >
              Cerrar
            </button>
          </div>
          <div className="mt-4">
            <div className="relative">
              <span
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                aria-hidden
              >
                ⌕
              </span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre, número o tipo"
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
          ref={parentRef}
          className="relative flex-1 overflow-y-auto bg-white"
          style={{ height: 440 }}
        >
          {isLoading ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-16">
              <div className="h-5 w-5 animate-spin border-2 border-[#EDE8E0] border-t-[#111]" />
              <p className="text-[13px] text-zinc-600">Cargando...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 py-16 text-center">
              <p className="text-[13px] font-medium">
                Sin resultados para &quot;{query}&quot;
              </p>
            </div>
          ) : (
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {virtualItems.map((virtualRow) => {
                const pokemon = filtered[virtualRow.index];
                if (!pokemon) return null;
                const display = displayNameEs(pokemon.name);
                const baseEntry = pokemonList.find(
                  (p) => p.name === resolveBaseName(pokemon.name),
                );
                const dexNumber = baseEntry?.id ?? pokemon.id;
                return (
                  <div
                    key={`${pokemon.id}-${virtualRow.index}`}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        void handleSelect(pokemon as OptimizedWithTypes)
                      }
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
                            #{String(dexNumber).padStart(3, "0")}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-1">
                          {pokemon.types.map((t: string) => (
                            <span
                              key={t}
                              className="border border-[#EDE8E0] px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-zinc-600"
                            >
                              {translateTypeToSpanish(t)}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="border border-[#111] bg-[#111] px-2 py-1 text-[11px] text-white opacity-0 group-hover:opacity-100">
                        Añadir
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="border-t border-[#EDE8E0] bg-[#F8F5F0] px-4 py-2.5 text-[11px] leading-normal text-zinc-600">
          {pokemonList.length} Pokémon · Virtualizado
        </div>
      </div>
    </div>,
    document.body,
  );
}
