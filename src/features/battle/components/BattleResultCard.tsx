"use client";
import { memo, useMemo } from "react";
import type {
  BattleResult,
  IBattleConditions,
} from "@/domain/battle/types/BattleParticipant";
import { translateTypeUpper } from "@/components/ui/TypeBadge";
import { formatPokemonDisplayName } from "@/domain/pokemon/services/PokemonDisplayName";
import type { BattleParticipantInput } from "@/features/battle/store/useBattleStore";

type PokemonLike =
  | { id?: number; name?: string; types?: unknown[] }
  | null
  | undefined;

interface Props {
  readonly result: BattleResult | null;
  readonly attackerPokemon?: PokemonLike | undefined;
  readonly defenderPokemon?: PokemonLike | undefined;
  readonly attackerInput?: BattleParticipantInput | null | undefined;
  readonly defenderInput?: BattleParticipantInput | null | undefined;
  readonly conditions?: IBattleConditions | null | undefined;
  readonly moveName?: string | undefined;
  readonly moveType?: string | undefined;
  readonly movePower?: number | null | undefined;
  readonly generation?: number | undefined;
  readonly error?: string | null | undefined;
}

interface EmptyProps {
  readonly missing?: string[] | undefined;
}

function getName(p: PokemonLike): string | null {
  if (!p) return null;
  const raw = (p as { name?: string }).name;
  return raw ? formatPokemonDisplayName(raw) : null;
}

function getEvTotalFromInput(
  input: BattleParticipantInput | null | undefined,
): number {
  if (!input) return 0;
  const evs = (input as { evs?: Record<string, number> }).evs;
  if (!evs) return 0;
  return Object.values(evs).reduce((a: number, b: number) => a + (b ?? 0), 0);
}

function getStatusLabelEs(
  status: string | null | undefined,
): { label: string; effect: string } | null {
  if (!status) return null;
  const s = status.toLowerCase().trim();
  if (
    s === "healthy" ||
    s === "none" ||
    s === "" ||
    s === "saludable" ||
    s === "ninguno"
  )
    return null;
  const map: Record<string, { label: string; effect: string }> = {
    burn: {
      label: "Quemado",
      effect: "0.5x daño físico (excepto Guts/Agallas o Fachada)",
    },
    quemado: {
      label: "Quemado",
      effect: "0.5x daño físico (excepto Guts/Agallas o Fachada)",
    },
    paralyze: {
      label: "Paralizado",
      effect: "25% Vel., 50% fallo turno en juego real",
    },
    paralysis: {
      label: "Paralizado",
      effect: "No afecta daño, 50% fallo turno",
    },
    paralizado: {
      label: "Paralizado",
      effect: "No afecta daño, 50% fallo turno",
    },
    poison: { label: "Envenenado", effect: "No afecta daño directo" },
    envenenado: { label: "Envenenado", effect: "No afecta daño directo" },
    "bad-poison": {
      label: "Grav. Envenenado",
      effect: "No afecta daño directo",
    },
    "badly-poisoned": {
      label: "Grav. Envenenado",
      effect: "No afecta daño directo",
    },
    toxic: { label: "Grav. Envenenado", effect: "No afecta daño directo" },
    sleep: { label: "Dormido", effect: "No puede atacar en juego real" },
    dormido: { label: "Dormido", effect: "No puede atacar en juego real" },
    freeze: { label: "Congelado", effect: "No puede atacar en juego real" },
    frozen: { label: "Congelado", effect: "No puede atacar en juego real" },
    congelado: { label: "Congelado", effect: "No puede atacar en juego real" },
  };
  return map[s] || { label: status, effect: "Estado alterado" };
}

