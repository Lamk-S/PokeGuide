import type { Metadata } from "next";
import { BuildOptimizerClient } from "./components/BuildOptimizerClient";

export const metadata: Metadata = {
  title: "Build Optimizer | PokeGuide",
  description:
    "Optimización determinista de EVs - Speed y Survival con algoritmos explicables",
};

export default function Page() {
  return (
    <div className="min-h-screen bg-[#F8F5F0]">
      <BuildOptimizerClient />
    </div>
  );
}
