"use client";
import { useState, useMemo } from "react";
import type { Pokemon } from "@/domain/pokemon/types/pokemon";
import { formatPokemonDisplayName } from "@/domain/pokemon/services/PokemonDisplayName";
import { TypeBadge } from "@/components/ui/TypeBadge";
import { parsePokemonIdentity } from "@/domain/pokemon/value-objects/PokemonIdentity";
import { PokemonSprite } from "@/components/ui/PokemonSprite";

interface PokemonSelectProps {
  pokemonList: Pokemon[];
  value: string;
  onValueChange: (id: string) => void;
  placeholder?: string;
}

export function PokemonSelect({
  pokemonList,
  value,
  onValueChange,
  placeholder = "Busca un Pokémon...",
}: PokemonSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return pokemonList.slice(0, 50);
    return pokemonList
      .filter((p) => {
        const identity = parsePokemonIdentity({ id: p.id, name: p.name });
        const display = formatPokemonDisplayName(p.name).toLowerCase();
        return (
          display.includes(q) ||
          identity.speciesId.includes(q) ||
          identity.formId.includes(q) ||
          identity.debugKey.toLowerCase().includes(q) ||
          p.id.toString() === q
        );
      })
      .slice(0, 50);
  }, [pokemonList, query]);

  const selected = useMemo(
    () => pokemonList.find((p) => p.id.toString() === value),
    [pokemonList, value],
  );
  const selectedIdentity = useMemo(
    () =>
      selected
        ? parsePokemonIdentity({ id: selected.id, name: selected.name })
        : null,
    [selected],
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full h-10 px-3 rounded-lg border border-[#D9E0E8] bg-white text-sm flex items-center justify-between gap-2 hover:border-[#B9C4D1] focus:outline-none focus:ring-2 focus:ring-[#D93B32]/20 focus:border-[#D93B32] text-left"
      >
        {selected && selectedIdentity ? (
          <span className="flex items-center gap-2 min-w-0">
            <span className="size-6 shrink-0 flex items-center justify-center">
              <PokemonSprite
                pokemon={{ id: selected.id, name: selected.name }}
                facing="left"
                size={24}
                hd={false}
              />
            </span>
            <span className="font-medium truncate">
              {formatPokemonDisplayName(selected.name)}
            </span>
            <span className="text-[10px] font-mono text-[#7B8794] hidden md:inline">
              {selectedIdentity.speciesId}:{selectedIdentity.formId}
            </span>
            <span className="hidden md:flex items-center gap-1 ml-1">
              {selected.types?.slice(0, 2).map((t) => {
                const typeName =
                  typeof t === "string"
                    ? t
                    : (t as { type?: { name?: string }; name?: string }).type
                        ?.name ||
                      (t as { name?: string }).name ||
                      "unknown";
                return <TypeBadge key={typeName} type={typeName} size="sm" />;
              })}
            </span>
          </span>
        ) : (
          <span className="text-[#7B8794]">{placeholder}</span>
        )}
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          className="text-[#7B8794] shrink-0"
        >
          <title>Chevron</title>
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-[#D9E0E8] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)] max-h-72 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-[#F0F3F7]">
            <input
              // biome-ignore lint/a11y/noAutofocus: search input should focus when dropdown opens for UX
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca por especie, forma, id... ej. zygarde, mega, 10301"
              className="w-full h-8 px-2.5 rounded-md border border-[#D9E0E8] bg-[#F5F7FA] text-sm focus:outline-none focus:ring-2 focus:ring-[#D93B32]/20 focus:border-[#D93B32]"
            />
          </div>
          <div className="overflow-auto py-1">
            {filtered.map((p) => {
              const isSelected = p.id.toString() === value;
              const identity = parsePokemonIdentity({ id: p.id, name: p.name });
              const displayName = formatPokemonDisplayName(p.name);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onValueChange(p.id.toString());
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`w-full px-3 py-2 flex items-center gap-2.5 text-left hover:bg-[#F5F7FA] ${isSelected ? "bg-[#F0F3F7]" : ""}`}
                >
                  <span className="size-8 shrink-0 flex items-center justify-center">
                    <PokemonSprite
                      pokemon={{ id: p.id, name: p.name }}
                      facing="left"
                      size={32}
                      hd={false}
                    />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="text-[13px] font-medium truncate block">
                      {displayName}
                    </span>
                    <span className="text-[11px] text-[#7B8794] font-mono">
                      {identity.speciesId}:{identity.formId} #
                      {p.id.toString().padStart(4, "0")}{" "}
                      {identity.isBattleTransformation
                        ? `· ${identity.transformationKind}`
                        : ""}
                    </span>
                  </span>
                  <span className="flex items-center gap-1 shrink-0">
                    {p.types?.slice(0, 2).map((t) => {
                      const typeName =
                        typeof t === "string"
                          ? t
                          : (t as { type?: { name?: string }; name?: string })
                              .type?.name ||
                            (t as { name?: string }).name ||
                            "unknown";
                      return (
                        <TypeBadge key={typeName} type={typeName} size="sm" />
                      );
                    })}
                  </span>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="p-3 text-center text-sm text-[#7B8794]">
                No se encontró por especie/forma
              </div>
            )}
          </div>
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
