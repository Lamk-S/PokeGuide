import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-10 md:space-y-16 py-2 md:py-4">
      {/* Hero */}
      <section className="space-y-4 md:space-y-6 max-w-3xl">
        <div className="inline-flex items-center gap-2 h-6 px-2.5 rounded-full bg-[#111] text-white text-[10px] font-mono uppercase tracking-widest">
          Laboratorio competitivo
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-[-0.04em] leading-[0.95]">
          PokeGuide
        </h1>
        <h2 className="text-lg sm:text-xl md:text-2xl text-[#5A5652] font-medium tracking-[-0.01em] leading-tight">
          Inteligencia Competitiva de Pokémon
        </h2>
        <p className="max-w-2xl text-[13px] md:text-[14px] leading-[1.6] text-[#7A7570] font-mono">
          Analiza, simula y optimiza estrategias competitivas mediante datos
          observables y cálculos deterministas. Diseñado para VGC, Smogon OU y
          laboratorio de precisión.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
          <Link href="/battle-lab" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-10 rounded-full bg-[#111] text-white px-5 text-[13px] hover:bg-black">
              Lanzar Laboratorio
            </Button>
          </Link>
          <Button
            variant="outline"
            className="w-full sm:w-auto h-10 rounded-full border-[#EDE8E0] bg-[#FFFEFB] text-[13px]"
          >
            Documentación
          </Button>
        </div>
      </section>

      {/* Modules */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {[
          {
            name: "Laboratorio de Batallas",
            desc: "Simulación de daño real con clima, terreno, STAB y modificadores.",
            status: "Activo",
          },
          {
            name: "Inteligencia de Equipos",
            desc: "Builder con sinergias, cores y análisis de debilidades.",
            status: "Planificado",
          },
          {
            name: "Optimizador de Builds",
            desc: "EVs óptimos para sobrevivir golpes clave y outspeed.",
            status: "Planificado",
          },
          {
            name: "Planificador de Crianza",
            desc: "IVs, huevos, naturaleza y compatibilidad por generación.",
            status: "Planificado",
          },
          {
            name: "Inteligencia por Generación",
            desc: "Cambios de mecánicas, movimientos y dex por generación.",
            status: "Planificado",
          },
        ].map((module) => (
          <Card
            key={module.name}
            className="bg-[#FFFEFB] border-[#EDE8E0] shadow-[0_1px_2px_rgba(0,0,0,0.03)] rounded-xl"
          >
            <CardHeader className="p-4 md:p-6">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-[13px] md:text-[14px] font-semibold leading-tight">
                  {module.name}
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="text-[10px] font-mono bg-[#F8F5F0] border border-[#EDE8E0] shrink-0"
                >
                  {module.status}
                </Badge>
              </div>
              <CardDescription className="text-[11px] md:text-[12px] leading-snug text-[#7A7570] font-mono mt-2">
                {module.desc}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>
    </div>
  );
}
