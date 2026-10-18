"use client";
import { useEffect } from "react";
import { usePokedexStore } from "@/features/pokemon/store/usePokedexStore";
import { PokemonPicker } from "@/features/optimization/components/PokemonPicker";
import { BuildPanel } from "@/features/optimization/components/BuildPanel";
import { ObjectiveConfigurator } from "@/features/optimization/components/ObjectiveConfigurator";
import { OptimizationResultCard } from "@/features/optimization/components/OptimizationResultCard";
import { useOptimizerStore } from "@/features/optimization/store/useOptimizerStore";

export function BuildOptimizerClient() {
  const build = useOptimizerStore((s) => s.build);
  const setBuild = useOptimizerStore((s) => s.setBuild);
  const calc = useOptimizerStore((s) => s.calculateSpeed);
  useEffect(() => {
    void usePokedexStore.getState().loadPokemon();
  }, []);
  return (
    <div className="min-h-screen bg-[#FFFEFB] -mx-4 md:-mx-6 lg:-mx-8 -my-6 md:-my-8">
      <div className="border-b border-[#E5E2DA] bg-[#FFFEFB] px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-350 flex items-center gap-2">
          <h1 className="text-[13px] font-semibold text-[#111]">
            Optimizador de Builds
          </h1>
          <span className="text-[11px] text-zinc-500">
            Configuracion eficiente con evidencia matematica
          </span>
        </div>
      </div>
      <main className="mx-auto max-w-350 px-4 py-6 sm:px-6 lg:px-8 grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <div className="rounded-xl border border-dashed border-[#E5E2DA] bg-white p-4">
            <PokemonPicker
              value={build.pokemonId || null}
              onSelect={(id) => setBuild({ pokemonId: id ?? 0 })}
              label="Pokémon a optimizar"
              id="build-poke"
            />
          </div>
          <BuildPanel />
        </div>
        <div className="space-y-4">
          <ObjectiveConfigurator />
          <div className="rounded-xl border border-[#E5E2DA] bg-white p-4">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">
              Optimizacion
            </p>
            <button
              type="button"
              onClick={() => void calc()}
              className="mt-3 h-8 w-full rounded-lg bg-[#111] text-[12px] font-medium text-white"
            >
              Optimizar build minima
            </button>
            <p className="mt-2 text-[11px] text-zinc-500">
              Optimizando: EVs · Fijos: Naturaleza, IVs, Nivel, Gen{" "}
              {build.contexto.generacion}
            </p>
          </div>
          <OptimizationResultCard />
        </div>
      </main>
    </div>
  );
}