function getAbilityLabelEs(
  ability: string | null | undefined,
): { label: string; effect: string } | null {
  if (!ability) return null;
  const lower = ability.toLowerCase().replace(/-/g, " ").trim();
  if (
    lower === "" ||
    lower === "-" ||
    lower === "sin habilidad" ||
    lower === "none"
  )
    return null;
  const map: Record<string, { label: string; effect: string }> = {
    intimidate: { label: "Intimidación", effect: "Baja ATQ rival al entrar" },
    intimidacion: { label: "Intimidación", effect: "Baja ATQ rival" },
    levitate: { label: "Levitación", effect: "Inmune a Tierra" },
    levitacion: { label: "Levitación", effect: "Inmune a Tierra" },
    blaze: { label: "Mar Llamas", effect: "1.5x Fuego con <33% PS" },
    "mar llamas": { label: "Mar Llamas", effect: "1.5x Fuego con <33% PS" },
    torrent: { label: "Torrente", effect: "1.5x Agua con <33% PS" },
    overgrow: { label: "Espesura", effect: "1.5x Planta con <33% PS" },
    swarm: { label: "Enjambre", effect: "1.5x Bicho con <33% PS" },
    "solar power": { label: "Poder Solar", effect: "1.5x At.Esp con Sol" },
    "poder solar": { label: "Poder Solar", effect: "1.5x At.Esp con Sol" },
    "flash fire": {
      label: "Absorbe Fuego",
      effect: "Inmune Fuego, +50% Fuego",
    },
    guts: {
      label: "Agallas",
      effect: "1.5x ATQ con estado + ignora quemadura",
    },
    agallas: {
      label: "Agallas",
      effect: "1.5x ATQ con estado + ignora quemadura",
    },
    "huge power": { label: "Potencia", effect: "2x ATQ" },
    potencia: { label: "Potencia", effect: "2x ATQ" },
    adaptability: { label: "Adaptable", effect: "STAB 2x en vez de 1.5x" },
    adaptable: { label: "Adaptable", effect: "STAB 2x" },
  };
  for (const [k, v] of Object.entries(map)) {
    if (lower === k || lower.includes(k)) return v;
  }
  return { label: ability, effect: "Habilidad activa" };
}

function getItemLabelEs(
  item: string | null | undefined,
): { label: string; effect: string } | null {
  if (!item) return null;
  const lower = item.toLowerCase().replace(/-/g, " ").trim();
  if (
    lower === "" ||
    lower === "-" ||
    lower === "sin objeto" ||
    lower === "no item"
  )
    return null;
  const map: Record<string, string> = {
    "choice band": "1.5x ATQ físico",
    "cinta elegida": "1.5x ATQ físico",
    "choice specs": "1.5x AT. ESP",
    "gafas elegidas": "1.5x AT. ESP",
    "choice scarf": "1.5x VEL",
    "panuelo elegido": "1.5x VEL",
    "life orb": "1.3x daño (pierde 10% PS)",
    vidasfera: "1.3x daño (pierde 10% PS)",
    "expert belt": "1.2x si súper eficaz",
    "cinta experto": "1.2x si súper eficaz",
    "muscle band": "1.1x físico",
    "cinta fuerte": "1.1x físico",
    "wise glasses": "1.1x especial",
    "gafas sabias": "1.1x especial",
    "chaleco asalto": "Sube 50% Def. Esp.",
    "assault vest": "Sube 50% Def. Esp.",
    "lodo negro": "Recupera 1/16 PS Veneno",
    "black sludge": "Recupera 1/16 PS Veneno",
    baya: "Reduce daño supereficaz",
    leftovers: "Recupera 1/16 PS",
    restos: "Recupera 1/16 PS",
  };
  for (const [k, v] of Object.entries(map)) {
    if (lower.includes(k)) return { label: item, effect: v };
  }
  return { label: item, effect: "Objeto equipado" };
}

