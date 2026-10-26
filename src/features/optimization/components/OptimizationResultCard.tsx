"use client";

import { useOptimizerStore } from "@/features/optimization/store/useOptimizerStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, XCircle, AlertTriangle, Copy } from "lucide-react";
import { EvidencePanel } from "@/features/optimization/components/EvidencePanel";
import { ResultComparison } from "@/features/optimization/components/ResultComparison";
import type { Proof } from "@/domain/optimization/types/OptimizationTypes";

function ResultSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="h-4 w-48 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-20 w-full animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  );
}

function ErrorAlert({
  message,
  onClear,
}: {
  message: string;
  onClear: () => void;
}) {
  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive text-base">
          <XCircle className="h-4 w-4" />
          No se pudo optimizar
        </CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" size="sm" onClick={onClear}>
          Intentar de nuevo
        </Button>
      </CardContent>
    </Card>
  );
}

function EmptyResult() {
  return (
    <Card className="border-dashed">
      <CardContent className="py-12 text-center space-y-2">
        <p className="text-sm font-medium">Sin resultado aún</p>
        <p className="text-xs text-muted-foreground">
          Ejecuta la optimización para ver la distribución de EVs.
        </p>
      </CardContent>
    </Card>
  );
}

function OptimalResultView() {
  const { optimizationResult } = useOptimizerStore();
  if (!optimizationResult) return null;

  const isOptimal = optimizationResult.status === "Optimal";
  const isInfeasible = optimizationResult.status === "Infeasible";

  const evidence: string[] = optimizationResult.explanation?.evidence ?? [];
  const summary: string | undefined = optimizationResult.explanation?.summary;
  const proof: Proof | undefined = optimizationResult.explanation?.proof;

  if (isInfeasible) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Inalcanzable
          </CardTitle>
          <CardDescription>
            El objetivo no es alcanzable con las restricciones actuales.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EvidencePanel evidence={evidence} summary={summary} proof={proof} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            Build Óptimo
          </CardTitle>
          <Badge variant={isOptimal ? "default" : "secondary"}>
            {optimizationResult.status}
          </Badge>
        </div>
        <CardDescription>
          Distribución mínima de EVs que cumple el objetivo. Generado vía Web
          Worker.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {optimizationResult.solution !== undefined && (
          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">
                SOLUCIÓN
              </span>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <div className="text-2xl font-bold">
              {typeof optimizationResult.solution === "number"
                ? `${optimizationResult.solution as number} EVs`
                : JSON.stringify(optimizationResult.solution)}
            </div>
            {optimizationResult.cost !== undefined && (
              <p className="text-xs text-muted-foreground mt-1">
                Coste: {optimizationResult.cost as number} EVs totales
              </p>
            )}
          </div>
        )}
        <Separator />
        <ResultComparison />
        {evidence.length > 0 && (
          <>
            <Separator />
            <EvidencePanel
              evidence={evidence}
              summary={summary}
              proof={proof}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function OptimizationResultCard() {
  const { isOptimizing, optimizationError, optimizationResult, clearError } =
    useOptimizerStore();

  if (isOptimizing) {
    return <ResultSkeleton />;
  }

  if (optimizationError) {
    return <ErrorAlert message={optimizationError} onClear={clearError} />;
  }

  if (!optimizationResult) {
    return <EmptyResult />;
  }

  return <OptimalResultView />;
}
