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
import type {
  PokemonType,
  PokemonTypeName,
} from "@/domain/pokemon/types/pokemon";
import { TypeEffectiveness } from "@/domain/types/TypeChart";
import { parsePokemonIdentity } from "@/domain/pokemon/value-objects/PokemonIdentity";
import { resolvePokemonForm } from "@/domain/pokemon/services/PokemonFormResolver";
import { resolvePokemonMovesSync } from "@/domain/pokemon/services/PokemonMoveResolver";
import {
  validateBattleState,
  type BattleValidationError,
} from "@/domain/battle/services/BattleValidation";
import { resolveBattleContext } from "@/domain/battle/types/BattleContext";

type MoveOptionRich = {
  value: string;
  label: string;
  type: string;
  power: number | null;
  accuracy: number | null;
  description: string;
};
type TabId = "attacker" | "defender" | "result";
interface TabItem {
  id: TabId;
  label: string;
  count: number;
}

type StatValue = number | { value: number };
type PokemonTypeRef = PokemonTypeName | { type?: { name?: string } } | string;
type MoveDetail = {
  name?: string;
  nameEs?: string;
  type?: string;
  power?: number | null;
  accuracy?: number | null;
  category?: string;
};

function getStatNumber(v: StatValue | undefined): number {
  if (typeof v === "number") return v;
  if (v && typeof v === "object" && "value" in v) {
    return (v as { value: number }).value;
  }
  return 0;
}

function extractTypeName(t: PokemonTypeRef): string {
  if (typeof t === "string") return t;
  if (t && typeof t === "object" && "type" in t) {
    return (t as { type?: { name?: string } }).type?.name || "";
  }
  return "";
}

const GEN_OPTIONS = [
  { value: "3", label: "Gen 3 - Rubí/Zafiro" },
  { value: "4", label: "Gen 4 - Diamante/Perla" },
  { value: "5", label: "Gen 5 - Negro/Blanco" },
  { value: "6", label: "Gen 6 - X/Y" },
  { value: "7", label: "Gen 7 - Sol/Luna" },
  { value: "8", label: "Gen 8 - Espada/Escudo" },
  { value: "9", label: "Gen 9 - Escarlata/Violeta" },
];

