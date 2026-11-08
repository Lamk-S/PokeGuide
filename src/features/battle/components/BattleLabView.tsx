"use client";
import { Calculator, Loader2, RefreshCw } from "lucide-react";
import { useEffect, useId } from "react";
import { PokemonSprite } from "@/components/ui/PokemonSprite";
import { VALIDATION_ES } from "@/domain/battle/services/BattleValidation.es";
import type {
  BattleResult,
  IBattleConditions,
} from "@/domain/battle/types/BattleParticipant";
import type {
  TerrainId,
  WeatherId,
} from "@/domain/battle/value-objects/BattleModifiers";
import type { BattleParticipantInput } from "@/features/battle/store/useBattleStore";
import { BattleFieldControls } from "./BattleFieldControls";
import {
  BattleResultCard,
  ResultEmptyState,
  ResultErrorState,
} from "./BattleResultCard";
import { ParticipantCard } from "./ParticipantCard";

type MoveOption = {
  value: string;
  label: string;
  type: string;
  power: number | null;
  accuracy: number | null;
  description: string;
};

type MinimalPokemon = {
  id: number;
  name: string;
  types?: unknown[];
  baseStats?: Record<string, number>;
  stats?: Record<string, number>;
  abilities?: Array<{ name: string } | string | unknown>;
  moves?: Array<string | { name: string } | unknown>;
  height?: number;
  weight?: number;
  sprites?: unknown;
  [key: string]: unknown;
};

type MinimalMove = {
  name?: string;
  nameEs?: string;
  type?: string;
  power?: number | null;
  accuracy?: number | null;
  category?: string;
  description?: string;
  [key: string]: unknown;
};

type ValidationState = {
  valid: boolean;
  isValid?: boolean;
  errors?: string[];
  missing?: string[];
};

interface BattleLabViewProps {
  pokemonList: MinimalPokemon[];
  moveList: Record<string, MinimalMove>;
  attackerInput: BattleParticipantInput | null;
  defenderInput: BattleParticipantInput | null;
  attackerPokemon: MinimalPokemon | null;
  defenderPokemon: MinimalPokemon | null;
  defenderTypes: string[];
  availableMoves: MoveOption[];
  result: BattleResult | null;
  error: string | null;
  localError?: string | null;
  conditions: IBattleConditions;
  generation: number;
  activeTab: "attacker" | "defender" | "result";
  validationState: ValidationState;
  isCalculating: boolean;
  evTotalAtk: number;
  evTotalDef: number;
  moveName: string;
  moveType?: string;
  movePower?: number | null;
  onActiveTabChange: (tab: "attacker" | "defender" | "result") => void;
  onCalculate: () => void;
  onGenerationChange: (gen: number) => void;
  onConditionsChange?: (c: Partial<IBattleConditions>) => void;
  onWeatherChange: (w: WeatherId) => void;
  onTerrainChange: (t: TerrainId) => void;
  onAttackerChange: (input: BattleParticipantInput | null) => void;
  onDefenderChange: (input: BattleParticipantInput | null) => void;
  onMoveChange: (name: string) => void;
  onSwap: () => void;
}

const GEN_LABELS: Record<number, string> = {
  9: "Gen 9 - Escarlata/Violeta",
  8: "Gen 8 - Espada/Escudo",
  7: "Gen 7 - Sol/Luna",
  6: "Gen 6 - X/Y",
  5: "Gen 5 - Negro/Blanco",
  4: "Gen 4 - Diamante/Perla",
  3: "Gen 3 - Rubí/Zafiro",
  2: "Gen 2 - Oro/Plata",
  1: "Gen 1 - Rojo/Azul",
};

function extractTypes(pokemon: MinimalPokemon | null): string[] {
  if (!pokemon?.types) return [];
  return (
    pokemon.types as Array<
      string | { name?: string } | { type?: { name?: string } }
    >
  )
    .map((t) => {
      if (typeof t === "string") return t;
      if (typeof t === "object" && t) {
        const obj = t as Record<string, unknown>;
        if (typeof obj.name === "string") return obj.name;
        const typeField = obj.type as Record<string, unknown> | undefined;
        if (typeField && typeof typeField.name === "string")
          return typeField.name;
      }
      return "";
    })
    .filter(Boolean) as string[];
}

