"use client";
import { useEffect, useMemo } from "react";
import { usePokedexStore } from "@/features/pokemon/store/usePokedexStore";
import { useMoveStore } from "@/features/moves/store/useMoveStore";
import { useItemStore } from "@/features/items/store/useItemStore";
import { useAbilityStore } from "@/features/abilities/store/useAbilityStore";
import { useBattleStore } from "@/features/battle/store/useBattleStore";
import { ParticipantCard } from "./ParticipantCard";
import { BattleResultCard } from "./BattleResultCard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import type { PokemonMoveRef } from "@/domain/pokemon/types/pokemon";

type AvailableMoveOption = {
  value: string;
  label: string;
  description: string;
};

export function BattleLabView() {
  const { pokemonList, loadPokemon } = usePokedexStore();
  const { moveList, loadMoves } = useMoveStore();
  const { loadItems } = useItemStore();
  const { loadAbilities } = useAbilityStore();
  const {
    attackerInput,
    setAttacker,
    defenderInput,
    setDefender,
    moveName,
    setMoveName,
    calculateResult,
    result,
    isCalculating,
    error,
  } = useBattleStore();

  useEffect(() => {
    loadPokemon();
    loadMoves();
    loadItems();
    loadAbilities();
  }, [loadPokemon, loadMoves, loadItems, loadAbilities]);

  const availableMoves = useMemo((): AvailableMoveOption[] => {
    if (!attackerInput) return [];
    const p = pokemonList.find((x) => x.id === attackerInput.pokemonId);
    if (!p?.moves) return [];

    return p.moves
      .filter(
        (m: PokemonMoveRef) =>
          m.learnMethod === "machine" ||
          m.levelLearnedAt <= attackerInput.level,
      )
      .map((m: PokemonMoveRef) => {
        const fm = moveList[m.name];
        if (!fm) return null;
        return {
          value: m.name,
          label: fm.nameEs || fm.name,
          description: `${fm.type.toUpperCase()} • ${fm.power || 0}`,
        };
      })
      .filter((x): x is AvailableMoveOption => x !== null);
  }, [attackerInput, pokemonList, moveList]);

  const attackerData = useMemo(
    () => pokemonList.find((p) => p.id === attackerInput?.pokemonId),
    [attackerInput, pokemonList],
  );
  const defenderData = useMemo(
    () => pokemonList.find((p) => p.id === defenderInput?.pokemonId),
    [defenderInput, pokemonList],
  );
  const resolvedMoveName = useMemo(
    () =>
      moveList[moveName]?.nameEs ||
      moveList[moveName]?.name ||
      moveName ||
      "Movimiento",
    [moveName, moveList],
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <ParticipantCard
          label="Atacante"
          pokemonList={pokemonList}
          input={attackerInput}
          onChange={setAttacker}
          facing="left"
          generation={7}
        />
        <ParticipantCard
          label="Defensor"
          pokemonList={pokemonList}
          input={defenderInput}
          onChange={setDefender}
          facing="right"
          generation={7}
        />
      </div>
      <div className="flex flex-col gap-2 md:w-1/2">
        <Label>Movimiento</Label>
        <Combobox
          options={availableMoves}
          value={moveName}
          onValueChange={setMoveName}
          placeholder="Selecciona un movimiento..."
          emptyMessage="Selecciona atacante"
          disabled={availableMoves.length === 0}
        />
      </div>
      <Button
        onClick={calculateResult}
        disabled={
          isCalculating || !attackerInput || !defenderInput || !moveName
        }
        className="w-full md:w-auto"
      >
        {isCalculating ? "Calculando..." : "Calcular Daño"}
      </Button>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {result && (
        <BattleResultCard
          result={result}
          attackerName={attackerData?.name ?? "Atacante"}
          defenderName={defenderData?.name ?? "Defensor"}
          moveName={resolvedMoveName}
        />
      )}
    </div>
  );
}
