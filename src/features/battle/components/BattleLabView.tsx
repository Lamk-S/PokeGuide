"use client";
import { useEffect, useMemo, useState, useRef } from "react";
import { usePokedexStore } from "@/features/pokemon/store/usePokedexStore";
import { useMoveStore } from "@/features/moves/store/useMoveStore";
import { useItemStore } from "@/features/items/store/useItemStore";
import { useAbilityStore } from "@/features/abilities/store/useAbilityStore";
import { useBattleStore } from "@/features/battle/store/useBattleStore";
import { ParticipantCard } from "./ParticipantCard";
import { BattleSummary } from "./BattleSummary";
import { BattleResultCard, ResultEmptyState } from "./BattleResultCard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import type { PokemonType } from "@/domain/pokemon/types/pokemon";
import { TypeEffectiveness } from "@/domain/types/TypeChart";
import { parsePokemonIdentity } from "@/domain/pokemon/value-objects/PokemonIdentity";
import { resolvePokemonForm } from "@/domain/pokemon/services/PokemonFormResolver";
import { resolvePokemonMovesSync } from "@/domain/pokemon/services/PokemonMoveResolver";
import {
  validateBattleState,
  type BattleValidationError,
} from "@/domain/battle/services/BattleValidation";
import {
  getStatNumber,
  extractTypeName,
  type StatValue,
  type PokemonTypeRef,
} from "@/domain/pokemon/utils/pokemonHelpers";

type MoveOptionRich = {
  value: string;
  label: string;
  type: string;
  power: number | null;
  accuracy: number | null;
  description: string;
};
type TabId = "attacker" | "defender" | "result";
type MoveDetail = {
  name?: string;
  nameEs?: string;
  type?: string;
  power?: number | null;
  accuracy?: number | null;
  category?: string;
};
type PokemonListItem = {
  id: number;
  name: string;
  types?: PokemonTypeRef[];
  baseStats?: Record<string, number>;
  stats?: Record<string, number>;
  abilities?: Array<{ name: string }>;
  moves?: Array<string | { name: string }>;
};

const GEN_OPTIONS = [
  { value: "3", label: "Gen 3 - Rubí/Zafiro" },
  { value: "4", label: "Gen 4 - Diamante/Perla" },
  { value: "5", label: "Gen 5 - Negro/Blanco" },
  { value: "6", label: "Gen 6 - X/Y" },
  { value: "7", label: "Gen 7 - Sol/Luna" },
  { value: "8", label: "Gen 8 - Espada/Escudo" },
  { value: "9", label: "Gen 9 - Escarlata/Violeta" },
];

const BADGE_LABELS: Record<BattleValidationError, string> = {
  MISSING_ATTACKER: "Falta atacante",
  MISSING_DEFENDER: "Falta defensor",
  INVALID_FORM: "Forma no válida",
  MISSING_MOVE: "Falta movimiento",
  INVALID_MOVE_DATA: "Movimiento inválido",
  MISSING_STATS: "Sin stats",
  INVALID_BATTLE_CONTEXT: "Gen no válida",
  UNSUPPORTED_FORM_FOR_GENERATION: "No disponible en esta gen",
};

