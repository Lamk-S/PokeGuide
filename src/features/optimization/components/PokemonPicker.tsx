"use client";
import { useMemo, useState } from "react";
import { PokemonSprite } from "@/components/ui/PokemonSprite";
import type { Pokemon } from "@/domain/pokemon/types/pokemon";
import { usePokedexStore } from "@/features/pokemon/store/usePokedexStore";

type PokemonListItem = Pokemon & {
  nameEs?: string;
  baseStats?: Record<string, number>;
  bst?: number;
};

interface Props {
  value: number | null;
  onSelect: (id: number | null) => void;
  label: string;
  id: string;
  placeholder?: string;
}

export function PokemonPicker({
  value,
  onSelect,
  label,
  id,
  placeholder,
}: Props) {
  const list = usePokedexStore(
    (s) => (s.pokemonList ?? []) as PokemonListItem[],
  );
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return list.slice(0, 12);
    return list
      .filter((p) => {
        const name = (p.name ?? "").toLowerCase();
        const es = (p.nameEs ?? "").toLowerCase();
        return name.includes(q) || String(p.id).includes(q) || es.includes(q);
      })
      .slice(0, 12);
  }, [list, query]);

  const selected = list.find((p) => p.id === value);

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-[13px] font-semibold text-[#111]"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            selected
              ? `${selected.name} #${selected.id}`
              : (placeholder ?? "Busca por nombre o ID...")
          }
          className="h-9 w-full rounded-lg border border-[#E5E2DA] bg-[#FFFEFB] px-3 pr-8 text-[13px] placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-300"
        />
        <span className="pointer-events-none absolute right-3 top-2.5 text-[11px] text-zinc-400">
          ⌕
        </span>
      </div>

      {selected ? (
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-[#111] bg-[#F8F5F0] px-3 py-2">
          <PokemonSprite
            pokemon={{ id: selected.id, name: selected.name }}
            size={32}
          />
          <div className="flex-1">
            <p className="text-[12px] font-medium text-[#111]">
              {selected.name}
            </p>
            <p className="text-[10px] text-zinc-500">#{selected.id}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              onSelect(null);
              setQuery("");
            }}
            className="text-[11px] text-zinc-500 hover:text-zinc-800"
          >
            Limpiar
          </button>
        </div>
      ) : null}

      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {filtered.map((p) => {
          const isSelected = value === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                onSelect(p.id);
                setQuery("");
              }}
              className={`flex flex-col items-center rounded-lg border bg-white p-2.5 transition-colors hover:bg-[#F8F5F0] ${
                isSelected
                  ? "border-[#111] bg-[#F8F5F0] ring-1 ring-[#111]"
                  : "border-[#E5E2DA]"
              }`}
            >
              <PokemonSprite pokemon={{ id: p.id, name: p.name }} size={36} />
              <span className="mt-1 truncate text-[11px] font-medium text-[#111]">
                {p.name}
              </span>
              <span className="text-[10px] text-zinc-500">#{p.id}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
