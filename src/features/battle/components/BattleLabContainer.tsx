"use client";
import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { BattleLabView } from "./BattleLabView";
import { usePokedexStore } from "@/features/pokemon/store/usePokedexStore";
import { useMoveStore } from "@/features/moves/store/useMoveStore";
import { useItemStore } from "@/features/items/store/useItemStore";
import { useAbilityStore } from "@/features/abilities/store/useAbilityStore";
import { useBattleStore } from "@/features/battle/store/useBattleStore";
import { parsePokemonIdentity } from "@/domain/pokemon/value-objects/PokemonIdentity";
import { resolvePokemonForm } from "@/domain/pokemon/services/PokemonFormResolver";
import { resolvePokemonMovesSync } from "@/domain/pokemon/services/PokemonMoveResolver";
import {
  validateBattleState,
  type BattleValidationError,
} from "@/domain/battle/services/BattleValidation";
import { SmogonSpeciesMapper } from "@/infrastructure/battle/smogon/SmogonSpeciesMapper";
import { TypeEffectiveness } from "@/domain/types/TypeChart";
import { translateType } from "@/components/ui/TypeBadge";
import {
  getStatNumber,
  extractTypeName,
  type StatValue,
} from "@/domain/pokemon/utils/pokemonHelpers";
import { normalizeId } from "@/domain/shared/utils/normalizeId";
import type { PokemonType } from "@/domain/pokemon/types/pokemon";
import type {
  WeatherId,
  TerrainId,
} from "@/domain/battle/value-objects/BattleModifiers";

type TabId = "attacker" | "defender" | "result";

