"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import type { Pokemon } from "@/domain/pokemon/types/pokemon";
import { formatPokemonDisplayName } from "@/domain/pokemon/services/PokemonDisplayName";
import { TypeBadge } from "@/components/ui/TypeBadge";
import { parsePokemonIdentity } from "@/domain/pokemon/value-objects/PokemonIdentity";
import { PokemonSprite } from "@/components/ui/PokemonSprite";
import { ChevronDown } from "lucide-react";
interface Props {
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
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return pokemonList.slice(0, 50);
    return pokemonList
      .filter((p) => {
        const id = parsePokemonIdentity(p.id, p.name);
        return (
          formatPokemonDisplayName(p.name).toLowerCase().includes(q) ||
          id.speciesId.includes(q) ||
          String(p.id) === q
        );
      })
      .slice(0, 50);
  }, [pokemonList, query]);
  const selected = useMemo(
    () => pokemonList.find((p) => String(p.id) === value) || null,
    [pokemonList, value],
  );
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full h-8 px-2.5 rounded-md border border-[#E8E0D6] bg-white text-[13px] flex items-center justify-between gap-2 text-left"
      >
        {selected ? (
          <span className="flex items-center gap-2 min-w-0">
            <span className="size-5 flex items-center justify-center">
              <PokemonSprite
                pokemon={{ id: selected.id, name: selected.name }}
                size={20}
              />
            </span>
            <span className="font-medium truncate text-[12px]">
              {formatPokemonDisplayName(selected.name)}
            </span>
          </span>
        ) : (
          <span className="text-[#9A9590] text-[12px]">{placeholder}</span>
        )}
        <ChevronDown className="size-3.5 text-[#9A9590] shrink-0" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border bg-[#FFFEFB] shadow max-h-72 overflow-hidden flex flex-col">
          <div className="p-2 border-b">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca por especie, forma, id..."
              className="w-full h-8 px-2.5 rounded-md border bg-[#F8F5F0] text-[13px]"
            />
          </div>
          <div className="overflow-auto py-1">
            {filtered.map((p) => {
              const isSelected = String(p.id) === value;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onValueChange(String(p.id));
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`w-full px-3 py-2 flex items-center gap-2.5 text-left hover:bg-[#F8F5F0] ${isSelected ? "bg-[#F0EDE6]" : ""}`}
                >
                  <span className="size-7 flex items-center justify-center">
                    <PokemonSprite
                      pokemon={{ id: p.id, name: p.name }}
                      size={28}
                    />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="text-[13px] font-medium block truncate">
                      {formatPokemonDisplayName(p.name)}
                    </span>
                    <span className="text-[10px] font-mono text-[#9A9590]">
                      #{String(p.id).padStart(4, "0")}
                    </span>
                  </span>
                  <span className="flex gap-1">
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
