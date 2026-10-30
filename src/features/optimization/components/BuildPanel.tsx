"use client";

import { AlertTriangle, Loader2, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { NATURES } from "@/domain/stats/constants/natures";
import type { Nature } from "@/domain/stats/types/StatTypes";
import { BuildPreview } from "@/features/optimization/components/BuildPreview";
import { MovePicker } from "@/features/optimization/components/MovePicker";
import { ObjectiveConfigurator } from "@/features/optimization/components/ObjectiveConfigurator";
import { OptimizationResultCard } from "@/features/optimization/components/OptimizationResultCard";
import { PokemonPicker } from "@/features/optimization/components/PokemonPicker";
import { useOptimizerStore } from "@/features/optimization/store/useOptimizerStore";

function OptimizingState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Calculando build óptimo...</p>
      </CardContent>
    </Card>
  );
}

function ErrorState({
  message,
  onClear,
}: {
  message: string;
  onClear: () => void;
}) {
  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" /> Error de optimización
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{message}</p>
        <Button variant="outline" size="sm" onClick={onClear}>
          Limpiar error
        </Button>
      </CardContent>
    </Card>
  );
}

function EmptyObjectiveState() {
  return (
    <Card className="border-dashed">
      <CardContent className="py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Configura un Pokémon y un objetivo para comenzar.
        </p>
      </CardContent>
    </Card>
  );
}

function getNatureById(id: string): Nature {
  const found = NATURES.find((n) => n.name.toLowerCase() === id.toLowerCase());
  if (found) return found as Nature;
  return {
    name: "Serious",
    nameEs: "Seria",
    increasedStat: null,
    decreasedStat: null,
  } as Nature;
}

export function BuildPanel() {
  const {
    selectedPokemonId,
    selectedMoveId,
    objective,
    level,
    evs,
    ivs,
    baseStats,
    natureId,
    generation,
    isOptimizing,
    optimizationError,
    optimizationResult,
    setSelectedPokemonId,
    setSelectedMoveId,
    optimizeBuild,
    clearError,
  } = useOptimizerStore();

  const canOptimize = selectedPokemonId !== null && objective !== null;
  const nature = getNatureById(natureId);

  function handleOptimize() {
    if (canOptimize) void optimizeBuild();
  }

  const showEmptyState = !canOptimize && !isOptimizing && !optimizationError;
  const showError = Boolean(optimizationError) && !isOptimizing;
  const showLoading = isOptimizing;
  const showResult =
    Boolean(optimizationResult) && !isOptimizing && !optimizationError;

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="lg:col-span-7 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" /> Configuración de Build
            </CardTitle>
            <CardDescription>
              El cálculo se ejecuta en un Web Worker.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Pokémon</h3>
                {selectedPokemonId !== null && (
                  <Badge variant="secondary">ID: {selectedPokemonId}</Badge>
                )}
              </div>
              <PokemonPicker
                value={selectedPokemonId}
                onSelect={setSelectedPokemonId}
                label="Pokémon"
                id="pokemon-picker"
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Objetivo</h3>
              <ObjectiveConfigurator />
            </div>
            <Separator />
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Movimiento / Contexto</h3>
              <MovePicker
                valueId={selectedMoveId ?? ""}
                onSelect={setSelectedMoveId}
                label="Movimiento"
                id="move-picker"
              />
            </div>
            <BuildPreview
              pokemonId={selectedPokemonId ?? 0}
              evs={evs}
              ivs={ivs}
              baseStats={baseStats}
              level={level}
              nature={nature}
              generation={generation}
            />
          </CardContent>
        </Card>
        <Button
          onClick={handleOptimize}
          disabled={!canOptimize || isOptimizing}
          className="w-full"
          size="lg"
        >
          {isOptimizing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Calculando...
            </>
          ) : (
            "Optimizar Build"
          )}
        </Button>
      </div>
      <div className="lg:col-span-5 space-y-4">
        {showEmptyState && <EmptyObjectiveState />}
        {showLoading && <OptimizingState />}
        {showError && optimizationError && (
          <ErrorState message={optimizationError} onClear={clearError} />
        )}
        {showResult && <OptimizationResultCard />}
      </div>
    </div>
  );
}