function UnifiedHeader({
  generation,
  weather,
  terrain,
  isValid,
  missing,
  attackerPokemon,
  defenderPokemon,
  attackerLevel,
  defenderLevel,
  moveLabel,
  movePower,
  moveType,
  attackerTypes,
  defenderTypes,
  onGenerationChange,
  onWeatherChange,
  onTerrainChange,
}: {
  generation: number;
  weather: WeatherId;
  terrain: TerrainId;
  isValid: boolean;
  missing: string[];
  attackerPokemon: MinimalPokemon | null;
  defenderPokemon: MinimalPokemon | null;
  attackerLevel?: number;
  defenderLevel?: number;
  moveLabel: string;
  movePower?: number | null;
  moveType?: string;
  attackerTypes: string[];
  defenderTypes: string[];
  onGenerationChange: (g: number) => void;
  onWeatherChange: (w: WeatherId) => void;
  onTerrainChange: (t: TerrainId) => void;
}) {
  const genId = useId();
  const translatedMissing = missing
    .map((m) => VALIDATION_ES[m] ?? m.toLowerCase())
    .join(" · ");

  const atkName = attackerPokemon?.name ?? "Atacante";
  const defName = defenderPokemon?.name ?? "Defensor";

  const typeColor: Record<string, string> = {
    fuego: "bg-[#FFD8B0] text-[#7A4A1E]",
    volador: "bg-[#D8D8FF] text-[#4A4A8A]",
    dragon: "bg-[#C8B0FF] text-[#4A2A8A]",
    tierra: "bg-[#E8D5B0] text-[#6A5A3A]",
    agua: "bg-[#B0D8FF] text-[#2A4A6A]",
    planta: "bg-[#B0FFB0] text-[#2A6A2A]",
    electrico: "bg-[#FFF0B0] text-[#6A5A1E]",
    hada: "bg-[#FFB0D8] text-[#6A2A4A]",
  };

  const getTypeStyle = (t: string) => {
    const key = t.toLowerCase();
    return typeColor[key] ?? "bg-[#EDE8E0] text-[#57534E]";
  };

  return (
    <div className="w-full bg-[#FFFEFB]/95 backdrop-blur-xl border border-[#EDE8E0] rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="px-4 lg:px-5 py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-[13px] font-bold tracking-tight shrink-0">
              Laboratorio de Batalla
            </h1>
            <span className="h-1 w-1 rounded-full bg-[#D9CFC2] hidden lg:block" />
            <p className="text-[11px] text-[#9A9590] leading-snug truncate hidden xl:block">
              Herramienta de precisión para simular daño real con naturaleza,
              IVs, EVs, objeto, habilidad, estado, clima...
            </p>
            <span
              className={`ml-auto lg:ml-2 inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-[10px] font-bold tracking-wide border shrink-0 ${isValid ? "bg-[#111] text-white border-[#111]" : "bg-white text-[#9A9590] border-[#EDE8E0]"}`}
              title={translatedMissing}
            >
              <span
                className={`size-1.5 rounded-full ${isValid ? "bg-[#22C55E] animate-pulse" : "bg-[#F59E0B]"}`}
              />
              {isValid ? "CÁLCULO LISTO" : "FALTA INFO"}
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end gap-2.5 w-full lg:w-auto">
          <div className="flex flex-col gap-1 w-full lg:w-auto">
            <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#9A9590] leading-none">
              Generación
            </span>
            <select
              id={genId}
              value={generation}
              onChange={(e) =>
                onGenerationChange(Number.parseInt(e.target.value, 10))
              }
              className="h-9 lg:h-8 w-full lg:w-auto rounded-full border border-[#EDE8E0] bg-white px-3.5 pr-8 text-[12px] font-medium focus:outline-none focus:ring-1 focus:ring-[#111]/10"
            >
              {[9, 8, 7, 6, 5, 4, 3, 2, 1].map((g) => (
                <option key={g} value={g}>
                  {GEN_LABELS[g] ?? `Gen ${g}`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 w-full lg:w-auto">
            <div className="flex-1 lg:flex-none">
              <BattleFieldControls
                variant="compact"
                weather={weather}
                terrain={terrain}
                onWeatherChange={onWeatherChange}
                onTerrainChange={onTerrainChange}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-5 py-3 bg-[#F8F5F0]/80 border-t border-[#EDE8E0]/70 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="size-9 lg:size-8 rounded-full bg-white border border-[#EDE8E0] flex items-center justify-center shrink-0 overflow-hidden">
            {attackerPokemon ? (
              <PokemonSprite
                pokemon={{ id: attackerPokemon.id, name: attackerPokemon.name }}
                size={32}
                className="shrink-0"
              />
            ) : (
              <span className="text-[10px] text-[#9A9590]">?</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-[13px] font-semibold tracking-tight truncate">
                {atkName}
              </span>
              <span className="text-[10px] text-[#9A9590] font-mono">
                Nv. {attackerLevel ?? 50}
              </span>
            </div>
            {attackerTypes.length > 0 && (
              <div className="flex gap-1 mt-0.5 flex-wrap">
                {attackerTypes.slice(0, 2).map((tp) => (
                  <span
                    key={tp}
                    className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wide ${getTypeStyle(tp)}`}
                  >
                    {tp}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center shrink-0 px-2">
          <span className="text-[9px] font-semibold uppercase tracking-widest text-[#9A9590]">
            VS
          </span>
          <span className="text-[13px] font-bold tracking-tight mt-0.5 truncate max-w-[20ch] text-center">
            {moveLabel || "—"}
          </span>
          <span className="text-[10px] font-mono text-[#9A9590] tabular-nums">
            {movePower ? `${movePower} pot.` : ""}{" "}
            {moveType ? `· ${moveType.toUpperCase()}` : ""}
          </span>
        </div>

        <div className="flex items-center gap-2.5 min-w-0 flex-1 justify-end">
          <div className="min-w-0 flex-1 text-right">
            <div className="flex items-baseline gap-1.5 justify-end flex-wrap">
              <span className="text-[10px] text-[#9A9590] font-mono">
                Nv. {defenderLevel ?? 50}
              </span>
              <span className="text-[13px] font-semibold tracking-tight truncate">
                {defName}
              </span>
            </div>
            {defenderTypes.length > 0 && (
              <div className="flex gap-1 mt-0.5 justify-end flex-wrap">
                {defenderTypes.slice(0, 2).map((tp) => (
                  <span
                    key={tp}
                    className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wide ${getTypeStyle(tp)}`}
                  >
                    {tp}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="size-9 lg:size-8 rounded-full bg-white border border-[#EDE8E0] flex items-center justify-center shrink-0 overflow-hidden">
            {defenderPokemon ? (
              <PokemonSprite
                pokemon={{ id: defenderPokemon.id, name: defenderPokemon.name }}
                size={32}
                className="shrink-0"
              />
            ) : (
              <span className="text-[10px] text-[#9A9590]">?</span>
            )}
          </div>
        </div>
      </div>

      {!isValid && translatedMissing && (
        <div className="lg:hidden px-4 py-2 bg-[#FFFBEB] border-t border-[#FDE68A] flex items-center gap-2 text-[11px] text-[#92400E]">
          <span className="size-1.5 rounded-full bg-[#F59E0B] animate-pulse shrink-0" />
          <span className="truncate">Falta: {translatedMissing}</span>
        </div>
      )}
    </div>
  );
}

function MobileTabs({
  activeTab,
  onChange,
}: {
  activeTab: "attacker" | "defender" | "result";
  onChange: (t: "attacker" | "defender" | "result") => void;
}) {
  return (
    <div className="w-full bg-white border border-[#EDE8E0] rounded-full p-1 flex shadow-sm">
      {(["attacker", "defender", "result"] as const).map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={`flex-1 h-9 rounded-full text-[13px] font-medium transition-all ${isActive ? "bg-[#111] text-white shadow-sm" : "text-[#57534E] hover:text-[#111] hover:bg-[#F8F5F0]"}`}
          >
            {tab === "attacker"
              ? "Atacante"
              : tab === "defender"
                ? "Defensor"
                : "Resultado"}
          </button>
        );
      })}
    </div>
  );
}

function SingleActionDock({
  isValid,
  isCalculating,
  missing,
  onSwap,
  onCalculate,
  evAtk,
  evDef,
  remaining,
}: {
  isValid: boolean;
  isCalculating: boolean;
  missing: string[];
  onSwap: () => void;
  onCalculate: () => void;
  evAtk: number;
  evDef: number;
  remaining: string;
}) {
  const translatedMissing = missing
    .map((m) => VALIDATION_ES[m] ?? m)
    .join(" · ");

  return (
    <div className="w-full">
      <div className="hidden lg:flex bg-white/90 backdrop-blur-xl border border-[#EDE8E0] rounded-full px-4 py-2.5 items-center justify-between shadow-sm">
        <div className="flex gap-4 text-[10px] font-mono text-[#9A9590] tabular-nums">
          <span>{evAtk}/510 Esfuerzo atacante</span>
          <span>{evDef}/510 Defensor</span>
          <span>PS RESTANTE {remaining}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSwap}
            className="h-9 px-4 rounded-full border border-[#EDE8E0] bg-white text-[12px] font-medium hover:bg-[#F8F5F0] inline-flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="size-3.5" />
            Intercambiar
          </button>
          <button
            type="button"
            onClick={onCalculate}
            disabled={isCalculating || !isValid}
            className="h-9 px-5 rounded-full bg-[#111] text-white text-[12px] font-semibold hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
            title="Ctrl+Enter"
          >
            {isCalculating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Calculator className="size-4" />
            )}
            {isCalculating ? "Calculando..." : "Calcular daño"}
            <span className="ml-1 text-[10px] font-mono opacity-60 border border-white/20 rounded px-1">
              ⌘↵
            </span>
          </button>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 pb-[env(safe-area-inset-bottom)]">
        <div className="mx-3 mb-3 rounded-[20px] bg-[#111]/95 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.24)] p-2.5 flex items-center gap-2">
          <button
            type="button"
            onClick={onSwap}
            className="h-11 w-11 rounded-full bg-white/10 text-white hover:bg-white/15 border border-white/10 flex items-center justify-center shrink-0"
            aria-label="Intercambiar"
          >
            <RefreshCw className="size-4" />
          </button>
          <div className="flex-1 min-w-0 px-1">
            <div className="text-[11px] font-mono text-white/60 tabular-nums truncate">
              {isValid
                ? `EV ${evAtk}/510 · PS ${remaining}`
                : `Falta: ${translatedMissing || "info"}`}
            </div>
          </div>
          <button
            type="button"
            onClick={onCalculate}
            disabled={isCalculating || !isValid}
            className="h-11 px-5 rounded-full bg-white text-black text-[13px] font-bold hover:bg-[#F5F5F5] disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2 shrink-0 active:scale-[0.98] transition-transform"
          >
            {isCalculating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Calculator className="size-4" />
            )}
            {isCalculating ? "..." : "Calcular"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function BattleLabView(props: BattleLabViewProps) {
  const {
    pokemonList,
    attackerInput,
    defenderInput,
    attackerPokemon,
    defenderPokemon,
    defenderTypes,
    availableMoves,
    result,
    error,
    localError,
    conditions,
    generation,
    activeTab,
    validationState,
    isCalculating,
    evTotalAtk,
    evTotalDef,
    moveName,
    moveType,
    movePower,
    onActiveTabChange,
    onCalculate,
    onGenerationChange,
    onWeatherChange,
    onTerrainChange,
    onAttackerChange,
    onDefenderChange,
    onMoveChange,
    onSwap,
  } = props;

  const displayError = localError || error;
  const isValid = validationState.valid;
  const missing = (validationState.missing ??
    validationState.errors ??
    []) as string[];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (isValid) onCalculate();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isValid, onCalculate]);

  const remaining = result
    ? `${(100 - (result.damage.maxPercent ?? 0)).toFixed(1)}%`
    : "0.0%";

  const moveLabel =
    availableMoves.find((m) => m.value === moveName)?.label || moveName;

  const attackerTypes = extractTypes(attackerPokemon);
  const resolvedDefTypes =
    defenderTypes.length > 0 ? defenderTypes : extractTypes(defenderPokemon);

  return (
    <div className="min-h-screen bg-[#F8F5F0] w-full pb-24 lg:pb-0">
      <div className="mx-auto max-w-[1600px] px-3 lg:px-6 py-3 lg:py-4 space-y-3">
        <div className="sticky top-0 z-30 space-y-3">
          <UnifiedHeader
            generation={generation}
            weather={conditions.weather}
            terrain={conditions.terrain}
            isValid={isValid}
            missing={missing}
            attackerPokemon={attackerPokemon}
            defenderPokemon={defenderPokemon}
            attackerLevel={attackerInput?.level}
            defenderLevel={defenderInput?.level}
            moveLabel={moveLabel}
            movePower={movePower}
            moveType={moveType}
            attackerTypes={attackerTypes}
            defenderTypes={resolvedDefTypes}
            onGenerationChange={onGenerationChange}
            onWeatherChange={onWeatherChange}
            onTerrainChange={onTerrainChange}
          />

          <div className="lg:hidden sticky top-0 z-20 py-2 bg-[#F8F5F0]/90 backdrop-blur-xl -mx-3 px-3">
            <MobileTabs activeTab={activeTab} onChange={onActiveTabChange} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.05fr_0.95fr_1.05fr] gap-3 lg:gap-4 items-start">
          <div
            className={`${activeTab === "attacker" ? "block" : "hidden"} md:block lg:block`}
          >
            <ParticipantCard
              label="Atacante"
              pokemonList={pokemonList as never}
              input={attackerInput}
              onChange={onAttackerChange}
              facing="left"
              generation={generation}
              isAttacker
              moveName={moveName}
              onMoveChange={onMoveChange}
              availableMoves={availableMoves}
              defenderTypes={defenderTypes}
            />
          </div>

          <div
            className={`${activeTab === "result" ? "block" : "hidden"} lg:block md:order-3 lg:order-0 md:col-span-2 lg:col-span-1 space-y-3`}
          >
            {displayError ? (
              <ResultErrorState error={displayError} />
            ) : result ? (
              <BattleResultCard
                result={result}
                attackerPokemon={attackerPokemon}
                defenderPokemon={defenderPokemon}
                attackerInput={attackerInput}
                defenderInput={defenderInput}
                conditions={conditions}
                moveName={moveLabel || "Movimiento"}
                moveType={moveType}
                movePower={movePower}
                generation={generation}
                error={null}
              />
            ) : (
              <ResultEmptyState missing={missing as string[]} />
            )}
          </div>

          <div
            className={`${activeTab === "defender" ? "block" : "hidden"} md:block lg:block`}
          >
            <ParticipantCard
              label="Defensor"
              pokemonList={pokemonList as never}
              input={defenderInput}
              onChange={onDefenderChange}
              facing="right"
              generation={generation}
              defenderTypes={defenderTypes}
            />
          </div>
        </div>

        <SingleActionDock
          isValid={isValid}
          isCalculating={isCalculating}
          missing={missing}
          onSwap={onSwap}
          onCalculate={onCalculate}
          evAtk={evTotalAtk}
          evDef={evTotalDef}
          remaining={remaining}
        />
      </div>
    </div>
  );
}