const VALIDATION_MESSAGES: Record<BattleValidationError, string> = {
  MISSING_ATTACKER: "Elige tu Pokémon atacante",
  MISSING_DEFENDER: "Elige tu Pokémon defensor",
  INVALID_FORM: "Forma no válida",
  MISSING_MOVE: "Elige un movimiento",
  INVALID_MOVE_DATA: "Movimiento sin datos",
  MISSING_STATS: "Sin estadísticas base",
  INVALID_BATTLE_CONTEXT: "Generación no válida",
  UNSUPPORTED_FORM_FOR_GENERATION: "No disponible en esta generación",
};

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
  const pokemonList = usePokedexStore((s) => s.pokemonList);
  const loadPokemon = usePokedexStore((s) => s.loadPokemon);
  const moveList = useMoveStore((s) => s.moveList);
  const loadMoves = useMoveStore((s) => s.loadMoves);
  const loadItems = useItemStore((s) => s.loadItems);
  const loadAbilities = useAbilityStore((s) => s.loadAbilities);

  const attackerInput = useBattleStore((s) => s.attackerInput);
  const defenderInput = useBattleStore((s) => s.defenderInput);
  const moveName = useBattleStore((s) => s.moveName);
  const result = useBattleStore((s) => s.result);
  const isCalculating = useBattleStore((s) => s.isCalculating);
  const setAttacker = useBattleStore((s) => s.setAttacker);
  const setDefender = useBattleStore((s) => s.setDefender);
  const setMoveName = useBattleStore((s) => s.setMoveName);
  const calculateResult = useBattleStore((s) => s.calculateResult);
  const setGeneration = useBattleStore((s) => s.setGeneration);
  const generationFromStore = useBattleStore((s) => s.generation);

  const [localError, setLocalError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    BattleValidationError[]
  >([]);
  const [generation, setLocalGeneration] = useState<number>(
    generationFromStore ?? 9,
  );
  const [activeTab, setActiveTab] = useState<TabId>("attacker");

  const prevDefenderIdRef = useRef<number | null>(null);
  const userHasManuallySelectedMove = useRef(false);

  useEffect(() => {
    loadPokemon();
    loadMoves();
    loadItems();
    loadAbilities();
  }, [loadPokemon, loadMoves, loadItems, loadAbilities]);

  useEffect(() => {
    if (generation !== generationFromStore) {
      setGeneration(generation);
    }
  }, [generation, generationFromStore, setGeneration]);

  // --- ETAPA 1: Normalización - Identidad canónica ---
  const attackerIdentity = useMemo(() => {
    if (!attackerInput?.pokemonId) return null;
    const raw = pokemonList.find((p) => p.id === attackerInput.pokemonId);
    if (!raw) return null;
    return parsePokemonIdentity({ id: raw.id, name: raw.name });
  }, [attackerInput?.pokemonId, pokemonList]);

  const defenderIdentity = useMemo(() => {
    if (!defenderInput?.pokemonId) return null;
    const raw = pokemonList.find((p) => p.id === defenderInput.pokemonId);
    if (!raw) return null;
    return parsePokemonIdentity({ id: raw.id, name: raw.name });
  }, [defenderInput?.pokemonId, pokemonList]);

  // --- ETAPA 2: Resolución de Pokémon y Forma ---
  const attackerResolvedForm = useMemo(() => {
    if (!attackerIdentity) return null;
    return resolvePokemonForm(
      attackerIdentity,
      pokemonList as unknown as Array<{
        id: number;
        name: string;
        baseStats?: Record<string, number>;
        stats?: Record<string, number>;
      }>,
    );
  }, [attackerIdentity, pokemonList]);

  const defenderResolvedForm = useMemo(() => {
    if (!defenderIdentity) return null;
    return resolvePokemonForm(
      defenderIdentity,
      pokemonList as unknown as Array<{
        id: number;
        name: string;
        baseStats?: Record<string, number>;
        stats?: Record<string, number>;
      }>,
    );
  }, [defenderIdentity, pokemonList]);

  const attackerPokemon = useMemo(() => {
    if (!attackerIdentity) return undefined;
    const original = pokemonList.find(
      (p) => p.id === attackerIdentity.numericId,
    );
    if (original) return original;
    return (attackerResolvedForm?.formPokemon ||
      attackerResolvedForm?.basePokemon ||
      null) as unknown as
      | import("@/domain/pokemon/types/pokemon").Pokemon
      | null;
  }, [attackerIdentity, attackerResolvedForm, pokemonList]);

  const defenderPokemon = useMemo(() => {
    if (!defenderIdentity) return undefined;
    const original = pokemonList.find(
      (p) => p.id === defenderIdentity.numericId,
    );
    if (original) return original;
    return (defenderResolvedForm?.formPokemon ||
      defenderResolvedForm?.basePokemon ||
      null) as unknown as
      | import("@/domain/pokemon/types/pokemon").Pokemon
      | null;
  }, [defenderIdentity, defenderResolvedForm, pokemonList]);

  const defenderTypes = useMemo(() => {
    if (!defenderPokemon?.types) return [] as string[];
    return (defenderPokemon.types as PokemonTypeRef[])
      .map(extractTypeName)
      .filter((n): n is string => Boolean(n));
  }, [defenderPokemon]);

  // --- ETAPA 3: Resolución de movimientos con herencia + overrides ---
  const resolvedAttackerMoves = useMemo(() => {
    if (!attackerIdentity)
      return {
        moves: [],
        source: "fallback" as const,
        warnings: [] as string[],
      };
    return resolvePokemonMovesSync(
      attackerIdentity,
      pokemonList as unknown as Array<{
        name: string;
        moves?: Array<{ name: string }>;
      }>,
    );
  }, [attackerIdentity, pokemonList]);

  const availableMovesRich = useMemo((): MoveOptionRich[] => {
    if (!attackerInput) return [];
    if (resolvedAttackerMoves.moves.length === 0) {
      return [];
    }
    const list = resolvedAttackerMoves.moves
      .map((moveNameStr: string) => {
        const fm = (moveList as Record<string, MoveDetail>)[moveNameStr];
        if (!fm) {
          return {
            value: moveNameStr,
            label: moveNameStr,
            type: "normal",
            power: null,
            accuracy: null,
            description: "Datos incompletos",
          } as MoveOptionRich;
        }
        const opt: MoveOptionRich = {
          value: moveNameStr,
          label: fm.nameEs || fm.name || moveNameStr,
          type: fm.type || "normal",
          power: fm.power ?? null,
          accuracy: fm.accuracy ?? null,
          description: `${(fm.type || "normal").toUpperCase()} • ${fm.power || 0} pot. • ${fm.accuracy || "—"}%`,
        };
        return opt;
      })
      .filter((x): x is MoveOptionRich => x !== null);
    return list;
  }, [attackerInput, resolvedAttackerMoves, moveList]);

  // --- ETAPA 4: Validación explícita antes del cálculo ---
  const battleContext = useMemo(
    () => resolveBattleContext(generation),
    [generation],
  );
  void battleContext;

  const validationState = useMemo(() => {
    const attackerData = attackerPokemon
      ? {
          id: attackerPokemon.id,
          name: attackerPokemon.name,
          stats: (
            attackerPokemon as unknown as { stats?: Record<string, number> }
          ).stats,
          baseStats: (
            attackerPokemon as unknown as { baseStats?: Record<string, number> }
          ).baseStats,
          level: attackerInput?.level,
        }
      : null;
    const defenderData = defenderPokemon
      ? {
          id: defenderPokemon.id,
          name: defenderPokemon.name,
          stats: (
            defenderPokemon as unknown as { stats?: Record<string, number> }
          ).stats,
          baseStats: (
            defenderPokemon as unknown as { baseStats?: Record<string, number> }
          ).baseStats,
          level: defenderInput?.level,
        }
      : null;
    const moveDetail = moveName
      ? (moveList as unknown as Record<string, MoveDetail>)[moveName]
      : null;
    const moveData = moveName
      ? {
          name: moveName,
          power: moveDetail?.power ?? null,
          type: moveDetail?.type,
          category: moveDetail?.category,
        }
      : null;

    const baseValidation = validateBattleState({
      attacker:
        attackerData as unknown as import("@/domain/battle/services/BattleValidation").BattlePokemonForValidation,
      defender:
        defenderData as unknown as import("@/domain/battle/services/BattleValidation").BattlePokemonForValidation,
      move: moveData as unknown as import("@/domain/battle/services/BattleValidation").BattleMoveForValidation,
      generation,
    });

    const filteredErrors = baseValidation.errors.filter((err) => {
      if (err === "INVALID_BATTLE_CONTEXT" && generation === 9) {
        return false;
      }
      return true;
    });

    let moveLegalityError: string | null = null;
    if (
      moveName &&
      attackerIdentity &&
      resolvedAttackerMoves.moves.length > 0
    ) {
      const isLegal = resolvedAttackerMoves.moves.some(
        (m) => m.toLowerCase() === moveName.toLowerCase(),
      );
      if (!isLegal) {
        const hasOverride =
          resolvedAttackerMoves.source === "override" ||
          resolvedAttackerMoves.source === "inherited";
        if (!hasOverride) {
          moveLegalityError = `El movimiento ${moveName} no es legal para ${attackerIdentity.originalName} (ID ${attackerIdentity.numericId}) - movepool vacío, necesita override`;
        }
      }
    }

    return {
      ...baseValidation,
      errors: filteredErrors,
      valid: filteredErrors.length === 0,
      moveLegalityError,
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
    resolvedAttackerMoves,
  ]);

  useEffect(() => {
    if (!attackerInput || availableMovesRich.length === 0) return;
    const defenderChanged =
      defenderInput?.pokemonId !== prevDefenderIdRef.current;
    if (defenderInput) prevDefenderIdRef.current = defenderInput.pokemonId;
    if (!moveName) {
      let bestMove: MoveOptionRich | null = null;
      let bestScore = -1;
      for (const mv of availableMovesRich) {
        const eff =
          defenderTypes.length > 0
            ? TypeEffectiveness.getMultiplier(
                mv.type as PokemonType,
                defenderTypes as PokemonType[],
              )
            : 1;
        const score = (mv.power || 0) * eff;
        if (score > bestScore) {
          bestScore = score;
          bestMove = mv;
        }
      }
      if (bestMove) {
        setMoveName(bestMove.value);
        userHasManuallySelectedMove.current = false;
      }
    } else if (defenderChanged && !userHasManuallySelectedMove.current) {
      let bestMove: MoveOptionRich | null = null;
      let bestScore = -1;
      for (const mv of availableMovesRich) {
        const eff =
          defenderTypes.length > 0
            ? TypeEffectiveness.getMultiplier(
                mv.type as PokemonType,
                defenderTypes as PokemonType[],
              )
            : 1;
        const score = (mv.power || 0) * eff;
        if (score > bestScore) {
          bestScore = score;
          bestMove = mv;
        }
      }
      if (bestMove && bestMove.value !== moveName) {
        setMoveName(bestMove.value);
      }
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
    setValidationErrors([]);

    if (!validationState.valid) {
      setValidationErrors(validationState.errors);
      const firstError = validationState.errors[0];
      setLocalError(
        `${VALIDATION_MESSAGES[firstError]}. ${validationState.messages[firstError]}`,
      );
      return;
    }

    if (attackerResolvedForm && !attackerResolvedForm.isValid) {
      setLocalError(
        `Atacante inválido: ${attackerResolvedForm.reason}. Usa forma base.`,
      );
      setValidationErrors(["INVALID_FORM"]);
      return;
    }
    if (defenderResolvedForm && !defenderResolvedForm.isValid) {
      setLocalError(
        `Defensor inválido: ${defenderResolvedForm.reason}. Usa forma base.`,
      );
      setValidationErrors(["INVALID_FORM"]);
      return;
    }

    try {
      await calculateResult();
      setActiveTab("result");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.toLowerCase().includes("hp")) {
        setLocalError(
          `No se pudo calcular el HP del defensor. Forma ${defenderIdentity?.originalName} (ID ${defenderIdentity?.numericId}) no soportada en Gen ${generation}. Heredando stats de base pero Smogon no la reconoce. Prueba con forma base o cambia generación. Detalle: ${msg}`,
        );
        setValidationErrors(["UNSUPPORTED_FORM_FOR_GENERATION"]);
      } else {
        setLocalError(msg);
        setValidationErrors(["INVALID_BATTLE_CONTEXT"]);
      }
      console.error("[BattleLab] calculate error", e, {
        attackerIdentity,
        defenderIdentity,
        battleContext,
      });
    }
  };

  const canCalculate = validationState.valid && !isCalculating;
  const missing: string[] = [];
  if (!attackerInput) missing.push("atacante");
  if (!defenderInput) missing.push("defensor");
  if (!moveName) missing.push("movimiento");

  const moveRecord = moveList as unknown as Record<
    string,
    { nameEs?: string; name?: string }
  >;
  const resolvedMoveName =
    moveRecord[moveName]?.nameEs || moveRecord[moveName]?.name || moveName;
  const evTotalAtk = useMemo(() => {
    if (!attackerInput) return 0;
    const evsRecord = attackerInput.evs as unknown as Record<string, StatValue>;
    return Object.values(evsRecord).reduce<number>(
      (s, v) => s + getStatNumber(v),
      0,
    );
  }, [attackerInput]);

  const tabs: TabItem[] = [
    { id: "attacker", label: "Atacante", count: 0 },
    { id: "defender", label: "Defensor", count: defenderInput ? 1 : 0 },
    { id: "result", label: "Resultado", count: result ? 1 : 0 },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#182033]">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 pt-6 pb-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-[30px] leading-[1.1] font-bold tracking-[-0.02em] text-[#182033]">
              Laboratorio de Batalla
            </h1>
            <p className="mt-2 text-[13px] md:text-[14px] text-[#5F6B7A] leading-normal max-w-160">
              Calcula daño, efectividad de tipos y prueba tu equipo. Elige
              generación, Pokémon y movimiento para ver el resultado al
              instante.
            </p>
          </div>
          <div className="flex flex-row items-end gap-3 shrink-0">
            <div className="flex flex-col gap-1.5 min-w-45">
              <Label className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#5F6B7A]">
                Generación
              </Label>
              <Combobox
                options={GEN_OPTIONS}
                value={generation.toString()}
                onValueChange={(v) =>
                  setLocalGeneration(Number.parseInt(v, 10))
                }
                placeholder="Elige generación"
              />
            </div>
            {(() => {
              const firstError = validationState.errors[0] as
                | BattleValidationError
                | undefined;
              const badgeText = firstError
                ? BADGE_LABELS[firstError] || VALIDATION_MESSAGES[firstError]
                : "datos";
              const detailText = firstError
                ? validationState.messages[firstError]
                : "";
              return (
                <div className="flex flex-col items-end gap-1">
                  <span
                    title={detailText}
                    className={`inline-flex items-center gap-2 h-8 px-3 rounded-full border text-xs font-medium ${result ? "bg-[#EFF6FF] border-[#BFDBFE] text-[#2868B2]" : canCalculate ? "bg-[#ECFDF5] border-[#B7E4CE] text-[#16845B]" : "bg-[#FFFBEB] border-[#F6E6B8] text-[#A96B00]"}`}
                  >
                    <span
                      className={`size-1.5 rounded-full ${result ? "bg-[#2868B2]" : canCalculate ? "bg-[#16845B]" : "bg-[#D9A900]"} ${result ? "" : "animate-pulse"}`}
                    />
                    {result
                      ? "✓ Resultado listo"
                      : canCalculate
                        ? "✓ Listo para calcular"
                        : badgeText}
                  </span>
                  {firstError &&
                    detailText &&
                    firstError !== "MISSING_ATTACKER" &&
                    firstError !== "MISSING_DEFENDER" &&
                    firstError !== "MISSING_MOVE" && (
                      <span className="text-[11px] text-[#A96B00] max-w-50 text-right leading-tight">
                        {detailText}
                      </span>
                    )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      <BattleSummary
        attackerPokemon={attackerPokemon ?? undefined}
        defenderPokemon={defenderPokemon ?? undefined}
        attackerInput={attackerInput}
        defenderInput={defenderInput}
      />

      <div className="lg:hidden sticky top-14 z-20 bg-[#F5F7FA] px-4 pt-3">
        <div className="flex p-1 rounded-[10px] bg-[#E8ECF1] gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 h-9 rounded-lg text-[13px] font-medium flex items-center justify-center gap-1.5 transition-all ${activeTab === t.id ? "bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] text-[#182033]" : "text-[#5F6B7A]"}`}
            >
              {t.label}
              {t.count > 0 && (
                <span
                  className={`size-5 rounded-full text-[11px] flex items-center justify-center ${activeTab === t.id ? "bg-[#182033] text-white" : "bg-white border border-[#E2E8F0]"}`}
                >
                  {t.count}
                </span>
              )}
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
              pokemonList={pokemonList}
              input={attackerInput}
              onChange={setAttacker}
              facing="left"
              generation={generation}
              isAttacker={true}
              moveName={moveName}
              onMoveChange={handleMoveChange}
              availableMoves={availableMovesRich}
              defenderTypes={defenderTypes}
            />
            {attackerResolvedForm && !attackerResolvedForm.isValid && (
              <p className="mt-2 text-[12px] text-[#C7373F] bg-[#FFF5F5] p-2 rounded-lg border border-[#FEE2E2]">
                {attackerResolvedForm.reason}
              </p>
            )}
          </section>

          <section
            className={`${activeTab !== "defender" && activeTab !== "result" ? "hidden lg:block" : activeTab === "defender" ? "block" : "hidden lg:block"} self-start space-y-6`}
          >
            <div
              className={activeTab === "result" ? "hidden lg:block" : "block"}
            >
              <ParticipantCard
                label="Defensor"
                pokemonList={pokemonList}
                input={defenderInput}
                onChange={setDefender}
                facing="right"
                generation={generation}
              />
            </div>
            <div
              className={`${activeTab === "defender" ? "hidden lg:block" : "block"}`}
            >
              {result ? (
                <BattleResultCard
                  result={result}
                  attackerName={attackerPokemon?.name || ""}
                  defenderName={defenderPokemon?.name || ""}
                  moveName={resolvedMoveName}
                />
              ) : (
                <ResultEmptyState missing={missing} />
              )}
              {validationErrors.length > 0 && (
                <div className="mt-3 p-3 bg-[#FFFBEB] rounded-lg border border-[#F6E6B8] space-y-1">
                  {validationErrors.map((err) => (
                    <p key={err} className="text-[12px] text-[#A96B00]">
                      • {VALIDATION_MESSAGES[err]}:{" "}
                      {
                        validateBattleState({
                          attacker:
                            attackerPokemon as unknown as import("@/domain/battle/services/BattleValidation").BattlePokemonForValidation,
                          defender:
                            defenderPokemon as unknown as import("@/domain/battle/services/BattleValidation").BattlePokemonForValidation,
                          move: {
                            name: moveName,
                          } as unknown as import("@/domain/battle/services/BattleValidation").BattleMoveForValidation,
                          generation,
                        }).messages[err]
                      }
                    </p>
                  ))}
                </div>
              )}
              {validationState.moveLegalityError && (
                <div className="mt-3 p-3 bg-[#FFF5F5] rounded-lg border border-[#FEE2E2]">
                  <p className="text-[12px] text-[#C7373F]">
                    • {validationState.moveLegalityError}
                  </p>
                  <p className="text-[11px] text-[#7B8794] mt-1">
                    Usando herencia: {resolvedAttackerMoves.inheritedFrom} (
                    {resolvedAttackerMoves.source}) -{" "}
                    {resolvedAttackerMoves.moves.length} movimientos
                  </p>
                </div>
              )}
              {localError && (
                <p className="mt-3 text-[13px] text-[#C7373F] p-3 bg-[#FFF5F5] rounded-lg border border-[#FEE2E2] whitespace-pre-wrap">
                  {localError}
                </p>
              )}
            </div>
          </section>

          <section
            className={`${activeTab !== "result" ? "hidden" : "block lg:hidden"} self-start`}
          >
            {result ? (
              <BattleResultCard
                result={result}
                attackerName={attackerPokemon?.name || ""}
                defenderName={defenderPokemon?.name || ""}
                moveName={resolvedMoveName}
              />
            ) : (
              <ResultEmptyState missing={missing} />
            )}
          </section>
        </div>
      </main>

      <div className="fixed lg:sticky bottom-0 left-0 right-0 z-30 bg-white border-t border-[#D9E0E8] shadow-[0_-1px_12px_rgba(0,0,0,0.04)] pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 lg:h-18 flex items-center justify-between gap-3">
          <div className="hidden md:flex items-center gap-4 text-xs">
            <span
              className={`flex items-center gap-1.5 ${evTotalAtk > 510 ? "text-[#C7373F]" : "text-[#5F6B7A]"}`}
            >
              <span
                className={`size-2 rounded-full ${evTotalAtk > 510 ? "bg-[#C7373F]" : evTotalAtk === 510 ? "bg-[#16845B]" : "bg-[#B9C4D1]"}`}
              />
              EVs: {evTotalAtk}/510
            </span>
            <span className="w-px h-4 bg-[#D9E0E8]" />
            <span className="text-[#5F6B7A] truncate max-w-75">
              {attackerIdentity ? `${attackerIdentity.debugKey}` : "—"} →{" "}
              {defenderIdentity?.debugKey || "—"} ·{" "}
              {resolvedMoveName || "Sin movimiento"}
            </span>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <Button
              variant="outline"
              className="hidden md:inline-flex h-9 px-3 rounded-md border border-[#D9E0E8] text-[13px] font-medium hover:bg-[#F5F7FA]"
              onClick={() => {
                const a = attackerInput;
                const d = defenderInput;
                if (a && d) {
                  setAttacker(d);
                  setDefender(a);
                }
              }}
            >
              Intercambiar
            </Button>
            <Button
              onClick={handleCalculate}
              disabled={!canCalculate}
              title={
                !validationState.valid
                  ? validationState.errors
                      .map((e) => VALIDATION_MESSAGES[e])
                      .join(", ")
                  : undefined
              }
              className={`flex-1 md:flex-none h-11 px-5 rounded-xl text-[13px] md:text-sm font-semibold flex items-center justify-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-[#D93B32]/30 ${!canCalculate ? "bg-[#F0F3F7] text-[#7B8794] border border-[#D9E0E8] cursor-not-allowed" : "bg-[#D93B32] text-white hover:bg-[#B92C2A] shadow-[0_2px_8px_rgba(217,59,50,0.25)]"}`}
            >
              {isCalculating ? (
                <>
                  <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Calculando...
                </>
              ) : (
                <>Calcular daño</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
