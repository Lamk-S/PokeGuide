import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team Builder",
  description: "Construye y analiza sinergia y cobertura defensiva.",
};

export default function TeamBuilderPage() {
  return (
    <div className="space-y-8" data-testid="team-builder-root">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Inteligencia de Equipos
        </h1>
        <p className="mt-2 max-w-3xl text-zinc-500 dark:text-zinc-400">
          Construye tu equipo y obtén un análisis determinista sobre
          vulnerabilidades y sinergias.
        </p>
      </div>
      <div
        role="status"
        className="rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800"
      >
        <p className="text-sm font-medium text-zinc-500">
          Constructor en desarrollo (Fase E)
        </p>
      </div>
    </div>
  );
}
