"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import type { Pokemon } from "@/domain/pokemon/types/pokemon";
import { formatPokemonDisplayName } from "@/domain/pokemon/services/PokemonDisplayName";
import { TypeBadge } from "@/components/ui/TypeBadge";
import { parsePokemonIdentity } from "@/domain/pokemon/value-objects/PokemonIdentity";
import { PokemonSprite } from "@/components/ui/PokemonSprite";
import { ChevronDown } from "lucide-react";

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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      // focus inmediato al abrir - sin delay para UX instantánea
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

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
        className="w-full h-8 px-2.5 rounded-md border border-[#E8E0D6] bg-white text-[13px] flex items-center justify-between gap-2 hover:border-[#D9CFC2] focus:outline-none focus:ring-1 focus:ring-[#111]/20 text-left"
      >
        {selected ? (
          <span className="flex items-center gap-2 min-w-0">
            <span className="size-5 shrink-0 flex items-center justify-center">
              <PokemonSprite
                pokemon={{ id: selected.id, name: selected.name }}
                size={20}
              />
            </span>
            <span className="font-medium truncate text-[12px]">
              {formatPokemonDisplayName(selected.name)}
            </span>
            <span className="text-[10px] font-mono text-[#9A9590] hidden lg:inline">
              #{String(selected.id).padStart(3, "0")}
            </span>
          </span>
        ) : (
          <span className="text-[#9A9590] text-[12px]">{placeholder}</span>
        )}
        <ChevronDown className="size-3.5 text-[#9A9590] shrink-0" />
      </button>

      {open ? (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-[#E8E0D6] bg-[#FFFEFB] shadow-[0_8px_24px_rgba(0,0,0,0.08)] max-h-72 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-[#F0EDE6]">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca por especie, forma, id..."
              className="w-full h-8 px-2.5 rounded-md border border-[#E8E0D6] bg-[#F8F5F0] text-[13px] focus:outline-none focus:ring-1 focus:ring-[#111]/20"
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
                  <span className="size-7 shrink-0 flex items-center justify-center">
                    <PokemonSprite
                      pokemon={{ id: p.id, name: p.name }}
                      size={28}
                    />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="text-[13px] font-medium truncate block">
                      {formatPokemonDisplayName(p.name)}
                    </span>
                    <span className="text-[10px] font-mono text-[#9A9590]">
                      #{String(p.id).padStart(4, "0")}
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
