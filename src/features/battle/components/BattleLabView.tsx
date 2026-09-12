"use client";
import { useEffect, useMemo } from "react";
import { usePokedexStore } from "@/features/pokemon/store/usePokedexStore";
import { useMoveStore } from "@/features/moves/store/useMoveStore";
import { useBattleStore } from "@/features/battle/store/useBattleStore";
import { BattleParticipantSelect } from "./BattleParticipantSelect";
import { BattleResultCard } from "./BattleResultCard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";

export function BattleLabView() {
  const { pokemonList, loadPokemon } = usePokedexStore();
  const { moveList, loadMoves } = useMoveStore();
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
  }, [loadPokemon, loadMoves]);

  // REGLA DE NEGOCIO: Filtrar movimientos reales
  const availableMoves = useMemo(() => {
    if (!attackerInput) return [];
    const attackerData = pokemonList.find(
      (p) => p.id === attackerInput.pokemonId,
    );
    if (!attackerData?.moves) return [];

    return attackerData.moves
      .filter(
        (m) =>
          m.learnMethod === "machine" ||
          m.levelLearnedAt <= attackerInput.level,
      )
      .map((m) => {
        const fullMove = moveList[m.name];
        if (!fullMove) return null;
        return {
          value: m.name,
          label: `${fullMove.nameEs || fullMove.name} [${fullMove.type} - ${fullMove.power || 0}]`,
        };
      })
      .filter(Boolean) as { value: string; label: string }[];
  }, [attackerInput, pokemonList, moveList]);

  // REGLA DE NEGOCIO: Si el nivel baja y el movimiento ya no es válido, se limpia.
  useEffect(() => {
    if (moveName && availableMoves.length > 0) {
      const isValid = availableMoves.some((m) => m.value === moveName);
      if (!isValid) setMoveName("");
    }
  }, [availableMoves, moveName, setMoveName]);

  const isFormValid =
    attackerInput &&
    defenderInput &&
    moveName &&
    attackerInput.level >= 1 &&
    defenderInput.level >= 1;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <BattleParticipantSelect
          label="Atacante"
          pokemonList={pokemonList}
          onSelect={setAttacker}
          currentInput={attackerInput}
        />
        <BattleParticipantSelect
          label="Defensor"
          pokemonList={pokemonList}
          onSelect={setDefender}
          currentInput={defenderInput}
        />
      </div>

      <div className="flex flex-col gap-2 md:w-1/2">
        <Label>Movimiento</Label>
        <Combobox
          options={availableMoves}
          value={moveName}
          onValueChange={setMoveName}
          placeholder="Selecciona un movimiento..."
          emptyMessage={
            attackerInput
              ? "No aprende movimientos a este nivel"
              : "Selecciona un atacante primero"
          }
          disabled={availableMoves.length === 0}
        />
      </div>

      <Button
        onClick={calculateResult}
        disabled={isCalculating || !isFormValid}
        className="w-full md:w-auto"
      >
        {isCalculating ? "Calculando..." : "Calcular Daño"}
      </Button>

      {error && (
        <p className="text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {result && <BattleResultCard result={result} />}
    </div>
  );
}
