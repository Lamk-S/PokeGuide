"use client";
import type { ProofCandidate } from "@/domain/optimization/types/OptimizationTypes";

type Proof = {
  failingCandidate: ProofCandidate | null;
  passingCandidate: ProofCandidate | null;
} | null;

export function EvidencePanel({
  evidence,
  summary,
  proof,
}: {
  evidence: string[];
  summary?: string;
  proof?: Proof;
}) {
  return (
    <div className="border-t border-[#E5E2DA] pt-4">
      <p className="text-[10px] uppercase tracking-widest text-zinc-500">
        Prueba de optimalidad
      </p>
      <div className="mt-3 flex flex-wrap gap-4 border-b border-[#111] pb-3">
        {evidence.slice(0, 3).map((ev) => {
          const isPass = ev.toLowerCase().includes("cumple");
          return (
            <div key={ev} className="flex flex-col">
              <div
                className={`h-2 w-2 rounded-full ${isPass ? "bg-[#111]" : "border border-zinc-400"}`}
              />
              <p
                className={`mt-2 max-w-55 font-mono text-[11px] leading-snug ${
                  isPass
                    ? "text-[#111] underline decoration-[#C4B5A5] underline-offset-4"
                    : "text-zinc-500"
                }`}
              >
                {ev}
              </p>
              <p className="mt-1 text-[10px] text-zinc-400">
                {isPass ? "— cumple objetivo" : "— no alcanza"}
              </p>
            </div>
          );
        })}
      </div>
      {summary ? (
        <p className="mt-3 text-[12px] leading-relaxed text-zinc-700">
          {summary}
        </p>
      ) : null}
      {proof ? (
        <div className="mt-3 rounded-lg border border-[#EDE8E0] bg-[#F8F5F0] p-3">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500">
            Candidatos
          </p>
          <div className="mt-2 grid grid-cols-2 gap-3 font-mono text-[11px] tabular-nums">
            <div>
              <p className="text-zinc-500">Fallo previo</p>
              <p className="mt-1 text-zinc-700">
                {proof.failingCandidate
                  ? JSON.stringify(proof.failingCandidate)
                  : "— (0 EVs ya cumple)"}
              </p>
            </div>
            <div>
              <p className="text-zinc-500">Paso mínimo</p>
              <p className="mt-1 text-emerald-700">
                {proof.passingCandidate
                  ? JSON.stringify(proof.passingCandidate)
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
