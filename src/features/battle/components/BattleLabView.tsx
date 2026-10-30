"use client";
import { ParticipantCard } from "./ParticipantCard";
import { BattleFieldControls } from "./BattleFieldControls";
import { BattleSummary } from "./BattleSummary";
import { BattleResultCard, ResultEmptyState } from "./BattleResultCard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import type { BattleValidationError } from "@/domain/battle/services/BattleValidation";
import type { BattleParticipantInput } from "@/features/battle/store/useBattleStore";
import type {
  BattleResult,
  IBattleConditions,
} from "@/domain/battle/types/BattleParticipant";
import type {
  WeatherId,
  TerrainId,
} from "@/domain/battle/value-objects/BattleModifiers";

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
  types?: unknown[];
  baseStats?: Record<string, number>;
  stats?: Record<string, number>;
  abilities?: Array<{ name: string } | string>;
  moves?: Array<string | { name: string }>;
  height?: number;
  weight?: number;
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
  INVALID_GENERATION: "Generación inválida",
  FORM_NOT_AVAILABLE: "Forma no disponible",
  MOVE_NOT_LEARNABLE: "No aprendible",
  INVALID_LEVEL: "Nivel inválido",
  INVALID_NATURE: "Naturaleza inválida",
};

interface Props {
  pokemonList: PokemonListItem[];
  moveList: Record<string, MoveDetail>;
  attackerInput: BattleParticipantInput | null;
  defenderInput: BattleParticipantInput | null;
  attackerPokemon: PokemonListItem | null;
  defenderPokemon: PokemonListItem | null;
  defenderTypes: string[];
  availableMoves: MoveOptionRich[];
  moveName: string;
  result: BattleResult | null;
  conditions: IBattleConditions;
  isCalculating: boolean;
  generation: number;
  validationState: { valid: boolean; errors: BattleValidationError[] };
  evTotalAtk: number;
  evTotalDef: number;
  localError: string | null;
  error?: string | null;
  activeTab: TabId;
  onActiveTabChange: (tab: TabId) => void;
  onAttackerChange: (input: BattleParticipantInput | null) => void;
  onDefenderChange: (input: BattleParticipantInput | null) => void;
  onMoveChange: (moveName: string) => void;
  onCalculate: () => void;
  onGenerationChange: (gen: number) => void;
  onWeatherChange: (weather: WeatherId) => void;
  onTerrainChange: (terrain: TerrainId) => void;
  hasCalculatedOnce?: boolean;
}

