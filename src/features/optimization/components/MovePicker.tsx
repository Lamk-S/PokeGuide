"use client";
import { useEffect, useMemo, useState } from "react";
import { useMoveStore } from "@/features/moves/store/useMoveStore";

type MoveItem = {
  id?: string;
  name: string;
  nameEs?: string;
  type?: string;
  power?: number;
  damageClass?: string;
};

type MoveStoreState = {
  moves?: MoveItem[] | Record<string, MoveItem>;
  moveList?: MoveItem[] | Record<string, MoveItem>;
  loadMoves?: () => void;
  load?: () => void;
};

interface Props {
  valueId: string;
  onSelect: (id: string, name: string) => void;
  label: string;
  id: string;
  placeholder?: string;
}

function toArray(
  input: MoveItem[] | Record<string, MoveItem> | undefined,
): MoveItem[] {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  return Object.values(input);
}

export function MovePicker({
  valueId,
  onSelect,
  label,
  id,
  placeholder,
}: Props) {
  const rawMoves = useMoveStore((s) => {
    const st = s as unknown as MoveStoreState;
    return st.moves ?? st.moveList ?? [];
  });

  const load = useMoveStore((s) => {
    const st = s as unknown as MoveStoreState;
    return st.loadMoves ?? st.load ?? (() => {});
  });

  const [q, setQ] = useState("");

  useEffect(() => {
    load();
  }, [load]);

  const moves = useMemo(
    () => toArray(rawMoves as MoveItem[] | Record<string, MoveItem>),
    [rawMoves],
  );

  const filtered = useMemo(() => {
    const query = q.toLowerCase().trim();
    const fallback: MoveItem[] = [
      { name: "earthquake", nameEs: "Terremoto", type: "ground", power: 100 },
      { name: "flamethrower", nameEs: "Lanzallamas", type: "fire", power: 90 },
    ];
    const all = moves.length > 0 ? moves : fallback;
    if (!query) return all.slice(0, 8);
    return all
      .filter((m) => {
        const name = (m.name ?? "").toLowerCase();
        const es = (m.nameEs ?? "").toLowerCase();
        const mid = (m.id ?? "").toLowerCase();
        return (
          name.includes(query) || es.includes(query) || mid.includes(query)
        );
      })
      .slice(0, 8);
  }, [moves, q]);

  const selected: MoveItem | undefined = useMemo(
    () => moves.find((m) => m.name === valueId || m.id === valueId),
    [moves, valueId],
  );

  const selectedLabel = selected ? (selected.nameEs ?? selected.name) : "";
  const inputPlaceholder =
    selectedLabel || placeholder || valueId || "Busca movimiento...";

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[10px] uppercase tracking-widest text-zinc-500"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={inputPlaceholder}
          className="h-9 w-full rounded-lg border border-[#E5E2DA] bg-[#FFFEFB] px-3 text-[13px] placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-300"
        />
        {valueId ? (
          <button
            type="button"
            onClick={() => {
              onSelect("", "");
              setQ("");
            }}
            className="absolute right-2 top-1.5 rounded px-1.5 py-1 text-[10px] text-zinc-400 hover:bg-zinc-100"
          >
            ✕
          </button>
        ) : null}
      </div>

      {selected ? (
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-[#E5E2DA] bg-white px-2.5 py-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-[12px] font-medium text-[#111]">
            {selected.nameEs ?? selected.name}
          </span>
          <span className="text-[10px] text-zinc-500">
            {selected.type ?? ""}{" "}
            {selected.power ? `• ${selected.power} BP` : ""}
          </span>
        </div>
      ) : null}

      <div className="mt-2 grid gap-1.5">
        {filtered.map((m) => {
          const mid = m.id ?? m.name;
          const isSelected = valueId === mid || valueId === m.name;
          return (
            <button
              key={mid}
              type="button"
              onClick={() => {
                onSelect(mid, m.nameEs ?? m.name);
                setQ("");
              }}
              className={`flex justify-between rounded-lg border px-3 py-2 text-left transition-colors ${
                isSelected
                  ? "border-[#111] bg-[#F8F5F0]"
                  : "border-[#E5E2DA] bg-white hover:bg-[#F8F5F0]"
              }`}
            >
              <div>
                <p className="text-[12px] font-medium text-[#111]">
                  {m.nameEs ?? m.name}
                </p>
                <p className="text-[10px] text-zinc-500">
                  {m.name} • {m.type ?? "—"} {m.power ? `• ${m.power} BP` : ""}
                </p>
              </div>
              <span className="text-[10px] text-zinc-400">
                {m.damageClass ?? ""}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
