"use client";
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body className="bg-[#F8F5F0]">
        <div className="min-h-screen p-6">
          <div className="max-w-xl border border-[#EDE8E0] bg-white p-6">
            <h2 className="font-serif text-[18px] font-semibold text-[#111]">
              Error crítico
            </h2>
            <pre className="mt-3 border border-[#FECACA] bg-[#FEF2F2] p-3 text-[11px] text-[#991B1B] whitespace-pre-wrap">
              {error.message}
            </pre>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => reset()}
                className="bg-[#111] text-white px-4 py-2 text-[13px] hover:bg-black"
              >
                Reintentar
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="border border-[#EDE8E0] px-4 py-2 text-[13px] bg-white hover:border-[#111]"
              >
                Recarga dura
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
