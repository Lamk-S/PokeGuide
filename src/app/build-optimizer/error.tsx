"use client";
import { useEffect } from "react";

type BuildOptimizerErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function BuildOptimizerError({
  error,
  reset,
}: BuildOptimizerErrorProps) {
  useEffect(() => {
    console.error("Build Optimizer Error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 text-center">
      <div className="mx-auto max-w-md rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-sm font-semibold text-red-800">
          Error en Build Optimizer
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-red-600">
          {error.message || "Error inesperado"}
        </p>
        <p className="mt-2 text-[11px] tabular-nums text-red-400">
          Digest: {error.digest ?? "N/A"}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 h-9 rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
