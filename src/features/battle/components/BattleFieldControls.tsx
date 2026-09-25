"use client";
import {
  Weather,
  Terrain,
  type WeatherId,
  type TerrainId,
} from "@/domain/battle/value-objects/BattleModifiers";
import { useBattleStore } from "../store/useBattleStore";
import { Combobox } from "@/components/ui/combobox";

const weatherOptions = Object.values(Weather).map((w) => ({
  value: w.id,
  label: w.label,
}));
const terrainOptions = Object.values(Terrain).map((t) => ({
  value: t.id,
  label: t.label,
}));

export function BattleFieldControls() {
  const weather = useBattleStore((s) => s.conditions.weather ?? "none");
  const terrain = useBattleStore((s) => s.conditions.terrain ?? "none");
  const setWeather = useBattleStore((s) => s.setWeather);
  const setTerrain = useBattleStore((s) => s.setTerrain);

  return (
    <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-[#FBFCFD] border border-[#E6EBF1]">
      <div className="flex flex-col gap-1.5">
        <span className="text- font-semibold uppercase tracking-[0.08em] text-[#7B8794]">
          Clima
        </span>
        <Combobox
          options={weatherOptions}
          value={weather}
          onValueChange={(v) => setWeather(v as WeatherId)}
          placeholder="Clima"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text- font-semibold uppercase tracking-[0.08em] text-[#7B8794]">
          Campo
        </span>
        <Combobox
          options={terrainOptions}
          value={terrain}
          onValueChange={(v) => setTerrain(v as TerrainId)}
          placeholder="Campo"
        />
      </div>
    </div>
  );
}
