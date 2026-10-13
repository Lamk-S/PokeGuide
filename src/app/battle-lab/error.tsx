"use client";
export default function BattleLabError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[50vh] bg-[#F8F5F0] p-6">
      <div className="max-w-xl border border-[#EDE8E0] bg-white p-6">
        <h2 className="font-serif text-[16px] font-semibold text-[#111]">
          Error en Battle Lab
        </h2>
        <pre className="mt-3 border border-[#FECACA] bg-[#FEF2F2] p-3 text-[11px] text-[#991B1B] whitespace-pre-wrap">
          {error.message}
        </pre>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-3 bg-[#111] text-white px-3 py-1.5 text-[12px] font-medium hover:bg-black"
        >
          Reintentar laboratorio
        </button>
      </div>
    </div>
  );
}
