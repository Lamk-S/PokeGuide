import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Breeding Planner | PokeGuide",
  description:
    "Encuentra la ruta más corta para criar tu Pokémon competitivo ideal.",
};

export default function BreedingPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Planificador de Crianza
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Calcula la secuencia óptima para heredar naturalezas, movimientos
          huevo e IVs utilizando algoritmos de búsqueda.
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800">
        <p className="text-sm font-medium text-zinc-500">
          Planificador en desarrollo (Fase G)
        </p>
      </div>
    </div>
  );
}
