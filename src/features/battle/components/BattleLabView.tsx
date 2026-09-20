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
  { value: "3", label: "Gen 3 - Rubí/Zafiro" },
  { value: "4", label: "Gen 4 - Diamante/Perla" },
  { value: "5", label: "Gen 5 - Negro/Blanco" },
  { value: "6", label: "Gen 6 - X/Y" },
  { value: "7", label: "Gen 7 - Sol/Luna" },
  { value: "8", label: "Gen 8 - Espada/Escudo" },
  { value: "9", label: "Gen 9 - Escarlata/Violeta" },
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
      <div className="flex flex-col gap-2 md:w-">
        <Label className="text- font-medium uppercase tracking-[0.12em] text-zinc-500">
          Generación
        </Label>
        <Combobox
          options={GEN_OPTIONS}
          value={generation.toString()}
          onValueChange={(v) => setLocalGeneration(parseInt(v, 10))}
          placeholder="Elige generación"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="self-start">
          <ParticipantCard
            label="Atacante"
            pokemonList={pokemonList}
            input={attackerInput}
            onChange={setAttacker}
            facing="left"
            generation={generation}
          />
        </div>
        <div className="self-start">
          <ParticipantCard
            label="Defensor"
            pokemonList={pokemonList}
            input={defenderInput}
            onChange={setDefender}
            facing="right"
            generation={generation}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 md:w-">
        <Label className="text- font-medium uppercase tracking-[0.12em] text-zinc-500">
          Movimiento
        </Label>
        <Combobox
          options={availableMoves}
          value={moveName}
          onValueChange={setMoveName}
          placeholder="Selecciona movimiento..."
          emptyMessage="Sin movimientos"
          disabled={availableMoves.length === 0}
        />
      </div>

      <Button
        onClick={handleCalculate}
        disabled={!canCalculate}
        className="h-9 px-5 rounded-lg bg-zinc-900 text-white text-[13px] font-medium tracking-tight hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
      >
        {isCalculating ? "Calculando..." : "Calcular Daño"}
      </Button>

      {localError && (
        <p className="text- text-zinc-600 p-3 bg-zinc-50 rounded-lg border border-zinc-200/70">
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
