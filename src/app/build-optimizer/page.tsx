import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Build Optimizer | PokeGuide",
  description:
    "Encuentra la distribución matemática óptima de EVs para tus Pokémon.",
};

export default function BuildOptimizerPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Optimizador de Builds
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Calcula la inversión mínima exacta de EVs para superar objetivos de
          velocidad o sobrevivir a ataques específicos.
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800">
        <p className="text-sm font-medium text-zinc-500">
          Motor de optimización en desarrollo (Fase F)
        </p>
      </div>
    </div>
  );
}