export function ResultEmptyState({ missing }: EmptyProps) {
  return (
    <div className="bg-[#FFFEFB] rounded-xl border border-dashed border-[#EDE8E0] p-6 text-center">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-[#9A9590]">
        Daño estimado
      </div>
      <p className="mt-2 text-[12px] leading-normal text-[#7A7570]">
        {missing && missing.length > 0
          ? `Falta: ${missing.join(" · ")}. Completa atacante, defensor y movimiento.`
          : "Selecciona atacante, defensor y movimiento y presiona Calcular daño."}
      </p>
      <p className="mt-2 text-[10px] font-mono text-[#9A9590]">
        El primer cálculo es manual, luego se actualiza automático.
      </p>
    </div>
  );
}

export function ResultErrorState({ error }: { readonly error: string }) {
  return (
    <div className="bg-[#FFFEFB] rounded-xl border border-dashed border-[#EDE8E0] p-6 text-center">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-[#9A9590]">
        Daño estimado
      </div>
      <p className="mt-2 text-[12px] leading-normal text-[#991B1B]">{error}</p>
    </div>
  );
}

export const BattleResultCard = memo(function BattleResultCard({
  result,
  attackerPokemon,
  defenderPokemon,
  attackerInput,
  defenderInput,
  conditions,
  moveName = "Movimiento",
  moveType,
  movePower,
  generation = 9,
  error,
}: Props) {
  const attackerName = getName(attackerPokemon) ?? "Atacante";
  const defenderName = getName(defenderPokemon) ?? "Defensor";

  const minDmg = result?.damage.minDamage ?? 0;
  const maxDmg = result?.damage.maxDamage ?? 0;
  const minPct = result?.damage.minPercent ?? 0;
  const maxPct = result?.damage.maxPercent ?? 0;
  const defenderHp = result?.defenderMaxHp ?? 0;
  const remainingMax = Math.max(0, 100 - minPct);
  const remainingMin = Math.max(0, 100 - maxPct);
  const isGuaranteed = result
    ? result.koAnalysis.guaranteed || minPct >= 100
    : false;
  const isPossible = result ? !isGuaranteed && maxPct >= 100 : false;
  const hits = result?.koAnalysis.hitsToKO ?? 0;
  const prob = result?.koAnalysis.probability ?? 0;

  const koExplain = useMemo(() => {
    if (!result) return "";
    if (isGuaranteed)
      return `Roll mínimo (${minDmg}) ya hace ${minPct.toFixed(1)}% > 100% de ${defenderHp} PS. Los 16 rolls (85%-100%) matan.`;
    if (isPossible)
      return `Min ${minPct.toFixed(1)}% no mata, max ${maxPct.toFixed(1)}% sí. ${prob.toFixed(0)}% de rolls son KO → ${hits}HKO con chance.`;
    return `Max ${maxDmg} / ${maxPct.toFixed(1)}% no alcanza 100%. Necesita ${hits} golpes.`;
  }, [
    result,
    isGuaranteed,
    isPossible,
    minDmg,
    maxDmg,
    minPct,
    maxPct,
    defenderHp,
    prob,
    hits,
  ]);

  const effectivenessNote = useMemo(() => {
    if (!result) return "Neutro (1x)";
    const eff =
      (result as BattleResult & { effectiveness?: number }).effectiveness ?? 1;
    if (eff === 0) return "Inmune (0x)";
    if (eff === 0.25) return "Doble resistencia (0.25x)";
    if (eff === 0.5) return "Resistido (0.5x)";
    if (eff === 1) return "Neutro (1x)";
    if (eff === 2) return "Súper eficaz (2x)";
    if (eff === 4) return "Doble debilidad (4x)";
    return `${eff}x`;
  }, [result]);

  const stabNote = useMemo(() => "STAB 1.5x si tipo coincide", []);

  const weatherNote = useMemo(() => {
    if (!conditions) return null;
    const w = conditions.weather;
    if (!w || w === "none") return null;
    const map: Record<string, string> = {
      sun: "Sol 1.5x Fuego / 0.5x Agua",
      rain: "Lluvia 1.5x Agua / 0.5x Fuego",
      sand: "Tormenta arena",
      hail: "Granizo",
    };
    return map[w] || w;
  }, [conditions]);

  const terrainNote = useMemo(() => {
    if (!conditions) return null;
    const t = conditions.terrain;
    if (!t || t === "none") return null;
    const map: Record<string, string> = {
      electric: "Campo Eléctrico 1.3x Eléctrico",
      grassy: "Campo Hierba 1.3x Planta / 0.5x Tierra",
      misty: "Campo Niebla 0.5x Dragón",
      psychic: "Campo Psíquico 1.3x Psíquico",
    };
    return map[t] || t;
  }, [conditions]);

  const attackerStatusNote = useMemo(
    () => getStatusLabelEs(attackerInput?.status),
    [attackerInput?.status],
  );
  const defenderStatusNote = useMemo(
    () => getStatusLabelEs(defenderInput?.status),
    [defenderInput?.status],
  );
  const attackerItemNote = useMemo(
    () => getItemLabelEs(attackerInput?.item),
    [attackerInput?.item],
  );
  const defenderItemNote = useMemo(
    () => getItemLabelEs(defenderInput?.item),
    [defenderInput?.item],
  );
  const attackerAbilityNote = useMemo(
    () => getAbilityLabelEs(attackerInput?.ability),
    [attackerInput?.ability],
  );
  const defenderAbilityNote = useMemo(
    () => getAbilityLabelEs(defenderInput?.ability),
    [defenderInput?.ability],
  );

  const evAtk = getEvTotalFromInput(attackerInput ?? null);
  const evDef = getEvTotalFromInput(defenderInput ?? null);

  if (error) {
    return <ResultErrorState error={error} />;
  }

  if (!result) {
    return <ResultEmptyState />;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-[#FFFEFB] rounded-xl border border-[#EDE8E0] shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="px-4 py-2.5 flex items-center justify-between border-b border-[#F0EDE6]">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#9A9590]">
            Daño estimado
          </span>
          <span className="text-[10px] font-mono text-[#9A9590]">
            Gen {generation}
          </span>
        </div>
        <div className="p-4">
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-bold tracking-[-0.03em] font-mono tabular-nums leading-none">
              {minDmg} – {maxDmg}
            </span>
            <span className="text-[13px] font-medium text-[#7A7570]">
              Daño Mín. / Daño Máx.
            </span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-[#7A7570] leading-snug">
            {moveName} {moveType ? `• ${translateTypeUpper(moveType)}` : ""}{" "}
            {movePower ? `• ${movePower} pot.` : ""} vs.{" "}
            {defenderName.toLowerCase()}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center h-6 px-2.5 rounded-full bg-[#111] text-white text-[11px] font-mono font-semibold tabular-nums">
              {minPct.toFixed(1)}% – {maxPct.toFixed(1)}%
            </span>
            <span className="text-[10px] font-mono text-[#9A9590] tabular-nums">
              PS restante {remainingMin.toFixed(1)}% – {remainingMax.toFixed(1)}
              % · PS {defenderHp}
            </span>
          </div>
          <div
            className={`mt-3 flex items-start gap-1.5 text-[12px] font-medium leading-snug ${isGuaranteed ? "text-[#065F46]" : isPossible ? "text-[#92400E]" : "text-[#7A7570]"}`}
          >
            <span
              className={`mt-1 size-1.5 rounded-full shrink-0 ${isGuaranteed ? "bg-[#065F46]" : isPossible ? "bg-[#D97706]" : "bg-[#9A9590]"}`}
            />
            <span>
              {isGuaranteed
                ? `KO en ${hits} golpe garantizado`
                : isPossible
                  ? `${hits}HKO · ${prob.toFixed(0)}% de KO`
                  : `${hits}HKO · no garantiza`}
            </span>
          </div>

          {(attackerStatusNote ||
            defenderStatusNote ||
            attackerItemNote ||
            defenderItemNote ||
            attackerAbilityNote ||
            defenderAbilityNote) && (
            <div className="mt-3 grid grid-cols-1 gap-2">
              {attackerStatusNote && (
                <div className="flex items-center gap-2 text-[11px] rounded-md bg-[#FFFBEB] border border-[#FDE68A] px-2.5 py-1.5">
                  <span className="font-semibold">
                    {attackerName}: {attackerStatusNote.label}
                  </span>
                  <span className="text-[#92400E]">
                    · {attackerStatusNote.effect}
                  </span>
                </div>
              )}
              {defenderStatusNote && (
                <div className="flex items-center gap-2 text-[11px] rounded-md bg-[#FEF2F2] border border-[#FECACA] px-2.5 py-1.5">
                  <span className="font-semibold">
                    {defenderName}: {defenderStatusNote.label}
                  </span>
                  <span className="text-[#991B1B]">
                    · {defenderStatusNote.effect}
                  </span>
                </div>
              )}
              {attackerItemNote && (
                <div className="flex items-center gap-2 text-[11px] rounded-md bg-[#F0FDF4] border border-[#BBF7D0] px-2.5 py-1.5">
                  <span className="font-semibold">
                    {attackerName}: {attackerItemNote.label}
                  </span>
                  <span className="text-[#065F46]">
                    · {attackerItemNote.effect}
                  </span>
                </div>
              )}
              {defenderItemNote && (
                <div className="flex items-center gap-2 text-[11px] rounded-md bg-[#F0FDF4] border border-[#BBF7D0] px-2.5 py-1.5">
                  <span className="font-semibold">
                    {defenderName}: {defenderItemNote.label}
                  </span>
                  <span className="text-[#065F46]">
                    · {defenderItemNote.effect}
                  </span>
                </div>
              )}
              {attackerAbilityNote && (
                <div className="flex items-center gap-2 text-[11px] rounded-md bg-[#EFF6FF] border border-[#BFDBFE] px-2.5 py-1.5">
                  <span className="font-semibold">
                    {attackerName}: {attackerAbilityNote.label}
                  </span>
                  <span className="text-[#1E40AF]">
                    · {attackerAbilityNote.effect}
                  </span>
                </div>
              )}
              {defenderAbilityNote && (
                <div className="flex items-center gap-2 text-[11px] rounded-md bg-[#EFF6FF] border border-[#BFDBFE] px-2.5 py-1.5">
                  <span className="font-semibold">
                    {defenderName}: {defenderAbilityNote.label}
                  </span>
                  <span className="text-[#1E40AF]">
                    · {defenderAbilityNote.effect}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="mt-4 rounded-lg bg-[#F8F5F0] border border-[#EDE8E0] p-3">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-[#111]">
              ¿Por qué?
            </div>
            <p className="mt-1.5 text-[12px] leading-normal text-[#2B2B2B]">
              {koExplain}
            </p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <span className="inline-flex h-5 px-2 rounded-full bg-white border border-[#EDE8E0] text-[10px] font-mono text-[#57534E]">
                {effectivenessNote}
              </span>
              <span className="inline-flex h-5 px-2 rounded-full bg-white border border-[#EDE8E0] text-[10px] font-mono text-[#57534E]">
                {stabNote}
              </span>
              {weatherNote && (
                <span className="inline-flex h-5 px-2 rounded-full bg-white border border-[#EDE8E0] text-[10px] font-mono text-[#57534E]">
                  {weatherNote}
                </span>
              )}
              {terrainNote && (
                <span className="inline-flex h-5 px-2 rounded-full bg-white border border-[#EDE8E0] text-[10px] font-mono text-[#57534E]">
                  {terrainNote}
                </span>
              )}
              {attackerItemNote && (
                <span className="inline-flex h-5 px-2 rounded-full bg-white border border-[#EDE8E0] text-[10px] font-mono text-[#065F46]">
                  Objeto ATQ: {attackerItemNote.effect}
                </span>
              )}
              {defenderItemNote && (
                <span className="inline-flex h-5 px-2 rounded-full bg-white border border-[#EDE8E0] text-[10px] font-mono text-[#065F46]">
                  Objeto DEF: {defenderItemNote.effect}
                </span>
              )}
              {attackerStatusNote && (
                <span className="inline-flex h-5 px-2 rounded-full bg-white border border-[#EDE8E0] text-[10px] font-mono text-[#92400E]">
                  Estado ATQ: {attackerStatusNote.label}
                </span>
              )}
              {defenderStatusNote && (
                <span className="inline-flex h-5 px-2 rounded-full bg-white border border-[#EDE8E0] text-[10px] font-mono text-[#991B1B]">
                  Estado DEF: {defenderStatusNote.label}
                </span>
              )}
              {attackerAbilityNote && (
                <span className="inline-flex h-5 px-2 rounded-full bg-white border border-[#EDE8E0] text-[10px] font-mono text-[#1E40AF]">
                  Hab. ATQ: {attackerAbilityNote.label}
                </span>
              )}
              {defenderAbilityNote && (
                <span className="inline-flex h-5 px-2 rounded-full bg-white border border-[#EDE8E0] text-[10px] font-mono text-[#1E40AF]">
                  Hab. DEF: {defenderAbilityNote.label}
                </span>
              )}
              <span
                title="Fórmula oficial: 16 valores aleatorios del 85% al 100%, por eso siempre 16 rolls"
                className="inline-flex h-5 px-2 rounded-full bg-white border border-[#EDE8E0] text-[10px] font-mono text-[#57534E]"
              >
                16 rolls · 85% a 100%
              </span>
            </div>
            <p className="mt-2 text-[9px] font-mono text-[#9A9590] leading-snug">
              * 16 rolls es fijo por mecánica de juego: cada ataque tiene 16
              variaciones de daño (85% a 100%). No es configurable.
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-[#EDE8E0] bg-white px-3 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-[#9A9590] tabular-nums">
        <span>
          {evAtk}/510 Esfuerzo atacante - {attackerName}
        </span>
        <span>{evDef}/510 Defensor</span>
        <span className="ml-auto">
          VIDA RESTANTE {remainingMin.toFixed(1)}% mostrada · PS siempre, nunca
          HP
        </span>
      </div>
    </div>
  );
});
