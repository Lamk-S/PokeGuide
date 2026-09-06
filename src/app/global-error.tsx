"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("GlobalError caught:", error);
  }, [error]);

  return (
    <html lang="es">
      <body>
        <main
          className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-white text-gray-900"
          role="alert"
          aria-live="assertive"
          aria-labelledby="global-error-title"
        >
          <h1
            id="global-error-title"
            className="text-3xl font-bold text-red-600 mb-4"
          >
            Error Crítico del Sistema
          </h1>
          <p className="text-gray-600 mb-2 max-w-md">
            Se ha producido un error inesperado. El equipo técnico ha sido
            notificado.
          </p>
          {error.digest && (
            <p className="text-xs text-gray-400 mb-6 font-mono">
              ID: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={() => reset()}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 transition-colors"
          >
            Intentar de nuevo
          </button>
        </main>
      </body>
    </html>
  );
}
