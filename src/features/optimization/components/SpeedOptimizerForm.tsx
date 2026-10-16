"use client";
import {
  useSpeedForm,
  useOptimizerActions,
  useIsCalculating,
} from "../store/useOptimizerStore";
import { useState, useId } from "react";

const NATURES = [
  {
    name: "Adamant",
    nameEs: "Firme",
    increasedStat: "attack",
    decreasedStat: "special-attack",
  },
  {
    name: "Bold",
    nameEs: "Osada",
    increasedStat: "defense",
    decreasedStat: "attack",
  },
  {
    name: "Jolly",
    nameEs: "Alegre",
    increasedStat: "speed",
    decreasedStat: "special-attack",
  },
  {
    name: "Timid",
    nameEs: "Miedosa",
    increasedStat: "speed",
    decreasedStat: "attack",
  },
  {
    name: "Modest",
    nameEs: "Modesta",
    increasedStat: "special-attack",
    decreasedStat: "attack",
  },
  {
    name: "Serious",
    nameEs: "Seria",
    increasedStat: null,
    decreasedStat: null,
  },
] as const;

export function SpeedOptimizerForm() {
  const form = useSpeedForm();
  const { setSpeedForm, calculateSpeed, resetSpeed } = useOptimizerActions();
  const isCalculating = useIsCalculating();
  const [advanced, setAdvanced] = useState(false);
  const baseId = useId();

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight text-zinc-900">
          Velocidad Objetivo
        </h2>
        <button
          type="button"
          onClick={() => setAdvanced(!advanced)}
          className="text-xs text-zinc-500 hover:text-zinc-800"
        >
          {advanced ? "Simple" : "Avanzado"}
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label
              htmlFor={`${baseId}-pokemon`}
              className="mb-1.5 block text-xs font-medium text-zinc-600"
            >
              Pokémon
            </label>
            <div className="flex gap-2">
              <input
                id={`${baseId}-pokemon`}
                type="number"
                placeholder="ID ej. 445"
                value={form.pokemonId ?? ""}
                onChange={(e) => {
                  const id = e.target.value ? Number(e.target.value) : null;
                  const mock =
                    id === 445
                      ? {
                          hp: 108,
                          attack: 130,
                          defense: 95,
                          "special-attack": 80,
                          "special-defense": 85,
                          speed: 102,
                        }
                      : {
                          hp: 100,
                          attack: 100,
                          defense: 100,
                          "special-attack": 100,
                          "special-defense": 100,
                          speed: 100,
                        };
                  setSpeedForm({
                    pokemonId: id,
                    baseStats: mock as unknown as never,
                    pokemonName: id ? `#${id}` : null,
                  });
                }}
                className="h-9 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm tabular-nums focus:border-zinc-900 focus:outline-none"
              />
              <button
                type="button"
                onClick={() =>
                  setSpeedForm({
                    pokemonId: 445,
                    pokemonName: "Garchomp",
                    baseStats: {
                      hp: 108,
                      attack: 130,
                      defense: 95,
                      "special-attack": 80,
                      "special-defense": 85,
                      speed: 102,
                    } as unknown as never,
                    ivs: {
                      hp: 31,
                      attack: 31,
                      defense: 31,
                      "special-attack": 31,
                      "special-defense": 31,
                      speed: 31,
                    } as unknown as never,
                    nature: {
                      name: "Jolly",
                      nameEs: "Alegre",
                      increasedStat: "speed",
                      decreasedStat: "special-attack",
                    } as unknown as never,
                    level: 50,
                    targetSpeed: 168,
                  })
                }
                className="h-9 whitespace-nowrap rounded-md border border-zinc-200 bg-[#F8F5F0] px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
              >
                Preset Garchomp
              </button>
            </div>
            {form.baseStats && (
              <p className="mt-1 text-[11px] tabular-nums text-zinc-500">
                Base {form.baseStats.speed} Spe • {form.pokemonName}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor={`${baseId}-nature`}
              className="mb-1.5 block text-xs font-medium text-zinc-600"
            >
              Naturaleza
            </label>
            <select
              id={`${baseId}-nature`}
              value={form.nature.name}
              onChange={(e) => {
                const f = NATURES.find((n) => n.name === e.target.value);
                if (f) setSpeedForm({ nature: f as unknown as never });
              }}
              className="h-9 w-full rounded-md border border-zinc-200 bg-white px-2.5 text-sm focus:border-zinc-900 focus:outline-none"
            >
              {NATURES.map((n) => (
                <option key={n.name} value={n.name}>
                  {n.nameEs} ({n.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor={`${baseId}-level`}
              className="mb-1.5 block text-xs font-medium text-zinc-600"
            >
              Nivel
            </label>
            <input
              id={`${baseId}-level`}
              type="number"
              min={1}
              max={100}
              value={form.level}
              onChange={(e) => setSpeedForm({ level: Number(e.target.value) })}
              className="h-9 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm tabular-nums focus:border-zinc-900 focus:outline-none"
            />
          </div>

          <div className="col-span-2">
            <label
              htmlFor={`${baseId}-target`}
              className="mb-1.5 block text-xs font-medium text-zinc-600"
            >
              Velocidad Objetivo
            </label>
            <div className="relative">
              <input
                id={`${baseId}-target`}
                type="number"
                min={1}
                value={form.targetSpeed}
                onChange={(e) =>
                  setSpeedForm({ targetSpeed: Number(e.target.value) })
                }
                className="h-9 w-full rounded-md border border-zinc-900 bg-white px-3 pr-16 text-sm font-medium tabular-nums focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
                Spe
              </span>
            </div>
            <p className="mt-1 text-[11px] text-zinc-500">
              Ej. 168 para superar Base 100 max (167) • 213 Gholdengo Scarf
            </p>
          </div>

          {advanced && (
            <div className="col-span-2 grid grid-cols-3 gap-2 rounded-lg bg-zinc-50 p-3">
              <div>
                <label
                  htmlFor={`${baseId}-gen`}
                  className="block text-[11px] text-zinc-600"
                >
                  Gen
                </label>
                <select
                  id={`${baseId}-gen`}
                  value={form.generation}
                  onChange={(e) =>
                    setSpeedForm({ generation: Number(e.target.value) })
                  }
                  className="mt-1 h-8 w-full rounded border border-zinc-200 bg-white px-2 text-xs tabular-nums"
                >
                  <option value={9}>Gen 9</option>
                  <option value={8}>Gen 8</option>
                  <option value={7}>Gen 7</option>
                  <option value={3}>Gen 3</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor={`${baseId}-iv`}
                  className="block text-[11px] text-zinc-600"
                >
                  IV Spe
                </label>
                <input
                  id={`${baseId}-iv`}
                  type="number"
                  min={0}
                  max={31}
                  value={form.ivs.speed}
                  onChange={(e) =>
                    setSpeedForm({
                      ivs: { ...form.ivs, speed: Number(e.target.value) },
                    })
                  }
                  className="mt-1 h-8 w-full rounded border border-zinc-200 bg-white px-2 text-xs tabular-nums"
                />
              </div>
              <div>
                <span className="block text-[11px] text-zinc-600">Meta</span>
                <span className="mt-1 block h-8 rounded bg-white px-2 py-1.5 text-xs tabular-nums text-zinc-700">
                  min EV
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={calculateSpeed}
            disabled={isCalculating || !form.baseStats}
            className="h-9 flex-1 rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCalculating ? "Calculando..." : "Optimizar"}
          </button>
          <button
            type="button"
            onClick={resetSpeed}
            className="h-9 rounded-md border border-zinc-200 bg-white px-4 text-sm text-zinc-600 hover:bg-zinc-50"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
