"use client";
import { memo, useMemo } from "react";
import type { BattleResult } from "@/domain/battle/types/BattleTypes";
import type { Pokemon } from "@/domain/pokemon/types/pokemon";
import type { BattleParticipantInput } from "@/features/battle/store/useBattleStore";
import type { BattleScenario } from "@/domain/battle/entities/BattleScenario";
import {
  TypeBadge,
  translateTypeUpper,
  translateType,
} from "@/components/ui/TypeBadge";
import {
  extractTypeName,
  type PokemonTypeRef,
} from "@/domain/pokemon/utils/pokemonHelpers";

interface Props {
  result: BattleResult;
  attackerPokemon?: Pokemon;
  defenderPokemon?: Pokemon;
  attackerInput?: BattleParticipantInput | null;
  defenderInput?: BattleParticipantInput | null;
  conditions?: BattleScenario["conditions"];
  moveName?: string | undefined;
  moveType?: string | undefined;
  movePower?: number | null | undefined;
  generation?: number;
}

const WEATHER_LABEL_ES: Record<string, string> = {
  none: "Sin clima",
  sun: "Sol",
  rain: "Lluvia",
  sand: "Tormenta arena",
  hail: "Granizo",
  snow: "Nieve",
  harsh_sun: "Sol intenso",
  heavy_rain: "Lluvia intensa",
  strong_winds: "Vientos fuertes",
};

const TERRAIN_LABEL_ES: Record<string, string> = {
  none: "Sin campo",
  electric: "Campo eléctrico",
  grassy: "Campo de hierba",
  misty: "Campo de niebla",
  psychic: "Campo psíquico",
};

const STATUS_LABEL_ES: Record<string, string> = {
  none: "Sin estado",
  burn: "Quemado",
  paralyze: "Paralizado",
  poison: "Envenenado",
  "badly-poisoned": "Grav. envenenado",
  sleep: "Dormido",
  freeze: "Congelado",
};

function getWeatherFactor(
  weather: string | undefined,
  moveType: string | undefined,
): string {
  if (!weather || weather === "none") return "×1.0 clima (neutral)";
  const w = WEATHER_LABEL_ES[weather] || weather;
  if (!moveType) return `×1.0 clima (${w})`;
  const mt = moveType.toLowerCase();
  if (weather.includes("sun") && mt === "fire")
    return `×1.5 clima (${w} potencia Fuego)`;
  if (weather.includes("sun") && mt === "water")
    return `×0.5 clima (${w} reduce Agua)`;
  if (weather.includes("rain") && mt === "water")
    return `×1.5 clima (${w} potencia Agua)`;
  if (weather.includes("rain") && mt === "fire")
    return `×0.5 clima (${w} reduce Fuego)`;
  return `×1.0 clima (${w})`;
}

function getTerrainFactor(
  terrain: string | undefined,
  moveType: string | undefined,
): string | null {
  if (!terrain || terrain === "none") return null;
  const t = TERRAIN_LABEL_ES[terrain] || terrain;
  if (!moveType) return `×1.0 campo (${t})`;
  const mt = moveType.toLowerCase();
  if (terrain === "electric" && mt === "electric")
    return `×1.3 campo (${t} potencia Eléctrico)`;
  if (terrain === "grassy" && mt === "grass")
    return `×1.3 campo (${t} potencia Planta)`;
  if (terrain === "grassy" && (mt === "ground" || mt === "earthquake"))
    return `×0.5 campo (${t} reduce daño)`;
  return `×1.0 campo (${t})`;
}

