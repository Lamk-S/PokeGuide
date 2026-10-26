"use client";

import { useEffect } from "react";
import { useOptimizerStore } from "@/features/optimization/store/useOptimizerStore";
import { BuildPanel } from "@/features/optimization/components/BuildPanel";

export function BuildOptimizerClient() {
  const { reset, clearError } = useOptimizerStore();

  useEffect(() => {
    clearError();
    return () => {
      reset();
    };
  }, [clearError, reset]);

  return (
    <div className="container mx-auto max-w-7xl py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Optimizador de Builds
        </h1>
        <p className="text-muted-foreground">
          Calcula la inversión mínima de EVs para Speed tiers, supervivencia o
          KOs. Motor en Web Worker.
        </p>
      </div>
      <BuildPanel />
    </div>
  );
}
