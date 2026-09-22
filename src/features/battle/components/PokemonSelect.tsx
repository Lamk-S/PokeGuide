"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import type { Pokemon, PokemonTypeName } from "@/domain/pokemon/types/pokemon";
import { TypeBadge } from "@/components/ui/TypeBadge";

type PokemonTypeRef = PokemonTypeName | { type?: { name?: string } } | string;

interface PokemonSelectProps {
  pokemonList: Pokemon[];
  value: string;
  onValueChange: (id: string) => void;
  placeholder?: string;
}

function safeDisplayName(name: string): string {
  if (!name) return "Desconocido";
  try {
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, " ");
  } catch {
    return name;
  }
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
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return pokemonList.slice(0, 50);
    return pokemonList
      .filter((p) => {
        const name = (p.name || "").toLowerCase();
        return name.includes(q) || p.id.toString() === q;
      })
      .slice(0, 50);
  }, [pokemonList, query]);

  const selected = useMemo(
    () => pokemonList.find((p) => p.id.toString() === value),
    [pokemonList, value],
  );

  const getTypeName = (t: PokemonTypeRef): string => {
    if (typeof t === "string") return t;
    return (t as { type?: { name?: string } }).type?.name || "unknown";
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full h-10 px-3 rounded-lg border border-[#D9E0E8] bg-white text-sm flex items-center justify-between gap-2 hover:border-[#B9C4D1] focus:outline-none focus:ring-2 focus:ring-[#CBD5E1] focus:border-[#94A3B8] text-left transition-colors"
      >
        {selected ? (
          <span className="flex items-center gap-2 min-w-0">
            <Image
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${selected.id}.png`}
              alt={selected.name}
              width={24}
              height={24}
              className="size-6 object-contain"
              unoptimized
            />
            <span className="font-medium truncate">
              {safeDisplayName(selected.name)}
            </span>
            <span className="hidden md:flex items-center gap-1 ml-1">
              {selected.types?.slice(0, 2).map((t) => {
                const typeName = getTypeName(t as PokemonTypeRef);
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
          aria-hidden="true"
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
        <div className="absolute z-100 mt-2 w-full rounded-xl border border-[#E2E8F0] bg-white shadow-[0_12px_32px_rgba(0,0,0,0.12)] overflow-hidden">
          <div className="p-2">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Escribe para buscar..."
              className="w-full h-9 px-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[13px] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#E2E8F0] focus:border-[#CBD5E1] focus:bg-white transition-all"
            />
          </div>
          <div className="max-h-65 overflow-auto py-1 border-t border-[#F1F5F9]">
            {pokemonList.length === 0 ? (
              <div className="p-4 text-center">
                <div className="text-[13px] text-[#64748B]">
                  Cargando Pokémon...
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-4 text-center text-[13px] text-[#64748B]">
                No se encontró &quot;{query}&quot;
              </div>
            ) : (
              filtered.map((p) => {
                const isSelected = p.id.toString() === value;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onValueChange(p.id.toString());
                      setOpen(false);
                      setQuery("");
                    }}
                    className={`w-full px-3 py-2.5 flex items-center gap-3 text-left hover:bg-[#F8FAFC] transition-colors ${isSelected ? "bg-[#F1F5F9]" : ""}`}
                  >
                    <Image
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                      alt={p.name}
                      width={32}
                      height={32}
                      className="size-8 object-contain shrink-0"
                      unoptimized
                    />
                    <span className="flex-1 min-w-0">
                      <span className="text-[13px] font-medium text-[#1E293B] block truncate">
                        {safeDisplayName(p.name)}
                      </span>
                      <span className="text-[11px] text-[#94A3B8]">
                        #{p.id.toString().padStart(3, "0")}
                      </span>
                    </span>
                    <span className="flex items-center gap-1 shrink-0">
                      {p.types?.slice(0, 2).map((t) => {
                        const typeName = getTypeName(t as PokemonTypeRef);
                        return (
                          <TypeBadge key={typeName} type={typeName} size="sm" />
                        );
                      })}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-90"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
