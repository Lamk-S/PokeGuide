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

type TypeRef = string | { type?: { name?: string }; name?: string };

function getTypeName(t: TypeRef): string {
  if (typeof t === "string") return t;
  const obj = t as { type?: { name?: string }; name?: string };
  return obj.type?.name || obj.name || "unknown";
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
          (identity.formId ? identity.formId.includes(q) : false) ||
          identity.debugKey.toLowerCase().includes(q) ||
          String(p.id) === q
        );
      })
      .slice(0, 50);
  }, [pokemonList, query]);

  const selected = useMemo(
    () => pokemonList.find((p) => String(p.id) === value) || null,
    [pokemonList, value],
  );

  const selectedIdentity = useMemo(() => {
    if (!selected) return null;
    return parsePokemonIdentity({ id: selected.id, name: selected.name });
  }, [selected]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full h-10 px-3 rounded-lg border border-[#D9E0E8] bg-white text-sm flex items-center justify-between gap-2"
      >
        {selected && selectedIdentity ? (
          <span className="flex items-center gap-2 min-w-0">
            <span className="size-6 shrink-0 flex items-center justify-center">
              <PokemonSprite
                pokemon={{ id: selected.id, name: selected.name }}
                facing="left"
                size={24}
              />
            </span>
            <span className="font-medium truncate">
              {formatPokemonDisplayName(selected.name)}
            </span>
            <span className="text- font-mono text-[#7B8794] hidden md:inline">
              {selectedIdentity.speciesId}:{selectedIdentity.formId ?? "base"}
            </span>
          </span>
        ) : (
          <span className="text-[#7B8794]">{placeholder}</span>
        )}
        <span className="text-[#7B8794] text-">▼</span>
      </button>

      {open ? (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-[#D9E0E8] bg-white shadow max-h-72 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-[#F0F3F7]">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca por especie, forma, id..."
              className="w-full h-8 px-2.5 rounded-md border border-[#D9E0E8] bg-[#F5F7FA] text-sm"
            />
          </div>
          <div className="overflow-auto py-1">
            {filtered.map((p) => {
              const isSelected = String(p.id) === value;
              const identity = parsePokemonIdentity({ id: p.id, name: p.name });
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onValueChange(String(p.id));
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
                    />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="text- font-medium truncate block">
                      {formatPokemonDisplayName(p.name)}
                    </span>
                    <span className="text- text-[#7B8794] font-mono">
                      {identity.speciesId}:{identity.formId ?? "base"} #
                      {String(p.id).padStart(4, "0")}
                      {identity.isBattleTransformation
                        ? ` · ${identity.transformationKind ?? ""}`
                        : ""}
                    </span>
                  </span>
                  <span className="flex items-center gap-1 shrink-0">
                    {(p.types as TypeRef[] | undefined)
                      ?.slice(0, 2)
                      .map((t) => {
                        const name = getTypeName(t);
                        return <TypeBadge key={name} type={name} size="sm" />;
                      })}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
      {open ? (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}
