"use client";
import { useId, useState } from "react";
import { useBuild, useOptimizerActions } from "../store/useOptimizerStore";
import { NATURES } from "@/domain/stats/constants/natures";
import type { StatName } from "@/domain/optimization/types/OptimizationTypes";
import type { Nature } from "@/domain/optimization/entities/BuildConfiguration";

const STATS: StatName[] = [
  "hp",
  "attack",
  "defense",
  "special-attack",
  "special-defense",
  "speed",
];

export function BuildPanel() {
  const build = useBuild();
  const { setBuild } = useOptimizerActions();
  const baseId = useId();
  const [showIVs, setShowIVs] = useState(false);

  const totalEVs = build.evsActuales.total();
  const remaining = build.evsActuales.remaining();

  return (
    <div className="rounded-xl border border-[#E5E2DA] bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-widest text-zinc-500">
          Configuración base
        </p>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] tabular-nums ${
            remaining < 0
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-[#F8F5F0] text-zinc-600 border-[#E5E2DA]"
          }`}
        >
          {totalEVs}/510 • libres {remaining}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor={`${baseId}-nature`}
            className="mb-1.5 block text-[10px] uppercase tracking-widest text-zinc-500"
          >
            Naturaleza
          </label>
          <select
            id={`${baseId}-nature`}
            value={build.fijos.naturaleza.name}
            onChange={(e) => {
              const found = NATURES.find(
                (n) => n.name === e.target.value,
              ) as unknown as Nature | undefined;
              if (found) {
                setBuild({ fijos: { ...build.fijos, naturaleza: found } });
              }
            }}
            className="h-9 w-full rounded-lg border border-[#E5E2DA] bg-[#FFFEFB] px-2.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-zinc-300"
          >
            {NATURES.map((n) => (
              <option key={n.name} value={n.name}>
                {n.nameEs} ({n.name})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor={`${baseId}-level`}
            className="mb-1.5 block text-[10px] uppercase tracking-widest text-zinc-500"
          >
            Nivel
          </label>
          <input
            id={`${baseId}-level`}
            type="number"
            min={1}
            max={100}
            value={build.contexto.nivel}
            onChange={(e) => {
              const lvl = Number(e.target.value);
              if (!Number.isFinite(lvl)) return;
              setBuild({ contexto: { ...build.contexto, nivel: lvl || 50 } });
            }}
            className="h-9 w-full rounded-lg border border-[#E5E2DA] bg-[#FFFEFB] px-3 text-[13px] tabular-nums focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-[10px] uppercase tracking-widest text-zinc-500">
          EVs actuales (fijos)
        </p>
        <div className="grid grid-cols-3 gap-2">
          {STATS.map((stat) => (
            <div
              key={stat}
              className="rounded-lg border border-[#E5E2DA] bg-[#FFFEFB] p-2"
            >
              <label
                htmlFor={`${baseId}-ev-${stat}`}
                className="block text-[10px] uppercase tracking-widest text-zinc-500"
              >
                {stat}
              </label>
              <input
                id={`${baseId}-ev-${stat}`}
                type="number"
                min={0}
                max={252}
                step={4}
                value={build.evsActuales.get(stat)}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (!Number.isFinite(v)) return;
                  try {
                    const clamped = Math.max(
                      0,
                      Math.min(252, Math.floor(v / 4) * 4),
                    );
                    const next = build.evsActuales.with(stat, clamped);
                    setBuild({ evsActuales: next });
                  } catch {
                    // validación en EVDistribution
                  }
                }}
                className="mt-1 h-7 w-full rounded border border-[#E5E2DA] bg-white px-2 text-[12px] tabular-nums"
              />
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-zinc-500">
          Los EVs actuales se respetan como presupuesto ocupado. El optimizador
          busca mínima inversión adicional.
        </p>
      </div>

      <div className="mt-3">
        <button
          type="button"
          onClick={() => setShowIVs((p) => !p)}
          className="h-8 rounded-lg border border-[#E5E2DA] bg-white px-3 text-[11px] text-zinc-600 hover:bg-[#F8F5F0]"
        >
          {showIVs ? "Ocultar IVs" : "Editar IVs"}
        </button>
      </div>

      {showIVs && (
        <div className="mt-4 rounded-lg border border-dashed border-[#E5E2DA] bg-[#F8F5F0] p-3">
          <p className="mb-2 text-[10px] uppercase tracking-widest text-zinc-500">
            IVs
          </p>
          <div className="grid grid-cols-3 gap-2">
            {STATS.map((stat) => (
              <div key={stat}>
                <label
                  htmlFor={`${baseId}-iv-${stat}`}
                  className="block text-[10px] text-zinc-600"
                >
                  {stat}
                </label>
                <input
                  id={`${baseId}-iv-${stat}`}
                  type="number"
                  min={0}
                  max={31}
                  value={build.fijos.ivs[stat]}
                  onChange={(e) => {
                    const iv = Number(e.target.value);
                    if (!Number.isFinite(iv)) return;
                    setBuild({
                      fijos: {
                        ...build.fijos,
                        ivs: {
                          ...build.fijos.ivs,
                          [stat]: Math.max(0, Math.min(31, iv)),
                        },
                      },
                    });
                  }}
                  className="mt-1 h-7 w-full rounded border border-[#E5E2DA] bg-white px-2 text-[12px] tabular-nums"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