export function BattleLabContainer() {
  const pokemonList = usePokedexStore((s) => s.pokemonList as never) as Array<{
    id: number;
    name: string;
    types?: unknown[];
    baseStats?: Record<string, number>;
    stats?: Record<string, number>;
    abilities?: Array<{ name: string }>;
    moves?: Array<string | { name: string }>;
  }>;
  const loadPokemon = usePokedexStore((s) => s.loadPokemon);
  const moveList = useMoveStore((s) => s.moveList) as Record<
    string,
    {
      name?: string;
      nameEs?: string;
      type?: string;
      power?: number | null;
      accuracy?: number | null;
      category?: string;
    }
  >;
  const loadMoves = useMoveStore((s) => s.loadMoves);
  const loadItems = useItemStore((s) => s.loadItems);
  const loadAbilities = useAbilityStore((s) => s.loadAbilities);

  const attackerInput = useBattleStore((s) => s.attackerInput);
  const defenderInput = useBattleStore((s) => s.defenderInput);
  const moveName = useBattleStore((s) => s.moveName);
  const result = useBattleStore((s) => s.result);
  const conditions = useBattleStore((s) => s.conditions);
  const isCalculating = useBattleStore((s) => s.isCalculating);
  const generation = useBattleStore((s) => s.generation);
  const setAttacker = useBattleStore((s) => s.setAttacker);
  const setDefender = useBattleStore((s) => s.setDefender);
  const setMoveNameStore = useBattleStore((s) => s.setMoveName);
  const calculateResult = useBattleStore((s) => s.calculateResult);
  const setGeneration = useBattleStore((s) => s.setGeneration);
  const setWeather = useBattleStore((s) => s.setWeather);
  const setTerrain = useBattleStore((s) => s.setTerrain);

  const [localError, setLocalError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("attacker");
  const prevDefenderIdRef = useRef<number | null>(null);
  const prevAttackerIdRef = useRef<number | null>(null);
  const userHasManuallySelectedMove = useRef(false);

  useEffect(() => {
    loadPokemon();
    loadMoves();
    loadItems();
    loadAbilities();
  }, [loadPokemon, loadMoves, loadItems, loadAbilities]);
  useEffect(() => {
    if (attackerInput?.pokemonId !== prevAttackerIdRef.current) {
      userHasManuallySelectedMove.current = false;
      prevAttackerIdRef.current = attackerInput?.pokemonId ?? null;
    }
  }, [attackerInput?.pokemonId]);

  const attackerIdentity = useMemo(() => {
    if (!attackerInput?.pokemonId) return null;
    const raw = pokemonList.find((p) => p.id === attackerInput.pokemonId);
    return raw ? parsePokemonIdentity(raw.id, raw.name) : null;
  }, [attackerInput?.pokemonId, pokemonList]);

  const defenderIdentity = useMemo(() => {
    if (!defenderInput?.pokemonId) return null;
    const raw = pokemonList.find((p) => p.id === defenderInput.pokemonId);
    return raw ? parsePokemonIdentity(raw.id, raw.name) : null;
  }, [defenderInput?.pokemonId, pokemonList]);

  const attackerResolvedForm = useMemo(
    () =>
      attackerIdentity
        ? resolvePokemonForm(attackerIdentity as never, pokemonList as never)
        : null,
    [attackerIdentity, pokemonList],
  );
  const defenderResolvedForm = useMemo(
    () =>
      defenderIdentity
        ? resolvePokemonForm(defenderIdentity as never, pokemonList as never)
        : null,
    [defenderIdentity, pokemonList],
  );

  const attackerPokemon = useMemo(() => {
    if (!attackerIdentity) return null;
    const original = pokemonList.find(
      (p) => p.id === attackerIdentity.numericId,
    );
    if (original) return original;
    return (attackerResolvedForm?.formPokemon ||
      attackerResolvedForm?.basePokemon ||
      null) as never;
  }, [attackerIdentity, attackerResolvedForm, pokemonList]);

  const defenderPokemon = useMemo(() => {
    if (!defenderIdentity) return null;
    const original = pokemonList.find(
      (p) => p.id === defenderIdentity.numericId,
    );
    if (original) return original;
    return (defenderResolvedForm?.formPokemon ||
      defenderResolvedForm?.basePokemon ||
      null) as never;
  }, [defenderIdentity, defenderResolvedForm, pokemonList]);

  const defenderTypes = useMemo(() => {
    if (!defenderPokemon?.types) return [] as string[];
    return (defenderPokemon.types as unknown[])
      .map((t) => extractTypeName(t as never))
      .filter(Boolean) as string[];
  }, [defenderPokemon]);

  const resolvedAttackerMoves = useMemo(() => {
    if (!attackerIdentity)
      return { moves: [] as string[], source: "fallback" as const };
    return resolvePokemonMovesSync(
      attackerIdentity as never,
      pokemonList as never,
    );
  }, [attackerIdentity, pokemonList]);

  const availableMovesRich = useMemo(() => {
    if (!attackerInput || resolvedAttackerMoves.moves.length === 0) return [];
    return resolvedAttackerMoves.moves.map((mName: string) => {
      const key = normalizeId(mName);
      const fm = moveList[mName] ?? moveList[key];
      const typeEs = fm?.type ? translateType(fm.type) : "Normal";
      const rawCat = fm?.category;
      const cat =
        rawCat === "special"
          ? "Especial"
          : rawCat === "status"
            ? "Estado"
            : "Físico";
      return {
        value: mName,
        label: fm?.nameEs || fm?.name || mName,
        type: fm?.type || "normal",
        power: fm?.power ?? null,
        accuracy: fm?.accuracy ?? null,
        description: `${typeEs.toUpperCase()} • ${fm?.power || 0} pot. · Precisión ${fm?.accuracy ?? 100}% · ${cat}`,
      };
    });
  }, [attackerInput, resolvedAttackerMoves, moveList]);

  const validationState = useMemo(() => {
    const attackerData = attackerPokemon
      ? {
          id: attackerPokemon.id,
          name: attackerPokemon.name,
          stats: (attackerPokemon as { stats?: Record<string, number> }).stats,
          baseStats: (attackerPokemon as { baseStats?: Record<string, number> })
            .baseStats,
          level: attackerInput?.level,
        }
      : null;
    const defenderData = defenderPokemon
      ? {
          id: defenderPokemon.id,
          name: defenderPokemon.name,
          stats: (defenderPokemon as { stats?: Record<string, number> }).stats,
          baseStats: (defenderPokemon as { baseStats?: Record<string, number> })
            .baseStats,
          level: defenderInput?.level,
        }
      : null;
    const moveDetail = moveName
      ? (moveList[moveName] ?? moveList[normalizeId(moveName)])
      : null;
    const moveData = moveName
      ? {
          name: moveName,
          power: moveDetail?.power ?? null,
          type: moveDetail?.type,
        }
      : null;
    const base = validateBattleState({
      attacker: attackerData as never,
      defender: defenderData as never,
      move: moveData as never,
      generation,
    });

    const genErrors: BattleValidationError[] = [];
    if (attackerIdentity) {
      const res = SmogonSpeciesMapper.resolve(attackerIdentity, generation);
      if (!res.supported && !res.isFallbackToBase)
        genErrors.push(
          "UNSUPPORTED_FORM_FOR_GENERATION" as BattleValidationError,
        );
    }
    if (defenderIdentity) {
      const res = SmogonSpeciesMapper.resolve(defenderIdentity, generation);
      if (!res.supported && !res.isFallbackToBase)
        genErrors.push(
          "UNSUPPORTED_FORM_FOR_GENERATION" as BattleValidationError,
        );
    }
    const allErrors = [...base.errors, ...genErrors];
    const filtered = allErrors.filter(
      (e) => !(e === "INVALID_BATTLE_CONTEXT" && generation === 9),
    );
    return {
      ...base,
      errors: Array.from(new Set(filtered)),
      valid: Array.from(new Set(filtered)).length === 0,
    };
  }, [
    attackerPokemon,
    defenderPokemon,
    attackerInput,
    defenderInput,
    moveName,
    moveList,
    generation,
    attackerIdentity,
    defenderIdentity,
  ]);

  useEffect(() => {
    if (!attackerInput || availableMovesRich.length === 0) return;
    const defenderChanged =
      defenderInput?.pokemonId !== prevDefenderIdRef.current;
    if (defenderInput) prevDefenderIdRef.current = defenderInput.pokemonId;
    if (!moveName) {
      let best: (typeof availableMovesRich)[number] | null = null;
      let bestScore = -1;
      for (const mv of availableMovesRich) {
        const eff = defenderTypes.length
          ? TypeEffectiveness.getMultiplier(
              mv.type as PokemonType,
              defenderTypes as never,
            )
          : 1;
        const score = (mv.power || 0) * eff;
        if (score > bestScore) {
          bestScore = score;
          best = mv;
        }
      }
      if (best) {
        setMoveNameStore(best.value);
        userHasManuallySelectedMove.current = false;
      }
    } else if (defenderChanged && !userHasManuallySelectedMove.current) {
      let best: (typeof availableMovesRich)[number] | null = null;
      let bestScore = -1;
      for (const mv of availableMovesRich) {
        const eff = defenderTypes.length
          ? TypeEffectiveness.getMultiplier(
              mv.type as PokemonType,
              defenderTypes as never,
            )
          : 1;
        const score = (mv.power || 0) * eff;
        if (score > bestScore) {
          bestScore = score;
          best = mv;
        }
      }
      if (best && best.value !== moveName) setMoveNameStore(best.value);
    }
  }, [
    attackerInput,
    defenderInput,
    defenderTypes,
    availableMovesRich,
    moveName,
    setMoveNameStore,
  ]);

  const handleMoveChange = useCallback(
    (val: string) => {
      userHasManuallySelectedMove.current = true;
      setMoveNameStore(val);
    },
    [setMoveNameStore],
  );
  const handleCalculate = useCallback(async () => {
    setLocalError(null);
    if (!validationState.valid) {
      setLocalError("Faltan datos para calcular");
      return;
    }
    try {
      await calculateResult();
      setActiveTab("result");
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : String(e));
    }
  }, [validationState, calculateResult]);

  const evTotalAtk = useMemo(
    () =>
      attackerInput
        ? Object.values(
            attackerInput.evs as unknown as Record<string, StatValue>,
          ).reduce<number>((s, v) => s + getStatNumber(v), 0)
        : 0,
    [attackerInput],
  );
  const evTotalDef = useMemo(
    () =>
      defenderInput
        ? Object.values(
            defenderInput.evs as unknown as Record<string, StatValue>,
          ).reduce<number>((s, v) => s + getStatNumber(v), 0)
        : 0,
    [defenderInput],
  );

  return (
    <BattleLabView
      pokemonList={pokemonList}
      moveList={moveList}
      attackerInput={attackerInput}
      defenderInput={defenderInput}
      attackerPokemon={attackerPokemon}
      defenderPokemon={defenderPokemon}
      defenderTypes={defenderTypes}
      availableMoves={availableMovesRich}
      moveName={moveName}
      result={result}
      conditions={conditions}
      isCalculating={isCalculating}
      generation={generation}
      validationState={validationState}
      evTotalAtk={evTotalAtk}
      evTotalDef={evTotalDef}
      localError={localError}
      activeTab={activeTab}
      onActiveTabChange={setActiveTab}
      onAttackerChange={setAttacker}
      onDefenderChange={setDefender}
      onMoveChange={handleMoveChange}
      onCalculate={handleCalculate}
      onGenerationChange={setGeneration}
      onWeatherChange={setWeather as (w: WeatherId) => void}
      onTerrainChange={setTerrain as (t: TerrainId) => void}
    />
  );
}
