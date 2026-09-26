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
import { translateType } from "@/components/ui/TypeBadge";

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
  { value: "3", label: "Gen 3 · Rubí/Zafiro" },
  { value: "4", label: "Gen 4 · Diamante/Perla" },
  { value: "5", label: "Gen 5 · Negro/Blanco" },
  { value: "6", label: "Gen 6 · X/Y" },
  { value: "7", label: "Gen 7 · Sol/Luna" },
  { value: "8", label: "Gen 8 · Espada/Escudo" },
  { value: "9", label: "Gen 9 · Escarlata/Violeta" },
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
      const typeEs = fm?.type ? translateType(fm.type) : "Normal";
      const rawCat = (fm as { category?: string } | undefined)?.category;
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
  const evTotalDef = useMemo(() => {
    if (!defenderInput) return 0;
    return Object.values(
      defenderInput.evs as unknown as Record<string, StatValue>,
    ).reduce<number>((s, v) => s + getStatNumber(v), 0);
  }, [defenderInput]);

  const resolvedMoveName =
    moveList[moveName]?.nameEs || moveList[moveName]?.name || moveName;
  const tabs = [
    { id: "attacker" as TabId, label: "Atacante" },
    { id: "result" as TabId, label: "Resultado" },
    { id: "defender" as TabId, label: "Defensor" },
  ];

  return (
    <div className="min-h-screen bg-[#F8F5F0] text-[#1A1A1A] -mx-4 md:-mx-6 lg:-mx-8 -my-6 md:-my-8">
      {/* Sticky context bar - meta + VS - stays visible on scroll */}
      <div className="sticky top-14 z-30 w-full bg-[#FFFEFB] border-b border-[#EDE8E0] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        {/* Top meta bar - responsive, no more "Labr" truncation */}
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-2 md:py-0 md:h-11 flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center justify-between gap-3 w-full md:w-auto min-w-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <h1 className="text-[12px] font-bold tracking-[-0.01em] whitespace-nowrap shrink-0">
                Laboratorio de Batalla
              </h1>
              <span className="hidden md:block h-3 w-px bg-[#EDE8E0] shrink-0" />
              <p className="hidden lg:block text-[11px] text-[#7A7570] truncate max-w-140 leading-snug">
                Herramienta de precisión para simular daño real con naturaleza,
                IVs, EVs, objeto, habilidad, estado, clima y terreno.
              </p>
            </div>
            {/* Mobile badge */}
            <span
              className={`md:hidden inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full border text-[10px] font-mono font-medium shrink-0 ${result ? "bg-[#111] border-[#111] text-white" : canCalculate ? "bg-[#E8F5E9] border-[#C8E6C9] text-[#2D5A27]" : "bg-[#FFF3E0] border-[#FFE0B2] text-[#7A3D00]"}`}
            >
              <span
                className={`size-1.5 rounded-full ${result ? "bg-white" : canCalculate ? "bg-[#2D5A27]" : "bg-[#D97706] animate-pulse"}`}
              />
              {result ? "LISTO" : canCalculate ? "LISTO" : "FALTA"}
            </span>
          </div>
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Label className="hidden md:block text-[10px] uppercase tracking-[0.08em] text-[#9A9590] font-semibold shrink-0">
                Generación
              </Label>
              <div className="w-full md:w-55">
                <Combobox
                  options={GEN_OPTIONS}
                  value={generation.toString()}
                  onValueChange={(v) => setGeneration(parseInt(v, 10))}
                  placeholder="Gen 9 · Escarlata/Violeta"
                />
              </div>
            </div>
            <span
              className={`hidden md:inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full border text-[10px] font-mono font-medium shrink-0 ${result ? "bg-[#111] border-[#111] text-white" : canCalculate ? "bg-[#E8F5E9] border-[#C8E6C9] text-[#2D5A27]" : "bg-[#FFF3E0] border-[#FFE0B2] text-[#7A3D00]"}`}
            >
              <span
                className={`size-1.5 rounded-full ${result ? "bg-white" : canCalculate ? "bg-[#2D5A27]" : "bg-[#D97706] animate-pulse"}`}
              />
              {result
                ? "CÁLCULO LISTO"
                : canCalculate
                  ? "LISTO"
                  : (
                      BADGE_LABELS[
                        validationState.errors[0] as BattleValidationError
                      ] || "FALTAN DATOS"
                    ).toUpperCase()}
            </span>
          </div>
        </div>

        <BattleSummary
          attackerPokemon={attackerPokemon as never}
          defenderPokemon={defenderPokemon as never}
          attackerLevel={attackerInput?.level}
          defenderLevel={defenderInput?.level}
          generation={generation}
          moveName={resolvedMoveName}
          moveType={moveName ? moveList[moveName]?.type : undefined}
          movePower={
            moveName ? ((moveList[moveName]?.power as number) ?? null) : null
          }
        />
      </div>

      {/* Mobile tabs - sticky debajo del VS bar */}
      <div className="lg:hidden sticky top-28 z-20 bg-[#F8F5F0] px-4 pt-3 pb-2 border-b border-[#EDE8E0]">
        <div className="flex p-1 rounded-xl bg-[#EDE8E0] gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 h-8 rounded-lg text-[12px] font-medium transition-colors ${activeTab === t.id ? "bg-white shadow-sm text-[#111]" : "text-[#7A7570]"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto px-4 lg:px-6 py-5 pb-24 lg:pb-6">
        {/* 3 columns - desktop - items-start para que no se estiren cuando uno es alto */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <section
            className={`${activeTab !== "attacker" ? "hidden lg:block" : "block"} lg:col-span-4 xl:col-span-4 self-start`}
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
            className={`${activeTab !== "result" ? "hidden lg:block" : "block"} lg:col-span-4 xl:col-span-4 self-start`}
          >
            {result ? (
              <BattleResultCard
                result={result}
                attackerPokemon={attackerPokemon as never}
                defenderPokemon={defenderPokemon as never}
                attackerInput={attackerInput}
                defenderInput={defenderInput}
                conditions={conditions}
                moveName={resolvedMoveName}
                generation={generation}
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
              <p className="mt-3 text-[12px] text-[#991B1B] p-3 bg-[#FEF2F2] rounded-xl border border-[#FECACA] font-mono">
                {localError}
              </p>
            )}
          </section>

          <section
            className={`${activeTab !== "defender" ? "hidden lg:block" : "block"} lg:col-span-4 xl:col-span-4 self-start`}
          >
            <ParticipantCard
              label="Defensor"
              pokemonList={pokemonList as never}
              input={defenderInput}
              onChange={setDefender}
              facing="right"
              generation={generation}
            />
          </section>
        </div>
      </main>

      <div className="fixed lg:sticky bottom-0 left-0 right-0 z-30 bg-[#FFFEFB]/95 backdrop-blur-md border-t border-[#EDE8E0]">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6 h-14 flex items-center justify-between gap-3">
          <div className="hidden md:flex items-center gap-4 text-[10px] font-mono text-[#9A9590]">
            <span className={evTotalAtk > 510 ? "text-[#991B1B]" : ""}>
              {evTotalAtk}/510 Esfuerzo atacante
            </span>
            <span className="text-[#EDE8E0]">·</span>
            <span className={evTotalDef > 510 ? "text-[#991B1B]" : ""}>
              {evTotalDef}/510 Esfuerzo defensor
            </span>
            <span className="text-[#EDE8E0]">·</span>
            <span>
              VIDA RESTANTE{" "}
              {result
                ? `${(100 - result.damage.maxPercent).toFixed(1)}%`
                : "0%"}
            </span>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <Button
              variant="ghost"
              className="hidden md:inline-flex h-8 px-3 rounded-full text-[11px] font-mono underline decoration-dotted underline-offset-4"
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
              className={`flex-1 md:flex-none h-9 px-5 rounded-full text-[12px] font-semibold ${!canCalculate ? "bg-[#F0EDE6] text-[#9A9590] cursor-not-allowed" : "bg-[#111] text-white hover:bg-black"}`}
            >
              {isCalculating ? "Calculando..." : "Calcular daño"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
