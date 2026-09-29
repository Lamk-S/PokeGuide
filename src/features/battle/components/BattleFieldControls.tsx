"use client";
import {
  Weather,
  Terrain,
  type WeatherId,
  type TerrainId,
} from "@/domain/battle/value-objects/BattleModifiers";
import { useBattleStore } from "../store/useBattleStore";
import { Combobox } from "@/components/ui/combobox";

const WEATHER_ES: Record<string, string> = {
  none: "Ninguno",
  sun: "Sol",
  rain: "Lluvia",
  sand: "Tormenta arena",
  hail: "Granizo",
  snow: "Nieve",
  harsh_sun: "Sol intenso",
  heavy_rain: "Lluvia intensa",
  strong_winds: "Vientos fuertes",
};

const TERRAIN_ES: Record<string, string> = {
  none: "Ninguno",
  electric: "Eléctrico",
  grassy: "Hierba",
  misty: "Niebla",
  psychic: "Psíquico",
};

type ModifierOption = { id: string; label?: string; labelEs?: string };
const weatherOptions = Object.values(Weather).map((w) => {
  const opt = w as unknown as ModifierOption;
  return {
    value: opt.id,
    label: WEATHER_ES[opt.id] || opt.labelEs || opt.label || opt.id,
  };
});
const terrainOptions = Object.values(Terrain).map((t) => {
  const opt = t as unknown as ModifierOption;
  return {
    value: opt.id,
    label: TERRAIN_ES[opt.id] || opt.labelEs || opt.label || opt.id,
  };
});

type Props = {
  variant?: "default" | "compact";
};

export function BattleFieldControls({ variant = "default" }: Props) {
  const weather = useBattleStore((s) => s.conditions.weather ?? "none");
  const terrain = useBattleStore((s) => s.conditions.terrain ?? "none");
  const setWeather = useBattleStore((s) => s.setWeather);
  const setTerrain = useBattleStore((s) => s.setTerrain);

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2 flex-1 lg:flex-none">
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <span className="hidden md:block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9A9590] leading-none">
            Clima
          </span>
          <div className="w-full min-w-22.5 md:w-32">
            <Combobox
              options={weatherOptions}
              value={weather}
              onValueChange={(v) => setWeather(v as WeatherId)}
              placeholder="Ninguno"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <span className="hidden md:block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9A9590] leading-none">
            Campo
          </span>
          <div className="w-full min-w-22.5 md:w-32">
            <Combobox
              options={terrainOptions}
              value={terrain}
              onValueChange={(v) => setTerrain(v as TerrainId)}
              placeholder="Ninguno"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2.5">
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9A9590]">
          Clima
        </span>
        <Combobox
          options={weatherOptions}
          value={weather}
          onValueChange={(v) => setWeather(v as WeatherId)}
          placeholder="—"
        />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9A9590]">
          Campo
        </span>
        <Combobox
          options={terrainOptions}
          value={terrain}
          onValueChange={(v) => setTerrain(v as TerrainId)}
          placeholder="—"
        />
      </div>
    </div>
  );
}
