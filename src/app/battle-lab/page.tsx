import type { Metadata } from "next";
import { BattleLabView } from "@/features/battle/components/BattleLabView";

export const metadata: Metadata = {
  title: "Laboratorio de Batalla",
  description:
    "Simulador avanzado de daño y análisis de combate Pokémon con motor Smogon — herramienta de precisión para VGC y competitivo.",
};

export default function BattleLabPage() {
  return <BattleLabView />;
}
