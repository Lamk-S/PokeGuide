import type { Metadata } from "next";
import { BattleLabView } from "@/features/battle/components/BattleLabView";

export const metadata: Metadata = {
  title: "Battle Lab | PokeGuide",
  description:
    "Simulador avanzado de daño y análisis de combate Pokémon con motor Smogon.",
};

export default function BattleLabPage() {
  return (
    <div className="space-y-8" data-testid="battle-lab-root">
      <BattleLabView />
    </div>
  );
}
