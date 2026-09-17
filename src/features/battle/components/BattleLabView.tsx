"use client";
import { useEffect, useMemo, useState } from "react";
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
import type { BattleParticipantInput } from "@/features/battle/store/useBattleStore";

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
  } = useBattleStore();

  const [localError, setLocalError] = useState<string | null>(null);
  const CURRENT_GENERATION = 7;

  useEffect(() => {
    loadPokemon();
    loadMoves();
    loadItems();
    loadAbilities();
  }, [loadPokemon, loadMoves, loadItems, loadAbilities]);

  const availableMoves = useMemo(() => {
    if (!attackerInput) return [];
    const p = pokemonList.find((x) => x.id === attackerInput.pokemonId);
    if (!p?.moves) return [];

    return p.moves
      .filter(
        (m) =>
          m.learnMethod === "machine" ||
          m.levelLearnedAt <= attackerInput.level,
      )
      .map((m) => {
        const fm = moveList[m.name];
        if (!fm) return null;
        return {
          value: m.name,
          label: fm.nameEs || fm.name,
          description: `${fm.type.toUpperCase()} • ${fm.power || 0}`,
        };
      })
      .filter(Boolean) as {
      value: string;
      label: string;
      description: string;
    }[];
  }, [attackerInput, pokemonList, moveList]);

  const handleAttackerChange = (newInput: BattleParticipantInput | null) => {
    if (newInput?.pokemonId !== attackerInput?.pokemonId) {
      setMoveName("");
    }
    setAttacker(newInput);
    setLocalError(null);
  };

  const handleCalculate = async () => {
    setLocalError(null);
    try {
      await calculateResult();
    } catch (e) {
      setLocalError(
        e instanceof Error
          ? e.message
          : "Error desconocido al calcular el daño.",
      );
    }
  };

  const canCalculate = Boolean(
    attackerInput && defenderInput && moveName && !isCalculating,
  );
  const resolvedMoveName =
    moveList[moveName]?.nameEs || moveList[moveName]?.name || "Movimiento";
  const attackerData = pokemonList.find(
    (p) => p.id === attackerInput?.pokemonId,
  );
  const defenderData = pokemonList.find(
    (p) => p.id === defenderInput?.pokemonId,
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <ParticipantCard
          label="Atacante"
          pokemonList={pokemonList}
          input={attackerInput}
          onChange={handleAttackerChange}
          facing="left"
          generation={CURRENT_GENERATION}
        />
        <ParticipantCard
          label="Defensor"
          pokemonList={pokemonList}
          input={defenderInput}
          onChange={setDefender}
          facing="right"
          generation={CURRENT_GENERATION}
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
        onClick={handleCalculate}
        disabled={!canCalculate}
        className="w-full md:w-auto"
      >
        {isCalculating ? "Calculando..." : "Calcular Daño"}
      </Button>
      {localError && (
        <p className="text-sm font-semibold text-red-600 dark:text-red-400 p-3 bg-red-50 dark:bg-red-950/30 rounded-md border border-red-200 dark:border-red-900">
          {localError}
        </p>
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
