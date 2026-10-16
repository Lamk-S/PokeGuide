"use client";
import {
  useSurvivalForm,
  useOptimizerActions,
  useIsCalculating,
} from "../store/useOptimizerStore";
import { useId } from "react";

export function SurvivalOptimizerForm() {
  const form = useSurvivalForm();
  const { setSurvivalForm, calculateSurvival, resetSurvival } =
    useOptimizerActions();
  const isCalculating = useIsCalculating();
  const baseId = useId();

  const handleCalc = () => {
    const threshold = form.movePower > 100 ? 160 : 120;
    const evaluator = (hpEV: number, defEV: number) =>
      hpEV + defEV >= threshold;
    calculateSurvival(evaluator);
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold tracking-tight text-zinc-900">
        Supervivencia Óptima
      </h2>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label
              htmlFor={`${baseId}-defender`}
              className="mb-1.5 block text-xs font-medium text-zinc-600"
            >
              Pokémon Defensor
            </label>
            <input
              id={`${baseId}-defender`}
              type="number"
              placeholder="ID ej. 700"
              value={form.pokemonId ?? ""}
              onChange={(e) => {
                const id = e.target.value ? Number(e.target.value) : null;
                const mock = {
                  hp: 95,
                  attack: 65,
                  defense: 65,
                  "special-attack": 110,
                  "special-defense": 130,
                  speed: 60,
                };
                setSurvivalForm({
                  pokemonId: id,
                  baseStats: mock as unknown as never,
                  pokemonName: id ? `#${id}` : null,
                });
              }}
              className="h-9 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm tabular-nums focus:border-zinc-900 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor={`${baseId}-stat`}
              className="mb-1.5 block text-xs font-medium text-zinc-600"
            >
              Stat Defensivo
            </label>
            <select
              id={`${baseId}-stat`}
              value={form.defenseStat}
              onChange={(e) =>
                setSurvivalForm({
                  defenseStat: e.target.value as unknown as never,
                })
              }
              className="h-9 w-full rounded-md border border-zinc-200 bg-white px-2.5 text-sm focus:border-zinc-900 focus:outline-none"
            >
              <option value="defense">Defensa Física</option>
              <option value="special-defense">Def. Especial</option>
            </select>
          </div>
          <div>
            <label
              htmlFor={`${baseId}-power`}
              className="mb-1.5 block text-xs font-medium text-zinc-600"
            >
              Potencia Ataque
            </label>
            <input
              id={`${baseId}-power`}
              type="number"
              min={1}
              max={250}
              value={form.movePower}
              onChange={(e) =>
                setSurvivalForm({ movePower: Number(e.target.value) })
              }
              className="h-9 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm tabular-nums focus:border-zinc-900 focus:outline-none"
            />
          </div>
          <div className="col-span-2">
            <label
              htmlFor={`${baseId}-move`}
              className="mb-1.5 block text-xs font-medium text-zinc-600"
            >
              Movimiento Amenaza
            </label>
            <input
              id={`${baseId}-move`}
              type="text"
              placeholder="Ej. Earthquake"
              value={form.moveName ?? ""}
              onChange={(e) =>
                setSurvivalForm({ moveName: e.target.value || null })
              }
              className="h-9 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm focus:border-zinc-900 focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-zinc-500">
              Branch & Bound: itera 64 HP, binary en Defensa. Poda si HP ≥
              bestTotal
            </p>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={handleCalc}
            disabled={isCalculating || !form.baseStats}
            className="h-9 flex-1 rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {" "}
            {isCalculating ? "Calculando..." : "Optimizar Supervivencia"}{" "}
          </button>
          <button
            type="button"
            onClick={resetSurvival}
            className="h-9 rounded-md border border-zinc-200 bg-white px-4 text-sm text-zinc-600 hover:bg-zinc-50"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
