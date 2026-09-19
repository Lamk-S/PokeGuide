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
import type { PokemonMoveRef } from "@/domain/pokemon/types/pokemon";

type MoveOption = { value: string; label: string; description: string };

const GEN_OPTIONS = [
  { value: "3", label: "Gen 3 - Rubí/Zafiro (Hidden Power OK)" },
  { value: "4", label: "Gen 4 - Diamante/Perla" },
  { value: "5", label: "Gen 5 - Negro/Blanco" },
  { value: "6", label: "Gen 6 - X/Y (Megas)" },
  { value: "7", label: "Gen 7 - Sol/Luna (Z-Moves, HP OK)" },
  { value: "8", label: "Gen 8 - Espada/Escudo (GMAX, No HP)" },
  { value: "9", label: "Gen 9 - Escarlata/Violeta (Actual)" },
];

export function BattleLabView() {
  const { pokemonList, loadPokemon } = usePokedexStore();
  const { moveList, loadMoves } = useMoveStore();
  const { loadItems } = useItemStore();
  const { loadAbilities } = useAbilityStore();
  const store = useBattleStore();
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
  } = store;

  const setGeneration = (
    store as unknown as { setGeneration?: (gen: number) => void }
  ).setGeneration;

  const [localError, setLocalError] = useState<string | null>(null);
  const [generation, setLocalGeneration] = useState<number>(7);

  useEffect(() => {
    loadPokemon();
    loadMoves();
    loadItems();
    loadAbilities();
  }, [loadPokemon, loadMoves, loadItems, loadAbilities]);
  useEffect(() => {
    if (setGeneration) setGeneration(generation);
  }, [generation, setGeneration]);

  const availableMoves = useMemo((): MoveOption[] => {
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
      .filter((x): x is MoveOption => x !== null);
  }, [attackerInput, pokemonList, moveList]);

  const handleCalculate = async () => {
    setLocalError(null);
    try {
      await calculateResult();
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : "Error al calcular");
    }
  };

  const canCalculate = Boolean(
    attackerInput && defenderInput && moveName && !isCalculating,
  );
  const resolvedMoveName =
    moveList[moveName]?.nameEs || moveList[moveName]?.name || moveName;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:w-1/3">
        <Label>Generación (afecta a Hidden Power, Megas y GMAX)</Label>
        <Combobox
          options={GEN_OPTIONS}
          value={generation.toString()}
          onValueChange={(v) => setLocalGeneration(parseInt(v, 10))}
          placeholder="Elige generación"
        />
        {generation >= 8 && (
          <p className="text-xs text-amber-600">
            En Gen 8+ Hidden Power no existe y no se calculará.
          </p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ParticipantCard
          label="Atacante"
          pokemonList={pokemonList}
          input={attackerInput}
          onChange={setAttacker}
          facing="left"
          generation={generation}
        />
        <ParticipantCard
          label="Defensor"
          pokemonList={pokemonList}
          input={defenderInput}
          onChange={setDefender}
          facing="right"
          generation={generation}
        />
      </div>

      <div className="flex flex-col gap-2 md:w-1/2">
        <Label>Movimiento</Label>
        <Combobox
          options={availableMoves}
          value={moveName}
          onValueChange={setMoveName}
          placeholder="Selecciona movimiento..."
          emptyMessage="Sin movimientos disponibles"
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
        <p className="text-sm text-red-600 p-3 bg-red-50 rounded-md border border-red-200">
          {localError}
        </p>
      )}
      {result && (
        <BattleResultCard
          result={result}
          attackerName={
            pokemonList.find((p) => p.id === attackerInput?.pokemonId)?.name ||
            ""
          }
          defenderName={
            pokemonList.find((p) => p.id === defenderInput?.pokemonId)?.name ||
            ""
          }
          moveName={resolvedMoveName}
        />
      )}
    </div>
  );
}