export const BattleResultCard = memo(function BattleResultCard({
  result,
  attackerPokemon,
  defenderPokemon,
  attackerInput,
  defenderInput,
  conditions,
  moveName,
  moveType,
  movePower,
  generation = 9,
}: Props) {
  const remainingMax = Math.max(0, 100 - result.damage.minPercent);
  const remainingMin = Math.max(0, 100 - result.damage.maxPercent);

  const attackerLine = useMemo(() => {
    if (!attackerInput) return null;
    const evs = attackerInput.evs as unknown as Record<string, number>;
    const total = Object.values(evs).reduce((a, b) => a + (b || 0), 0);
    return {
      nature: attackerInput.nature.nameEs || attackerInput.nature.name,
      total,
      ability: attackerInput.ability || "—",
      item: attackerInput.item || "—",
    };
  }, [attackerInput]);

  const defenderLine = useMemo(() => {
    if (!defenderInput) return null;
    const evs = defenderInput.evs as unknown as Record<string, number>;
    const total = Object.values(evs).reduce((a, b) => a + (b || 0), 0);
    return {
      nature: defenderInput.nature.nameEs || defenderInput.nature.name,
      total,
      ability: defenderInput.ability || "—",
      item: defenderInput.item || "—",
    };
  }, [defenderInput]);

  const isKO = result.koAnalysis.guaranteed || result.damage.minPercent >= 100;
  const isImmune = result.damage.maxDamage === 0;

  const attackerTypes = useMemo(() => {
    if (!attackerPokemon?.types) return [];
    return attackerPokemon.types
      .map((t) => extractTypeName(t as PokemonTypeRef))
      .filter(Boolean) as string[];
  }, [attackerPokemon]);

  const defenderTypes = useMemo(() => {
    if (!defenderPokemon?.types) return [];
    return defenderPokemon.types
      .map((t) => extractTypeName(t as PokemonTypeRef))
      .filter(Boolean) as string[];
  }, [defenderPokemon]);

  const hasStab = useMemo(() => {
    if (!moveType || !attackerTypes.length) return false;
    return attackerTypes.some(
      (t) => t.toLowerCase() === moveType.toLowerCase(),
    );
  }, [moveType, attackerTypes]);

  const calculationLog = useMemo(() => {
    const logs: string[] = [];
    // Efectividad real del motor si existe, sino calculamos texto genérico
    const moveTypeEs = moveType ? translateType(moveType) : "—";
    const defTypesEs = defenderTypes.map((dt) => translateType(dt)).join(" / ");
    if (moveType && defenderTypes.length) {
      logs.push(
        `×${(result.damage.maxPercent / 50).toFixed(1)} efectividad ${moveTypeEs} → ${defTypesEs}`,
      );
    } else if (result.explanation.activeModifiers.length) {
      logs.push(...result.explanation.activeModifiers.map((m) => `× ${m}`));
    }
    // Clima
    logs.push(getWeatherFactor(conditions?.weather, moveType));
    // Campo
    const terrainLog = getTerrainFactor(conditions?.terrain, moveType);
    if (terrainLog) logs.push(terrainLog);
    // Objeto
    if (attackerLine?.item && attackerLine.item !== "—")
      logs.push(`×1.3 objeto (${attackerLine.item})`);
    else logs.push("×1.0 objeto (ninguno)");
    // Habilidad
    if (attackerLine?.ability && attackerLine.ability !== "—")
      logs.push(`Habilidad: ${attackerLine.ability}`);
    // Crítico
    if (conditions?.isCriticalHit) logs.push("×1.5 golpe crítico");
    // STAB
    logs.push(hasStab ? "×1.5 STAB" : "×1.0 sin STAB");
    // Estado
    const atkStatus =
      attackerInput?.status && attackerInput.status !== "none"
        ? STATUS_LABEL_ES[attackerInput.status] || attackerInput.status
        : null;
    if (atkStatus) logs.push(`Estado atacante: ${atkStatus}`);
    const defStatus =
      defenderInput?.status && defenderInput.status !== "none"
        ? STATUS_LABEL_ES[defenderInput.status] || defenderInput.status
        : null;
    if (defStatus) logs.push(`Estado defensor: ${defStatus}`);
    return logs;
  }, [
    moveType,
    defenderTypes,
    result,
    conditions,
    attackerLine,
    hasStab,
    attackerInput,
    defenderInput,
  ]);

  const tacticalNote = useMemo(() => {
    const defName = defenderPokemon?.name ? defenderPokemon.name : "Defensor";
    const mv = moveName || "Movimiento";
    if (isImmune)
      return `${mv} es inmune contra ${defName}. Cambia de movimiento o usa un tipo ${defenderTypes.map((t) => translateType(t)).join("/")} efectivo.`;
    if (isKO) {
      let extra = "";
      if (conditions?.weather && conditions.weather !== "none")
        extra += ` Con ${WEATHER_LABEL_ES[conditions.weather] || conditions.weather} activo el margen aumenta.`;
      if (attackerLine?.item && attackerLine.item !== "—")
        extra += ` Con ${attackerLine?.item} aseguras más margen.`;
      return `Con ${attackerLine?.total ?? 0} EVs y naturaleza ${attackerLine?.nature ?? "Neutra"}, ${mv} garantiza KO en 1 golpe vs ${defName} (${result.damage.minPercent}-${result.damage.maxPercent}%).${extra} Verifica habilidad rival ${defenderLine?.ability ?? ""}.`;
    }
    const prob = result.koAnalysis.probability;
    const hits = result.koAnalysis.hitsToKO;
    if (hits === 2) {
      return `2HKO con ${prob}% probabilidad vs ${defName}. Con ${attackerLine?.total ?? 0} EVs necesitas ${Math.max(0, 100 - result.damage.maxPercent).toFixed(0)}% extra para garantizar. Considera ${conditions?.weather === "none" ? "Sol o Vidasfera para subir a 38% extra" : "cambiar clima"} y revisa ${defenderLine?.ability ?? "habilidad rival"}.`;
    }
    const weatherLabel = conditions?.weather
      ? (WEATHER_LABEL_ES[conditions.weather] ?? conditions.weather)
      : "";
    const itemLabel =
      attackerLine?.item && attackerLine.item !== "—"
        ? attackerLine.item
        : "objeto ofensivo";
    const weatherPart =
      conditions?.weather && conditions.weather !== "none"
        ? weatherLabel
        : "clima favorable";
    return `${mv} hace ${result.damage.minPercent}-${result.damage.maxPercent}% a ${defName}. ${hits}HKO. Si llevas ${weatherPart} o ${itemLabel} aumentas el rango.`;
  }, [
    isImmune,
    isKO,
    result,
    defenderPokemon,
    moveName,
    defenderTypes,
    conditions,
    attackerLine,
    defenderLine,
  ]);

  const moveTypeDisplay = moveType ? translateTypeUpper(moveType) : "—";

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-[#FFFEFB] rounded-xl border border-[#EDE8E0] shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="px-4 py-2.5 flex items-center justify-between border-b border-[#F0EDE6]">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#9A9590]">
            Daño estimado
          </span>
          <span className="text-[10px] font-mono text-[#9A9590]">
            Gen {generation} · Escarlata/Violeta
          </span>
        </div>

        <div className="p-4">
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-bold tracking-[-0.03em] font-mono tabular-nums leading-none">
              {result.damage.minDamage} – {result.damage.maxDamage}
            </span>
            <span className="text-[13px] font-medium text-[#7A7570]">
              puntos
            </span>
          </div>

          <div className="mt-2 text-[11px] font-mono text-[#7A7570] leading-snug">
            {moveName || "Movimiento"} {moveType ? `• ${moveTypeDisplay}` : ""}{" "}
            {movePower ? `• ${movePower} pot.` : ""} vs.{" "}
            {defenderPokemon?.name ? defenderPokemon.name : "Defensor"}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center h-6 px-2.5 rounded-full bg-[#111] text-white text-[11px] font-mono font-semibold tabular-nums">
              {result.damage.minPercent}% – {result.damage.maxPercent}%
            </span>
            <span className="text-[10px] font-mono text-[#9A9590] tabular-nums">
              Vida restante {remainingMin.toFixed(1)}% –{" "}
              {remainingMax.toFixed(1)}% · PS {result.defenderMaxHp}
            </span>
          </div>

          <div
            className={`mt-3 flex items-center gap-1.5 text-[12px] font-medium ${isImmune ? "text-[#991B1B]" : isKO ? "text-[#065F46]" : "text-[#92400E]"}`}
          >
            <span
              className={`size-1.5 rounded-full ${isImmune ? "bg-[#991B1B]" : isKO ? "bg-[#065F46]" : "bg-[#D97706]"}`}
            />
            {isImmune
              ? "Inmune — no hace daño"
              : isKO
                ? `KO en ${result.koAnalysis.hitsToKO} golpe garantizado`
                : `${result.koAnalysis.hitsToKO}HKO · ${result.koAnalysis.probability}% probabilidad`}
          </div>

          <div className="mt-3 rounded-lg bg-[#F8F5F0] border border-[#EDE8E0] p-2.5">
            <p className="text-[10px] font-mono leading-normal text-[#7A7570]">
              {result.explanation.summary ||
                `${attackerLine?.total || 0} ATE Esp. ${attackerPokemon?.name || "Atacante"} ${moveName || ""} vs. 0 PS / 0 Def. Esp. ${defenderPokemon?.name || "Defensor"}: ${result.damage.minDamage}-${result.damage.maxDamage} (${result.damage.minPercent} - ${result.damage.maxPercent}%) -- ${isKO ? "KO garantizado en 1 golpe" : "posible KO"}`}
            </p>
          </div>

          <div className="mt-4 divide-y divide-[#F0EDE6] border-t border-[#F0EDE6]">
            <div className="flex items-center justify-between py-2.5 gap-2">
              <span className="text-[10px] uppercase tracking-[0.08em] text-[#9A9590] font-semibold">
                Efectividad
              </span>
              <span className="flex items-center gap-2 text-[11px] text-right">
                <span className="font-mono font-medium">
                  {moveTypeDisplay} ·{" "}
                  {result.damage.maxPercent >= 100
                    ? "2×"
                    : result.damage.maxPercent === 0
                      ? "0×"
                      : "1×"}{" "}
                  · {hasStab ? "STAB" : "Sin STAB"}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${result.damage.maxPercent === 0 ? "bg-[#F3F4F6] text-[#6B7280]" : result.damage.maxPercent >= 100 ? "bg-[#E8F5E9] text-[#2D5A27]" : "bg-[#FFF3E0] text-[#7A3D00]"}`}
                >
                  {isImmune
                    ? "Inmune"
                    : result.damage.maxPercent >= 100
                      ? "Súper efectivo"
                      : "Neutro"}
                </span>
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5 gap-2">
              <span className="text-[10px] uppercase tracking-[0.08em] text-[#9A9590] font-semibold">
                Clima / Campo
              </span>
              <span className="text-[11px] font-mono text-right">
                {conditions?.weather && conditions.weather !== "none"
                  ? WEATHER_LABEL_ES[conditions.weather] || conditions.weather
                  : "—"}{" "}
                /{" "}
                {conditions?.terrain && conditions.terrain !== "none"
                  ? TERRAIN_LABEL_ES[conditions.terrain] || conditions.terrain
                  : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5 gap-2">
              <span className="text-[10px] uppercase tracking-[0.08em] text-[#9A9590] font-semibold">
                Crítico y estado
              </span>
              <span className="text-[11px] font-mono text-[#5A5652] text-right">
                {conditions?.isCriticalHit ? "Crítico ×1.5" : "Normal"} ·{" "}
                {attackerInput?.status && attackerInput.status !== "none"
                  ? STATUS_LABEL_ES[attackerInput.status] ||
                    attackerInput.status
                  : "Sin estado"}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F0EDE6] space-y-3">
            <div className="flex justify-between gap-2">
              <span className="text-[10px] uppercase tracking-[0.08em] font-semibold text-[#9A9590]">
                Atacante · {attackerPokemon?.name || "Atacante"}
              </span>
              <span className="text-[10px] font-mono text-[#9A9590]">
                Nv. {attackerInput?.level || 50} · {attackerLine?.total || 0}{" "}
                EVs
              </span>
            </div>
            <div className="text-[11px] font-mono">
              {attackerLine?.nature} · {attackerLine?.total} EVs ATE ·{" "}
              {attackerLine?.ability} · {attackerLine?.item}
            </div>
            <div className="flex flex-wrap gap-1">
              {attackerTypes.map((tn) => (
                <TypeBadge key={tn} type={tn} size="sm" />
              ))}
            </div>

            <div className="flex justify-between gap-2 pt-2">
              <span className="text-[10px] uppercase tracking-[0.08em] font-semibold text-[#9A9590]">
                Defensor · {defenderPokemon?.name || "Defensor"}
              </span>
              <span className="text-[10px] font-mono text-[#9A9590]">
                Nv. {defenderInput?.level || 50} · {defenderLine?.total || 0}{" "}
                EVs
              </span>
            </div>
            <div className="text-[11px] font-mono">
              {defenderLine?.nature} · {defenderLine?.total} EVs DFE ·{" "}
              {defenderLine?.ability} · {defenderLine?.item}
            </div>
            <div className="flex flex-wrap gap-1">
              {defenderTypes.map((tn) => (
                <TypeBadge key={tn} type={tn} size="sm" />
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 border-t border-[#F0EDE6] pt-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.08em] text-[#9A9590] font-semibold">
                Potencia
              </div>
              <div className="text-[13px] font-mono font-bold mt-1">
                {movePower ?? "—"}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.08em] text-[#9A9590] font-semibold">
                Precisión
              </div>
              <div className="text-[13px] font-mono font-bold mt-1">90%</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.08em] text-[#9A9590] font-semibold">
                Prioridad
              </div>
              <div className="text-[13px] font-mono font-bold mt-1">0</div>
            </div>
          </div>

          <div className="mt-3 rounded-lg bg-[#FFFEFB] border border-dashed border-[#EDE8E0] p-2.5">
            <p className="text-[11px] leading-normal text-[#7A7570]">
              <span className="font-semibold text-[#1A1A1A]">
                Nota táctica:
              </span>{" "}
              {tacticalNote}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[#F8F5F0] rounded-xl border border-[#EDE8E0] p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-[0.08em] font-semibold text-[#9A9590]">
            Registro de cálculo
          </span>
          <span className="text-[10px] font-mono text-[#9A9590]">
            {calculationLog.length} modificadores activos
          </span>
        </div>
        <div className="space-y-1">
          {calculationLog.map((m) => (
            <div key={m} className="text-[10px] font-mono text-[#7A7570]">
              {m}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export function ResultEmptyState({ missing }: { missing: string[] }) {
  return (
    <div className="bg-[#FFFEFB] rounded-xl border border-dashed border-[#D9CFC2] p-8 text-center min-h-70 flex flex-col justify-between">
      <div>
        <div className="text-[13px] font-medium text-[#1A1A1A]">
          Falta {missing.join(", ")}
        </div>
        <div className="text-[11px] text-[#9A9590] mt-1.5 font-mono leading-snug">
          Completa atacante, defensor y movimiento para calcular el daño real
        </div>
      </div>
      <div className="mt-4 h-30 rounded-lg bg-[#F8F5F0] border border-[#EDE8E0] flex items-center justify-center">
        <span className="text-[10px] font-mono text-[#9A9590] uppercase tracking-widest">
          Esperando datos
        </span>
      </div>
    </div>
  );
}
