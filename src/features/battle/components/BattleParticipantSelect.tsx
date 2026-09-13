"use client";
import type { Pokemon } from "@/domain/pokemon/types/pokemon";
import type { BattleParticipantInput } from "@/features/battle/store/useBattleStore";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { useId, useMemo } from "react";

export function BattleParticipantSelect({
  label,
  pokemonList,
  onSelect,
  disabled,
  currentInput,
}: {
  label: string;
  pokemonList: Pokemon[];
  onSelect: (i: BattleParticipantInput | null) => void;
  disabled?: boolean;
  currentInput?: BattleParticipantInput | null;
}) {
  const levelId = useId();

  const pokemonOptions = useMemo(() => {
    return pokemonList.map((p) => ({
      value: p.id.toString(),
      label: p.name,
    }));
  }, [pokemonList]);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="flex flex-col gap-2">
        <Label>{label}</Label>
        <Combobox
          options={pokemonOptions}
          value={currentInput?.pokemonId?.toString() || ""}
          onValueChange={(val) => {
            const pid = parseInt(val, 10);
            if (Number.isNaN(pid)) {
              onSelect(null);
              return;
            }
            onSelect({
              pokemonId: pid,
              level: currentInput?.level || 50,
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
          placeholder="Busca un Pokémon..."
          emptyMessage="Pokémon no encontrado."
          disabled={disabled ?? false}
        />
      </div>

      {currentInput && (
        <div className="flex flex-col gap-2">
          <Label htmlFor={levelId}>Nivel</Label>
          <input
            id={levelId}
            type="number"
            min={1}
            max={100}
            value={currentInput.level}
            onChange={(e) => {
              let val = parseInt(e.target.value, 10);
              if (Number.isNaN(val)) val = 1;
              if (val > 100) val = 100;
              if (val < 1) val = 1;

              onSelect({ ...currentInput, level: val });
            }}
            className="h-10 w-24 rounded-lg border border-zinc-300 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-950 dark:border-zinc-700"
          />
        </div>
      )}
    </div>
  );
}
