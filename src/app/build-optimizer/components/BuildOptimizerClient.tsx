"use client";
import { useActiveTab } from "@/features/optimization/store/useOptimizerStore";
import { OptimizerTabs } from "@/features/optimization/components/OptimizerTabs";
import { SpeedOptimizerForm } from "@/features/optimization/components/SpeedOptimizerForm";
import { SurvivalOptimizerForm } from "@/features/optimization/components/SurvivalOptimizerForm";
import { OptimizationResultCard } from "@/features/optimization/components/OptimizationResultCard";

function FormSwitch() {
  const activeTab = useActiveTab();
  return activeTab === "speed" ? (
    <SpeedOptimizerForm />
  ) : (
    <SurvivalOptimizerForm />
  );
}

export function BuildOptimizerClient() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6 border-b border-zinc-200 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Build Optimizer
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Encuentra la distribución perfecta de EVs gastando lo mínimo.
          Algoritmos deterministas, explicables y auditables.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-[11px] tabular-nums">
          <span className="rounded-full border border-zinc-200 bg-[#F8F5F0] px-2.5 py-1 text-zinc-600">
            Speed: Búsqueda Binaria • 6 iter max
          </span>
          <span className="rounded-full border border-zinc-200 bg-[#F8F5F0] px-2.5 py-1 text-zinc-600">
            Survival: Branch & Bound + Binary
          </span>
          <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-zinc-500">
            Zero business logic in UI
          </span>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-[380px_1fr] lg:grid-cols-[420px_1fr]">
        <div className="space-y-4">
          <OptimizerTabs />
          <FormSwitch />
        </div>
        <div>
          <OptimizationResultCard />
        </div>
      </div>
      <div className="mt-10 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-4">
        <h4 className="text-xs font-semibold text-zinc-700">
          ADR-006 • Build Optimization
        </h4>
        <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
          Speed usa búsqueda binaria sobre [0,4,...,252] (64 valores) para
          hallar el primer EV que alcanza ≥ target. Survival itera HP (64
          valores) y por cada HP hace binary search en Defensa, podando cuando
          HP ≥ bestTotal.
        </p>
      </div>
    </div>
  );
}
