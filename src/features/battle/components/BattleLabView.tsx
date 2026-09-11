// src/features/battle/components/BattleLabView.tsx
"use client";
import { useEffect, useId } from "react";
import { usePokedexStore } from "@/features/pokemon/store/usePokedexStore";
import { useBattleStore } from "@/features/battle/store/useBattleStore";
import { BattleParticipantSelect } from "./BattleParticipantSelect";
import { BattleResultCard } from "./BattleResultCard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const MOVES = [
  "Earthquake",
  "Shadow Ball",
  "Thunderbolt",
  "Flamethrower",
  "Moonblast",
];

export function BattleLabView() {
  const { pokemonList, loadPokemon, isLoading } = usePokedexStore();
  const {
    setAttacker,
    setDefender,
    setMoveName,
    calculateResult,
    result,
    isCalculating,
    error,
    attackerInput,
    defenderInput,
    moveName,
  } = useBattleStore();
  const moveId = useId();
  useEffect(() => {
    loadPokemon();
  }, [loadPokemon]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <BattleParticipantSelect
          label="Atacante"
          pokemonList={pokemonList}
          onSelect={setAttacker}
          disabled={isLoading}
        />
        <BattleParticipantSelect
          label="Defensor"
          pokemonList={pokemonList}
          onSelect={setDefender}
          disabled={isLoading}
        />
      </div>
      <div className="flex flex-col gap-2 md:w-1/2">
        <Label htmlFor={moveId}>Movimiento</Label>
        <select
          id={moveId}
          onChange={(e) => setMoveName(e.target.value)}
          className="h-10 rounded-lg border px-3"
        >
          <option value="">Selecciona...</option>
          {MOVES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
      <Button
        onClick={calculateResult}
        disabled={
          isCalculating || !attackerInput || !defenderInput || !moveName
        }
      >
        {isCalculating ? "Calculando..." : "Calcular Daño"}
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {result && <BattleResultCard result={result} />}
    </div>
  );
}
