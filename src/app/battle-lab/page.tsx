import type { Metadata } from "next";
import { BattleLabView } from "@/features/battle/components/BattleLabView";

export const metadata: Metadata = {
  title: "Battle Lab",
  description:
    "Simulador avanzado de daño y análisis de combate Pokémon con motor Smogon.",
};

export default function BattleLabPage() {
  return (
    <div className="space-y-8" data-testid="battle-lab-root">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Laboratorio de Batalla
        </h1>
        <p className="mt-2 max-w-3xl text-zinc-500 dark:text-zinc-400">
          Simula escenarios de combate con precisión matemática utilizando
          reglas generacionales y el motor adaptado de Smogon.
        </p>
      </div>

      <BattleLabView />
    </div>
  );
}
