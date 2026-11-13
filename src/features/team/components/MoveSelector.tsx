"use client";
import { useEffect, useMemo, useState } from "react";
import type { MoveDTO } from "@/infrastructure/local-data/repositories/local-move.repository";
import { LocalMoveRepository } from "@/infrastructure/local-data/repositories/local-move.repository";
import { LocalPokemonRepository } from "@/infrastructure/local-data/repositories/local-pokemon.repository";

interface Props {
  readonly pokemonId: number;
  readonly selectedMoves: readonly string[];
  readonly onChange: (moves: readonly string[]) => void;
  readonly maxMoves?: number;
}

export function MoveSelector({
  pokemonId,
  selectedMoves,
  onChange,
  maxMoves = 4,
}: Props) {
  const [learnset, setLearnset] = useState<readonly string[]>([]);
  const [allMoves, setAllMoves] = useState<readonly MoveDTO[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const pokemon = await LocalPokemonRepository.getById(pokemonId);
        const rawMoves =
          (pokemon as { moves?: readonly (string | { name: string })[] } | null)
            ?.moves ?? [];
        const moveNames: string[] = rawMoves.map((m) =>
          typeof m === "string" ? m : m.name,
        );
        if (!cancelled)
          setLearnset(Object.freeze([...moveNames]) as readonly string[]);
        const all = await LocalMoveRepository.getAll();
        if (!cancelled) setAllMoves(all);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pokemonId]);

  const legalMoves = useMemo(() => {
    const set = new Set(learnset.map((m) => m.toLowerCase()));
    return allMoves.filter(
      (m) => set.has(m.id.toLowerCase()) || set.has(m.name.toLowerCase()),
    );
  }, [learnset, allMoves]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return legalMoves;
    return legalMoves.filter(
      (m) =>
        m.id.includes(q) ||
        m.nameEs.toLowerCase().includes(q) ||
        String(m.type).toLowerCase().includes(q),
    );
  }, [legalMoves, query]);

  const toggleMove = (moveId: string) => {
    if (selectedMoves.includes(moveId))
      onChange(selectedMoves.filter((m) => m !== moveId));
    else {
      if (selectedMoves.length >= maxMoves)
        onChange([...selectedMoves.slice(1), moveId]);
      else onChange([...selectedMoves, moveId]);
    }
  };

  if (loading)
    return (
      <div className="border border-[#EDE8E0] p-4 text-[12px] text-zinc-600">
        Cargando learnset legal...
      </div>
    );

  return (
    <div className="border border-[#EDE8E0] bg-white">
      <div className="border-b border-[#EDE8E0] px-4 py-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#111]">
          Movimientos legales · Máx {maxMoves}
        </h3>
        <p className="mt-1 text-[11px] text-zinc-600">
          {learnset.length} movimientos en learnset · {selectedMoves.length}/
          {maxMoves} seleccionados
        </p>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filtrar por nombre o tipo - ej. Terremoto, Fuego"
          className="mt-2 w-full border border-[#EDE8E0] bg-[#F8F5F0] px-3 py-2 text-[12px] outline-none focus:border-[#111] focus:bg-white"
        />
      </div>
      <div className="grid max-h-60 grid-cols-1 gap-px overflow-y-auto bg-[#EDE8E0]">
        {filtered.map((move) => {
          const selected = selectedMoves.includes(move.id);
          return (
            <button
              key={move.id}
              type="button"
              onClick={() => toggleMove(move.id)}
              className={`flex items-center justify-between px-4 py-2 text-left text-[12px] ${selected ? "bg-[#111] text-white" : "bg-white hover:bg-[#FFFEFB] text-[#111]"}`}
            >
              <span>
                {move.nameEs}{" "}
                <span className="text-[10px] opacity-60">({move.type})</span>
              </span>
              <span className="text-[11px] tabular-nums">
                {move.power ? `${move.power} potencia` : "Estado"}
                {selected ? " · ✓" : ""}
              </span>
            </button>
          );
        })}
      </div>
      <div className="bg-[#F8F5F0] px-4 py-2 text-[11px] text-zinc-600">
        Legalidad: solo movimientos que el Pokémon aprende según dataset.es.json
      </div>
    </div>
  );
}
