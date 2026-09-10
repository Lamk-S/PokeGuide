import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Generation Intelligence | PokeGuide",
  description:
    "Explora y compara los cambios de mecánicas entre diferentes generaciones Pokémon.",
};

export default function GenerationsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Inteligencia Generacional
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Compara las reglas mecánicas, disponibilidad de objetos y
          restricciones históricas entre diferentes generaciones.
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800">
        <p className="text-sm font-medium text-zinc-500">
          Explorador de reglas en desarrollo (Fase H)
        </p>
      </div>
    </div>
  );
}
