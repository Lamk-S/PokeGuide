"use client";
import type { Pokemon } from "@/domain/pokemon/types/pokemon";
import type { BattleParticipantInput } from "@/features/battle/store/useBattleStore";
import { Label } from "@/components/ui/label";
import { useId } from "react";

export function BattleParticipantSelect({
  label,
  pokemonList,
  onSelect,
  disabled,
}: {
  label: string;
  pokemonList: Pokemon[];
  onSelect: (i: BattleParticipantInput | null) => void;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        disabled={disabled}
        onChange={(e) => {
          const pid = Number(e.target.value);
          if (!pid) {
            onSelect(null);
            return;
          }
          onSelect({
            pokemonId: pid,
            level: 50,
            nature: {
              name: "Serious",
              increasedStat: null,
              decreasedStat: null,
            },
            ivs: {
              hp: 31,
              attack: 31,
              defense: 31,
              "special-attack": 31,
              "special-defense": 31,
              speed: 31,
            },
            evs: {
              hp: 0,
              attack: 252,
              defense: 0,
              "special-attack": 0,
              "special-defense": 0,
              speed: 252,
            },
          });
        }}
        className="h-10 rounded-lg border px-3 bg-white dark:bg-zinc-900"
      >
        <option value="">Selecciona...</option>
        {pokemonList.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}
