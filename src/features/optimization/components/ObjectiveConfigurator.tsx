"use client";
import { useId } from "react";
import { useObjective, useOptimizerActions } from "../store/useOptimizerStore";
import { PokemonPicker } from "./PokemonPicker";
import { MovePicker } from "./MovePicker";
import type {
  OffensiveStat,
  DefenseStat,
} from "@/domain/optimization/types/OptimizationTypes";
import type {
  DamageObjective,
  SurvivalObjective,
  SpeedObjective,
} from "@/domain/optimization/value-objects/Objective";

export function ObjectiveConfigurator() {
  const objective = useObjective();
  const { setObjective } = useOptimizerActions();
  const baseId = useId();

  return (
    <div className="rounded-xl border border-[#E5E2DA] bg-white p-4">
      <p className="text-[10px] uppercase tracking-widest text-zinc-500">
        Objetivo competitivo
      </p>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => {
            const next: SpeedObjective = {
              type: "speed",
              target: 168,
              stat: "speed",
            };
            setObjective(next);
          }}
          className={`rounded-lg border p-3 text-left ${
            objective.type === "speed"
              ? "border-[#111] bg-[#F8F5F0]"
              : "border-[#E5E2DA] hover:bg-[#F8F5F0]"
          }`}
        >
          <p className="text-[12px] font-medium text-[#111]">Velocidad</p>
          <p className="mt-1 text-[11px] leading-snug text-zinc-500">
            Mínima inversión para superar umbral
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            const next: DamageObjective = {
              type: "damage",
              targetPercent: 100,
              offensiveStat: "attack",
              moveId: "",
              defenderId: 0,
            };
            setObjective(next);
          }}
          className={`rounded-lg border p-3 text-left ${
            objective.type === "damage"
              ? "border-[#111] bg-[#F8F5F0]"
              : "border-[#E5E2DA] hover:bg-[#F8F5F0]"
          }`}
        >
          <p className="text-[12px] font-medium text-[#111]">Daño</p>
          <p className="mt-1 text-[11px] leading-snug text-zinc-500">
            Mínimo Atk/SpA para alcanzar %
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            const next: SurvivalObjective = {
              type: "survival",
              defenseStat: "defense",
              moveId: "",
              attackerId: 0,
            };
            setObjective(next);
          }}
          className={`rounded-lg border p-3 text-left ${
            objective.type === "survival"
              ? "border-[#111] bg-[#F8F5F0]"
              : "border-[#E5E2DA] hover:bg-[#F8F5F0]"
          }`}
        >
          <p className="text-[12px] font-medium text-[#111]">Supervivencia</p>
          <p className="mt-1 text-[11px] leading-snug text-zinc-500">
            Mínimo HP+Def/SpD para sobrevivir
          </p>
        </button>
      </div>

      <div className="mt-5 border-t border-[#E5E2DA] pt-4">
        {objective.type === "speed" && (
          <div className="space-y-3">
            <div>
              <label
                htmlFor={`${baseId}-target-speed`}
                className="mb-1.5 block text-[10px] uppercase tracking-widest text-zinc-500"
              >
                Velocidad objetivo
              </label>
              <input
                id={`${baseId}-target-speed`}
                type="number"
                min={1}
                value={objective.target}
                onChange={(e) => {
                  const next: SpeedObjective = {
                    type: "speed",
                    target: Number(e.target.value) || 0,
                    stat: "speed",
                  };
                  setObjective(next);
                }}
                className="h-9 w-full rounded-lg border border-[#E5E2DA] bg-[#FFFEFB] px-3 text-[13px] tabular-nums focus:outline-none focus:ring-1 focus:ring-zinc-300"
              />
            </div>
          </div>
        )}

        {objective.type === "damage" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <div>
                <label
                  htmlFor={`${baseId}-off-stat`}
                  className="mb-1.5 block text-[10px] uppercase tracking-widest text-zinc-500"
                >
                  Stat ofensivo
                </label>
                <select
                  id={`${baseId}-off-stat`}
                  value={objective.offensiveStat}
                  onChange={(e) => {
                    const value = e.target.value as OffensiveStat;
                    setObjective({ ...objective, offensiveStat: value });
                  }}
                  className="h-9 w-full rounded-lg border border-[#E5E2DA] bg-white px-2.5 text-[12px]"
                >
                  <option value="attack">Ataque físico</option>
                  <option value="special-attack">Ataque especial</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor={`${baseId}-target-percent`}
                  className="mb-1.5 block text-[10px] uppercase tracking-widest text-zinc-500"
                >
                  % de daño objetivo (máx)
                </label>
                <input
                  id={`${baseId}-target-percent`}
                  type="number"
                  min={1}
                  max={500}
                  value={objective.targetPercent}
                  onChange={(e) =>
                    setObjective({
                      ...objective,
                      targetPercent: Number(e.target.value) || 0,
                    })
                  }
                  className="h-9 w-full rounded-lg border border-[#E5E2DA] bg-[#FFFEFB] px-3 text-[13px] tabular-nums"
                />
              </div>
              <PokemonPicker
                value={objective.defenderId || null}
                onSelect={(id) =>
                  setObjective({ ...objective, defenderId: id ?? 0 })
                }
                label="Defensor (objetivo de daño)"
                id={`${baseId}-defender`}
                placeholder="Elige defensor..."
              />
            </div>
            <div>
              <MovePicker
                valueId={objective.moveId}
                onSelect={(mid) => setObjective({ ...objective, moveId: mid })}
                label="Movimiento atacante"
                id={`${baseId}-move-damage`}
                placeholder="Busca movimiento..."
              />
            </div>
          </div>
        )}

        {objective.type === "survival" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <div>
                <label
                  htmlFor={`${baseId}-def-stat`}
                  className="mb-1.5 block text-[10px] uppercase tracking-widest text-zinc-500"
                >
                  Stat defensivo a optimizar
                </label>
                <select
                  id={`${baseId}-def-stat`}
                  value={objective.defenseStat}
                  onChange={(e) => {
                    const value = e.target.value as DefenseStat;
                    setObjective({ ...objective, defenseStat: value });
                  }}
                  className="h-9 w-full rounded-lg border border-[#E5E2DA] bg-white px-2.5 text-[12px]"
                >
                  <option value="defense">Defensa física</option>
                  <option value="special-defense">Defensa especial</option>
                </select>
              </div>
              <PokemonPicker
                value={objective.attackerId || null}
                onSelect={(id) =>
                  setObjective({ ...objective, attackerId: id ?? 0 })
                }
                label="Atacante (amenaza)"
                id={`${baseId}-attacker`}
                placeholder="Elige atacante..."
              />
            </div>
            <div>
              <MovePicker
                valueId={objective.moveId}
                onSelect={(mid) => setObjective({ ...objective, moveId: mid })}
                label="Movimiento amenaza"
                id={`${baseId}-move-surv`}
                placeholder="Busca movimiento..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
