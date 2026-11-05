"use client";
import { useId } from "react";
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
import { BattleSummary } from "./BattleSummary";
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

function LabHeader({
  generation,
  weather,
  terrain,
  isValid,
  onGenerationChange,
  onWeatherChange,
  onTerrainChange,
}: {
  generation: number;
  weather: WeatherId;
  terrain: TerrainId;
  isValid: boolean;
  onGenerationChange: (g: number) => void;
  onWeatherChange: (w: WeatherId) => void;
  onTerrainChange: (t: TerrainId) => void;
}) {
  const genId = useId();
  return (
    <div className="w-full bg-[#FFFEFB] border border-[#EDE8E0] rounded-t-xl lg:rounded-xl px-4 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="text-[13px] font-bold tracking-tight">
            Laboratorio de Batalla
          </h1>
          <span className="h-1 w-1 rounded-full bg-[#D9CFC2]" />
          <p className="text-[11px] text-[#9A9590] leading-snug truncate">
            Herramienta de precisión para simular daño real con naturaleza, IVs,
            EVs, objeto, habilidad, estado, clima...
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap shrink-0">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#9A9590] leading-none">
            Generación
          </span>
          <select
            id={genId}
            value={generation}
            onChange={(e) =>
              onGenerationChange(Number.parseInt(e.target.value, 10))
            }
            className="h-8 rounded-full border border-[#EDE8E0] bg-white px-3 pr-7 text-[12px] font-medium focus:outline-none focus:ring-1 focus:ring-[#111]/10"
          >
            {[9, 8, 7, 6, 5, 4, 3, 2, 1].map((g) => (
              <option key={g} value={g}>
                {GEN_LABELS[g] ?? `Gen ${g}`}
              </option>
            ))}
          </select>
        </div>
        <BattleFieldControls
          variant="compact"
          weather={weather}
          terrain={terrain}
          onWeatherChange={onWeatherChange}
          onTerrainChange={onTerrainChange}
        />
        <div className="ml-1 flex items-center">
          <span
            className={`inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-[10px] font-bold tracking-wide border ${isValid ? "bg-[#111] text-white border-[#111]" : "bg-white text-[#9A9590] border-[#EDE8E0]"}`}
          >
            <span
              className={`size-1.5 rounded-full ${isValid ? "bg-[#22C55E] animate-pulse" : "bg-[#9A9590]"}`}
            />
            {isValid ? "CÁLCULO LISTO" : "CÁLCULO PENDIENTE"}
          </span>
        </div>
      </div>
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
    <div className="flex lg:hidden items-center gap-2 px-1">
      {(["attacker", "defender", "result"] as const).map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${activeTab === tab ? "bg-[#111] text-white border-[#111]" : "bg-white border-[#EDE8E0] text-[#2B2B2B] hover:bg-[#F8F5F0]"}`}
        >
          {tab === "attacker"
            ? "Atacante"
            : tab === "defender"
              ? "Defensor"
              : "Resultado"}
        </button>
      ))}
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
  const missing = validationState.missing ?? validationState.errors ?? [];

  return (
    <div className="min-h-screen bg-[#F8F5F0] w-full">
      <div className="mx-auto max-w-[1600px] px-3 lg:px-6 py-3 lg:py-4 space-y-3">
        <LabHeader
          generation={generation}
          weather={conditions.weather}
          terrain={conditions.terrain}
          isValid={isValid}
          onGenerationChange={onGenerationChange}
          onWeatherChange={onWeatherChange}
          onTerrainChange={onTerrainChange}
        />

        <BattleSummary
          attackerPokemon={attackerPokemon}
          defenderPokemon={defenderPokemon}
          attackerLevel={attackerInput?.level}
          defenderLevel={defenderInput?.level}
          generation={generation}
          moveName={
            availableMoves.find((m) => m.value === moveName)?.label || moveName
          }
          moveType={moveType}
          movePower={movePower}
        />

        <MobileTabs activeTab={activeTab} onChange={onActiveTabChange} />

        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr_1.05fr] gap-3 lg:gap-4 items-start">
          {/* Atacante */}
          <div
            className={`${activeTab === "attacker" ? "block" : "hidden"} lg:block`}
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

          {/* Centro - Resultado */}
          <div
            className={`${activeTab === "result" ? "block" : "hidden"} lg:block space-y-3`}
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
                moveName={
                  availableMoves.find((m) => m.value === moveName)?.label ||
                  moveName ||
                  "Movimiento"
                }
                moveType={moveType}
                movePower={movePower}
                generation={generation}
                error={null}
              />
            ) : (
              <ResultEmptyState missing={missing as string[]} />
            )}
          </div>

          {/* Defensor */}
          <div
            className={`${activeTab === "defender" ? "block" : "hidden"} lg:block`}
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

        <div className="bg-white border border-[#EDE8E0] rounded-xl lg:rounded-full px-4 py-3 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-4 text-[10px] font-mono text-[#9A9590] tabular-nums">
            <span>
              {evTotalAtk}/510 Esfuerzo atacante -{" "}
              {attackerPokemon ? attackerPokemon.name : "—"}
            </span>
            <span>{evTotalDef}/510 Defensor</span>
            <span className="hidden lg:inline">
              PS RESTANTE{" "}
              {result
                ? `${(100 - (result.damage.maxPercent ?? 0)).toFixed(1)}%`
                : "0.0%"}
            </span>
          </div>
          <div className="flex items-center gap-2 self-stretch lg:self-auto">
            <button
              type="button"
              onClick={onSwap}
              className="h-9 px-4 rounded-full border border-[#EDE8E0] bg-white text-[12px] font-medium hover:bg-[#F8F5F0] underline underline-offset-4 decoration-dotted"
            >
              Intercambiar
            </button>
            <button
              type="button"
              onClick={onCalculate}
              disabled={isCalculating}
              className="h-9 px-5 rounded-full bg-[#111] text-white text-[12px] font-semibold hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCalculating ? "Calculando..." : "Calcular daño"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
