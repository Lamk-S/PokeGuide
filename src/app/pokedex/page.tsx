import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pokédex | PokeGuide",
  description:
    "Consulta las estadísticas base y tipos del dataset competitivo local.",
};

export default function PokedexPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pokédex</h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Base de datos local ultrarrápida, optimizada para la extracción de
          estadísticas base sin latencia de red.
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800">
        <p className="text-sm font-medium text-zinc-500">
          Pokédex en desarrollo (Fase I)
        </p>
      </div>
    </div>
  );
}
