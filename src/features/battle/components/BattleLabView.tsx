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
  missing?: string[];
};

interface Props {
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
  conditions?: IBattleConditions;
  generation?: number;
  activeTab?: "attacker" | "defender" | "result";
  validationState?: ValidationState;
  isCalculating?: boolean;
  missing?: string[];
  moveName?: string;
  moveType?: string;
  movePower?: number | null;
  weather?: WeatherId;
  terrain?: TerrainId;
  evTotalAtk?: number;
  evTotalDef?: number;
  evTotal?: number;
  onActiveTabChange?: (tab: "attacker" | "defender" | "result") => void;
  onCalculate?: () => void;
  onGenerationChange?: (gen: number) => void;
  onConditionsChange?: (c: Partial<IBattleConditions>) => void;
  onMoveChange?: (name: string) => void;
  onWeatherChange?: (w: WeatherId) => void;
  onTerrainChange?: (t: TerrainId) => void;
  onAttackerChange?: (input: BattleParticipantInput | null) => void;
  onDefenderChange?: (input: BattleParticipantInput | null) => void;
  children?: {
    attacker?: React.ReactNode;
    defender?: React.ReactNode;
  };
  [key: string]: unknown;
}

function ResultEmptyState({ missing }: { missing: string[] }) {
  return (
    <div className="bg-[#FFFEFB] rounded-xl border border-dashed border-[#EDE8E0] p-6 text-center">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-[#9A9590]">
        Daño estimado
      </div>
      <p className="mt-2 text-[12px] leading-normal text-[#7A7570]">
        {missing && missing.length > 0
          ? `Falta: ${missing.join(" · ")}. Completa atacante, defensor y movimiento.`
          : "Selecciona atacante, defensor y movimiento y presiona Calcular daño."}
      </p>
    </div>
  );
}

function ResultErrorState({ error }: { error: string }) {
  return (
    <div className="bg-[#FFFEFB] rounded-xl border border-dashed border-[#EDE8E0] p-6 text-center">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-[#9A9590]">
        Daño estimado
      </div>
      <p className="mt-2 text-[12px] leading-normal text-[#991B1B]">{error}</p>
    </div>
  );
}

export function BattleLabView(props: Props) {
  const {
    result,
    error,
    missing = [],
    onActiveTabChange = () => {},
    onCalculate = () => {},
    onGenerationChange = () => {},
    onConditionsChange = () => {},
    children,
  } = props;

  const generation = props.generation ?? 9;
  const conditions: IBattleConditions = props.conditions ?? {
    weather: "none",
    terrain: "none",
  };
  const activeTab = props.activeTab ?? "attacker";
  const validationState = props.validationState ?? { valid: true };
  const isCalculating = props.isCalculating ?? false;

  const genId = useId();
  const weatherId = useId();
  const terrainId = useId();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onActiveTabChange("attacker")}
          className={`px-3 py-1.5 rounded-md text-[12px] font-medium border ${activeTab === "attacker" ? "bg-[#111] text-white border-[#111]" : "bg-white border-[#EDE8E0]"}`}
        >
          Atacante
        </button>
        <button
          type="button"
          onClick={() => onActiveTabChange("defender")}
          className={`px-3 py-1.5 rounded-md text-[12px] font-medium border ${activeTab === "defender" ? "bg-[#111] text-white border-[#111]" : "bg-white border-[#EDE8E0]"}`}
        >
          Defensor
        </button>
        <button
          type="button"
          onClick={() => onActiveTabChange("result")}
          className={`px-3 py-1.5 rounded-md text-[12px] font-medium border ${activeTab === "result" ? "bg-[#111] text-white border-[#111]" : "bg-white border-[#EDE8E0]"}`}
        >
          Resultado
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label
            htmlFor={genId}
            className="text-[10px] uppercase tracking-widest text-[#9A9590]"
          >
            Gen
          </label>
          <select
            id={genId}
            value={generation}
            onChange={(e) =>
              onGenerationChange(Number.parseInt(e.target.value, 10))
            }
            className="mt-1 h-8 w-full rounded-md border border-[#EDE8E0] bg-white px-2 text-[12px]"
          >
            {[9, 8, 7, 6, 5, 4, 3, 2, 1].map((g) => (
              <option key={g} value={g}>
                Gen {g}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor={weatherId}
            className="text-[10px] uppercase tracking-widest text-[#9A9590]"
          >
            Clima
          </label>
          <select
            id={weatherId}
            value={conditions.weather}
            onChange={(e) =>
              onConditionsChange({
                weather: e.target.value as IBattleConditions["weather"],
              })
            }
            className="mt-1 h-8 w-full rounded-md border border-[#EDE8E0] bg-white px-2 text-[12px]"
          >
            <option value="none">Ninguno</option>
            <option value="sun">Sol</option>
            <option value="rain">Lluvia</option>
            <option value="sand">Tormenta arena</option>
            <option value="snow">Nieve</option>
            <option value="hail">Granizo</option>
          </select>
        </div>
        <div>
          <label
            htmlFor={terrainId}
            className="text-[10px] uppercase tracking-widest text-[#9A9590]"
          >
            Terreno
          </label>
          <select
            id={terrainId}
            value={conditions.terrain}
            onChange={(e) =>
              onConditionsChange({
                terrain: e.target.value as IBattleConditions["terrain"],
              })
            }
            className="mt-1 h-8 w-full rounded-md border border-[#EDE8E0] bg-white px-2 text-[12px]"
          >
            <option value="none">Ninguno</option>
            <option value="electric">Eléctrico</option>
            <option value="grassy">Hierba</option>
            <option value="psychic">Psíquico</option>
            <option value="misty">Niebla</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div className={activeTab === "attacker" ? "block" : "hidden"}>
          {children?.attacker}
        </div>
        <div className={activeTab === "defender" ? "block" : "hidden"}>
          {children?.defender}
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={onCalculate}
            disabled={isCalculating || !validationState.valid}
            className="w-full h-10 rounded-md bg-[#111] text-white text-[13px] font-medium disabled:opacity-40"
          >
            {isCalculating ? "Calculando..." : "Calcular daño"}
          </button>
        </div>

        {activeTab === "result" &&
          (error ? (
            <ResultErrorState error={error} />
          ) : result ? (
            <div className="bg-[#FFFEFB] rounded-xl border border-[#EDE8E0] p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-[#9A9590]">
                Resultado
              </div>
              <div className="mt-2 text-[12px]">
                Daño calculado correctamente
              </div>
            </div>
          ) : (
            <ResultEmptyState missing={missing} />
          ))}
      </div>
    </div>
  );
}