export function BattleLabView() {
  const pokemonList = usePokedexStore(
    (s) => s.pokemonList,
  ) as unknown as PokemonListItem[];
  const loadPokemon = usePokedexStore((s) => s.loadPokemon);
  const moveList = useMoveStore((s) => s.moveList) as unknown as Record<
    string,
    MoveDetail
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
  const setAttacker = useBattleStore((s) => s.setAttacker);
  const setDefender = useBattleStore((s) => s.setDefender);
  const setMoveName = useBattleStore((s) => s.setMoveName);
  const calculateResult = useBattleStore((s) => s.calculateResult);
  const generation = useBattleStore((s) => s.generation);
  const setGeneration = useBattleStore((s) => s.setGeneration);
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
    return raw ? parsePokemonIdentity({ id: raw.id, name: raw.name }) : null;
  }, [attackerInput?.pokemonId, pokemonList]);
  const defenderIdentity = useMemo(() => {
    if (!defenderInput?.pokemonId) return null;
    const raw = pokemonList.find((p) => p.id === defenderInput.pokemonId);
    return raw ? parsePokemonIdentity({ id: raw.id, name: raw.name }) : null;
  }, [defenderInput?.pokemonId, pokemonList]);
  const attackerResolvedForm = useMemo(
    () =>
      attackerIdentity
        ? resolvePokemonForm(
            attackerIdentity,
            pokemonList as unknown as Array<{ id: number; name: string }>,
          )
        : null,
    [attackerIdentity, pokemonList],
  );
  const defenderResolvedForm = useMemo(
    () =>
      defenderIdentity
        ? resolvePokemonForm(
            defenderIdentity,
            pokemonList as unknown as Array<{ id: number; name: string }>,
          )
        : null,
    [defenderIdentity, pokemonList],
  );

  const attackerPokemon = useMemo(() => {
    if (!attackerIdentity) return undefined;
    const original = pokemonList.find(
      (p) => p.id === attackerIdentity.numericId,
    );
    if (original) return original;
    return (attackerResolvedForm?.formPokemon ||
      attackerResolvedForm?.basePokemon ||
      null) as unknown as PokemonListItem | null;
  }, [attackerIdentity, attackerResolvedForm, pokemonList]);
  const defenderPokemon = useMemo(() => {
    if (!defenderIdentity) return undefined;
    const original = pokemonList.find(
      (p) => p.id === defenderIdentity.numericId,
    );
    if (original) return original;
    return (defenderResolvedForm?.formPokemon ||
      defenderResolvedForm?.basePokemon ||
      null) as unknown as PokemonListItem | null;
  }, [defenderIdentity, defenderResolvedForm, pokemonList]);

  const defenderTypes = useMemo(() => {
    if (!defenderPokemon?.types) return [] as string[];
    return defenderPokemon.types
      .map((t) => extractTypeName(t))
      .filter(Boolean) as string[];
  }, [defenderPokemon]);

  const resolvedAttackerMoves = useMemo(() => {
    if (!attackerIdentity)
      return { moves: [] as string[], source: "fallback" as const };
    return resolvePokemonMovesSync(
      attackerIdentity,
      pokemonList as unknown as Array<{ id: number; name: string }>,
    );
  }, [attackerIdentity, pokemonList]);

  const availableMovesRich = useMemo((): MoveOptionRich[] => {
    if (!attackerInput || resolvedAttackerMoves.moves.length === 0) return [];
    return resolvedAttackerMoves.moves.map((mName: string) => {
      const fm = moveList[mName];
      return {
        value: mName,
        label: fm?.nameEs || fm?.name || mName,
        type: fm?.type || "normal",
        power: fm?.power ?? null,
        accuracy: fm?.accuracy ?? null,
        description: `${(fm?.type || "normal").toUpperCase()} • ${fm?.power || 0} pot.`,
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
    const moveDetail = moveName ? moveList[moveName] : null;
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
    const filtered = base.errors.filter(
      (e) => !(e === "INVALID_BATTLE_CONTEXT" && generation === 9),
    );
    return { ...base, errors: filtered, valid: filtered.length === 0 };
  }, [
    attackerPokemon,
    defenderPokemon,
    attackerInput,
    defenderInput,
    moveName,
    moveList,
    generation,
  ]);

  useEffect(() => {
    if (!attackerInput || availableMovesRich.length === 0) return;
    const defenderChanged =
      defenderInput?.pokemonId !== prevDefenderIdRef.current;
    if (defenderInput) prevDefenderIdRef.current = defenderInput.pokemonId;
    if (!moveName) {
      let best: MoveOptionRich | null = null;
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
        setMoveName(best.value);
        userHasManuallySelectedMove.current = false;
      }
    } else if (defenderChanged && !userHasManuallySelectedMove.current) {
      let best: MoveOptionRich | null = null;
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
      if (best && best.value !== moveName) setMoveName(best.value);
    }
  }, [
    attackerInput,
    defenderInput,
    defenderTypes,
    availableMovesRich,
    moveName,
    setMoveName,
  ]);

  const handleMoveChange = (val: string) => {
    userHasManuallySelectedMove.current = true;
    setMoveName(val);
  };
  const handleCalculate = async () => {
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
  };
  const canCalculate = validationState.valid && !isCalculating;
  const missing: string[] = [];
  if (!attackerInput) missing.push("atacante");
  if (!defenderInput) missing.push("defensor");
  if (!moveName) missing.push("movimiento");
  const evTotalAtk = useMemo(() => {
    if (!attackerInput) return 0;
    return Object.values(
      attackerInput.evs as unknown as Record<string, StatValue>,
    ).reduce<number>((s, v) => s + getStatNumber(v), 0);
  }, [attackerInput]);
  const resolvedMoveName =
    moveList[moveName]?.nameEs || moveList[moveName]?.name || moveName;
  const tabs = [
    { id: "attacker" as TabId, label: "Atacante" },
    { id: "defender" as TabId, label: "Defensor" },
    { id: "result" as TabId, label: "Resultado" },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#182033]">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 pt-6 pb-2">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text- font-bold tracking-[-0.02em]">
              Laboratorio de Batalla
            </h1>
            <p className="text- text-[#5F6B7A] mt-1 max-w- leading-snug">
              Simula daño real considerando nivel, naturaleza, IVs, EVs, objeto,
              habilidad, estado, clima y terreno. Optimizado para competitivo y
              VGC.
            </p>
          </div>
          <div className="flex flex-row items-end gap-3 shrink-0">
            <div className="flex flex-col gap-1.5 min-w-">
              <Label className="text- uppercase tracking-[0.12em] text-[#5F6B7A]">
                Generación
              </Label>
              <Combobox
                options={GEN_OPTIONS}
                value={generation.toString()}
                onValueChange={(v) => setGeneration(parseInt(v, 10))}
                placeholder="Elige generación"
              />
            </div>
            <span
              className={`inline-flex items-center gap-2 h-8 px-3 rounded-full border text-xs font-medium ${result ? "bg-[#EFF6FF] border-[#BFDBFE] text-[#2868B2]" : canCalculate ? "bg-[#ECFDF5] border-[#B7E4CE] text-[#16845B]" : "bg-[#FFFBEB] border-[#F6E6B8] text-[#A96B00]"}`}
            >
              <span
                className={`size-1.5 rounded-full ${result ? "bg-[#2868B2]" : canCalculate ? "bg-[#16845B]" : "bg-[#D9A900] animate-pulse"}`}
              />
              {result
                ? "Resultado listo"
                : canCalculate
                  ? "Listo para calcular"
                  : BADGE_LABELS[
                      validationState.errors[0] as BattleValidationError
                    ] || "Faltan datos"}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 pb-4">
        <BattleSummary
          attackerPokemon={attackerPokemon as never}
          defenderPokemon={defenderPokemon as never}
          attackerLevel={attackerInput?.level}
          defenderLevel={defenderInput?.level}
          generation={generation}
        />
      </div>

      <div className="lg:hidden sticky top-14 z-20 bg-[#F5F7FA] px-4 pt-3">
        <div className="flex p-1 rounded-xl bg-[#E8ECF1] gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 h-9 rounded-lg text- font-medium transition-colors ${activeTab === t.id ? "bg-white shadow text-[#182033]" : "text-[#5F6B7A]"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-6 pb-24 lg:pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <section
            className={`${activeTab !== "attacker" ? "hidden lg:block" : "block"} self-start`}
          >
            <ParticipantCard
              label="Atacante"
              pokemonList={pokemonList as never}
              input={attackerInput}
              onChange={setAttacker}
              facing="left"
              generation={generation}
              isAttacker
              moveName={moveName}
              onMoveChange={handleMoveChange}
              availableMoves={availableMovesRich}
              defenderTypes={defenderTypes}
            />
          </section>
          <section
            className={`${activeTab === "attacker" ? "hidden lg:block" : "block"} self-start space-y-6`}
          >
            <ParticipantCard
              label="Defensor"
              pokemonList={pokemonList as never}
              input={defenderInput}
              onChange={setDefender}
              facing="right"
              generation={generation}
            />
            {result ? (
              <BattleResultCard
                result={result}
                attackerPokemon={attackerPokemon as never}
                defenderPokemon={defenderPokemon as never}
                attackerInput={attackerInput}
                defenderInput={defenderInput}
                conditions={conditions}
                moveName={resolvedMoveName}
                {...(moveList[moveName]?.type
                  ? { moveType: moveList[moveName]?.type }
                  : {})}
                {...(typeof moveList[moveName]?.power === "number"
                  ? { movePower: moveList[moveName]?.power as number }
                  : {})}
              />
            ) : (
              <ResultEmptyState missing={missing} />
            )}
            {localError && (
              <p className="mt-3 text- text-[#C7373F] p-3 bg-[#FFF5F5] rounded-xl border border-[#FEE2E2]">
                {localError}
              </p>
            )}
          </section>
        </div>
      </main>

      <div className="fixed lg:sticky bottom-0 left-0 right-0 z-30 bg-white border-t border-[#D9E0E8]">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-3">
          <div className="hidden md:flex items-center gap-4 text-xs">
            <span
              className={`flex items-center gap-1.5 ${evTotalAtk > 510 ? "text-[#C7373F]" : "text-[#5F6B7A]"}`}
            >
              <span
                className={`size-2 rounded-full ${evTotalAtk > 510 ? "bg-[#C7373F]" : evTotalAtk === 510 ? "bg-[#16845B]" : "bg-[#B9C4D1]"}`}
              />
              EVs: {evTotalAtk}/510
            </span>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <Button
              variant="outline"
              className="hidden md:inline-flex h-9 px-3 rounded-xl border"
              onClick={() => {
                if (attackerInput && defenderInput) {
                  setAttacker(defenderInput);
                  setDefender(attackerInput);
                }
              }}
            >
              Intercambiar
            </Button>
            <Button
              onClick={handleCalculate}
              disabled={!canCalculate}
              className={`flex-1 md:flex-none h-11 px-5 rounded-xl text-sm font-semibold ${!canCalculate ? "bg-[#F0F3F7] text-[#7B8794] border cursor-not-allowed" : "bg-[#D93B32] text-white hover:bg-[#B92C2A]"}`}
            >
              {isCalculating ? "Calculando..." : "Calcular daño"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
