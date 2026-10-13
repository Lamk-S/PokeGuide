"use client";
export default function GlobalAppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#F8F5F0] p-6">
      <div className="max-w-xl border border-[#EDE8E0] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
        <h2 className="font-serif text-[18px] font-semibold text-[#111]">
          Algo falló
        </h2>
        <p className="mt-2 text-[13px] text-zinc-600">
          Ocurrió un error inesperado en la aplicación.
        </p>
        <pre className="mt-3 border border-[#FECACA] bg-[#FEF2F2] p-3 text-[11px] text-[#991B1B] whitespace-pre-wrap">
          {error.message}
        </pre>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => reset()}
            className="bg-[#111] text-white hover:bg-black h-9 px-4 text-[13px] font-medium border border-[#111]"
          >
            Reintentar
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="h-9 px-4 text-[13px] border border-[#EDE8E0] bg-white hover:border-[#111]"
          >
            Recarga completa
          </button>
        </div>
      </div>
    </div>
  );
}
