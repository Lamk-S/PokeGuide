import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans p-8 md:p-24">
      <main className="max-w-5xl mx-auto space-y-16">
        <section className="space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            PokeGuide
          </h1>
          <h2 className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-400">
            Inteligencia Competitiva de Pokémon
          </h2>
          <p className="max-w-2xl text-lg text-zinc-500">
            Analiza, simula y optimiza estrategias competitivas de Pokémon
            mediante datos observables y cálculos deterministas.
          </p>
          <div className="flex gap-4 pt-4">
            <Button>Lanzar Laboratorio</Button>
            <Button variant="outline">Documentación</Button>
          </div>
        </section>

        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            "Laboratorio de Batallas",
            "Inteligencia de Equipos",
            "Optimizador de Builds",
            "Planificador de Crianza",
            "Inteligencia por Generación",
          ].map((module) => (
            <Card
              key={module}
              className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{module}</CardTitle>
                  <Badge variant="secondary">Planificado</Badge>
                </div>
                <CardDescription>
                  Módulo pendiente de implementación en los próximos bloques.
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