export function BattleLabView({
  pokemonList,
  moveList,
  attackerInput,
  defenderInput,
  attackerPokemon,
  defenderPokemon,
  defenderTypes,
  availableMoves,
  moveName,
  result,
  isCalculating,
  generation,
  conditions,
  validationState,
  evTotalAtk,
  evTotalDef,
  localError,
  error,
  activeTab,
  onActiveTabChange,
  onAttackerChange,
  onDefenderChange,
  onMoveChange,
  onCalculate,
  onGenerationChange,
  onWeatherChange,
  onTerrainChange,
  hasCalculatedOnce = false,
}: Props) {
  const canCalculate = validationState.valid && !isCalculating;
  const missing: string[] = [];
  if (!attackerInput) missing.push("atacante");
  if (!defenderInput) missing.push("defensor");
  if (!moveName) missing.push("movimiento");

  const findMoveKeySafe = (searchName: string): string | undefined => {
    const lower = searchName.toLowerCase();
    return Object.keys(moveList).find((k) => {
      const entry = moveList[k];
      return (
        entry?.nameEs?.toLowerCase() === lower ||
        entry?.name?.toLowerCase() === lower
      );
    });
  };

  const resolvedMoveKey = findMoveKeySafe(moveName) ?? moveName;
  const resolvedMoveDetail = moveList[resolvedMoveKey] ?? moveList[moveName];
  const resolvedMoveName =
    resolvedMoveDetail?.nameEs || resolvedMoveDetail?.name || moveName;

  const tabs = [
    { id: "attacker" as TabId, label: "Atacante" },
    { id: "result" as TabId, label: "Resultado" },
    { id: "defender" as TabId, label: "Defensor" },
  ];

  return (
    <div className="min-h-screen bg-[#F8F5F0] text-[#1A1A1A] -mx-4 md:-mx-6 lg:-mx-8 -my-6 md:-my-8">
      <div className="sticky top-14 z-30 w-full bg-[#FFFEFB] border-b border-[#EDE8E0] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-2.5 flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-3 w-full lg:w-auto min-w-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <h1 className="text-[12px] font-bold tracking-[-0.01em] whitespace-nowrap shrink-0">
                Laboratorio de Batalla
              </h1>
              <span className="hidden md:block h-3 w-px bg-[#EDE8E0] shrink-0" />
              <p className="hidden xl:block text-[11px] text-[#7A7570] truncate max-w-140 leading-snug">
                Herramienta de precisión para simular daño real con naturaleza,
                IVs, EVs, objeto, habilidad, estado, clima y terreno.
              </p>
            </div>
            <span
              className={`lg:hidden inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full border text-[10px] font-mono font-medium shrink-0 max-w-[40%] truncate ${result ? "bg-[#111] border-[#111] text-white" : canCalculate ? "bg-[#E8F5E9] border-[#C8E6C9] text-[#2D5A27]" : "bg-[#FFF3E0] border-[#FFE0B2] text-[#7A3D00]"}`}
            >
              <span
                className={`size-1.5 rounded-full shrink-0 ${result ? "bg-white" : canCalculate ? "bg-[#2D5A27]" : "bg-[#D97706] animate-pulse"}`}
              />
              <span className="truncate">
                {result
                  ? "LISTO"
                  : canCalculate
                    ? "LISTO"
                    : BADGE_LABELS[
                        validationState.errors[0] as BattleValidationError
                      ] || "FALTAN DATOS"}
              </span>
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end gap-2.5 w-full lg:w-auto lg:justify-end">
            <div className="flex items-end gap-2 w-full sm:w-auto">
              <div className="flex flex-col gap-1 flex-1 min-w-0 sm:w-56">
                <Label className="text-[10px] uppercase tracking-[0.08em] text-[#9A9590] font-semibold leading-none">
                  Generación
                </Label>
                <div className="w-full">
                  <Combobox
                    options={GEN_OPTIONS}
                    value={generation.toString()}
                    onValueChange={(v) =>
                      onGenerationChange(Number.parseInt(v, 10))
                    }
                    placeholder="Gen 9 · Escarlata/Violeta"
                  />
                </div>
              </div>
              <div className="flex-1 sm:flex-none">
                <BattleFieldControls
                  variant="compact"
                  weather={conditions.weather as WeatherId}
                  terrain={conditions.terrain as TerrainId}
                  onWeatherChange={onWeatherChange}
                  onTerrainChange={onTerrainChange}
                />
              </div>
            </div>
            <span
              className={`hidden lg:inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full border text-[10px] font-mono font-medium shrink-0 ${result ? "bg-[#111] border-[#111] text-white" : canCalculate ? "bg-[#E8F5E9] border-[#C8E6C9] text-[#2D5A27]" : "bg-[#FFF3E0] border-[#FFE0B2] text-[#7A3D00]"}`}
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
          attackerPokemon={attackerPokemon ?? undefined}
          defenderPokemon={defenderPokemon ?? undefined}
          attackerLevel={attackerInput?.level}
          defenderLevel={defenderInput?.level}
          generation={generation}
          moveName={resolvedMoveName}
          moveType={moveName ? moveList[moveName]?.type : undefined}
          movePower={
            moveName
              ? ((moveList[moveName]?.power as number) ?? null)
              : undefined
          }
        />
      </div>

      <div className="lg:hidden sticky top-28 z-20 bg-[#F8F5F0] px-4 pt-3 pb-2 border-b border-[#EDE8E0]">
        <div className="flex p-1 rounded-xl bg-[#EDE8E0] gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onActiveTabChange(t.id)}
              className={`flex-1 h-8 rounded-lg text-[12px] font-medium transition-colors ${activeTab === t.id ? "bg-white shadow-sm text-[#111]" : "text-[#7A7570]"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto px-4 lg:px-6 py-5 pb-24 lg:pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <section
            className={`${activeTab !== "attacker" ? "hidden lg:block" : "block"} lg:col-span-4 xl:col-span-4 self-start`}
          >
            <ParticipantCard
              label="Atacante"
              pokemonList={pokemonList}
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
          </section>
          <section
            className={`${activeTab !== "result" ? "hidden lg:block" : "block"} lg:col-span-4 xl:col-span-4 self-start`}
          >
            {error ? (
              <BattleResultCard
                result={null}
                error={error}
                attackerPokemon={attackerPokemon as never}
                defenderPokemon={defenderPokemon as never}
                attackerInput={attackerInput}
                defenderInput={defenderInput}
                conditions={conditions}
                moveName={resolvedMoveName}
                generation={generation}
                moveType={moveName ? moveList[moveName]?.type : undefined}
                movePower={
                  moveName
                    ? ((moveList[moveName]?.power as number) ?? null)
                    : undefined
                }
              />
            ) : result ? (
              <BattleResultCard
                result={result}
                attackerPokemon={attackerPokemon as never}
                defenderPokemon={defenderPokemon as never}
                attackerInput={attackerInput}
                defenderInput={defenderInput}
                conditions={conditions}
                moveName={resolvedMoveName}
                generation={generation}
                moveType={moveName ? moveList[moveName]?.type : undefined}
                movePower={
                  moveName
                    ? ((moveList[moveName]?.power as number) ?? null)
                    : undefined
                }
              />
            ) : (
              <ResultEmptyState missing={missing} />
            )}
            {localError && !error && (
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
              pokemonList={pokemonList}
              input={defenderInput}
              onChange={onDefenderChange}
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
                ? `${Math.max(0, 100 - result.damage.maxPercent).toFixed(1)}%`
                : "0%"}
            </span>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <Button
              variant="ghost"
              className="hidden md:inline-flex h-8 px-3 rounded-full text-[11px] font-mono underline decoration-dotted underline-offset-4"
              onClick={() => {
                if (attackerInput && defenderInput) {
                  const newAttacker = { ...defenderInput };
                  const newDefender = { ...attackerInput };
                  onAttackerChange(newAttacker);
                  onDefenderChange(newDefender);
                }
              }}
            >
              Intercambiar
            </Button>
            <div className="flex items-center gap-2">
              {hasCalculatedOnce && (
                <span className="hidden md:inline-flex items-center gap-1.5 text-[10px] font-mono text-[#065F46] bg-[#F0FDF4] border border-[#BBF7D0] px-2.5 py-1 rounded-full">
                  <span className="size-1.5 rounded-full bg-[#065F46] animate-pulse" />
                  Auto
                </span>
              )}
              <Button
                onClick={onCalculate}
                disabled={!canCalculate}
                className={`flex-1 md:flex-none h-9 px-5 rounded-full text-[12px] font-semibold ${!canCalculate ? "bg-[#F0EDE6] text-[#9A9590] cursor-not-allowed" : "bg-[#111] text-white hover:bg-black"}`}
              >
                {isCalculating
                  ? "Calculando..."
                  : hasCalculatedOnce
                    ? "Recalcular"
                    : "Calcular daño"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
