"use client";
import { calculate, Field, Generations, Move, Pokemon } from "@smogon/calc";
import type {
  IResolvedBattleScenario,
  IResolvedParticipant,
} from "@/domain/battle/types/BattleParticipant";
import { normalizeId } from "@/domain/shared/utils/normalizeId";

type StatSetLike = Record<string, unknown>;

function toNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (v && typeof v === "object" && "value" in v) {
    const obj = v as { value: unknown };
    if (typeof obj.value === "number") return obj.value;
  }
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
}

function extractStatSet(set: unknown): {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
} {
  const out = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
  if (!set || typeof set !== "object") return out;
  const raw = set as StatSetLike;
  out.hp = toNumber(raw.hp);
  out.atk = toNumber(raw.attack ?? raw.atk);
  out.def = toNumber(raw.defense ?? raw.def);
  out.spa = toNumber(raw["special-attack"] ?? raw.spa);
  out.spd = toNumber(raw["special-defense"] ?? raw.spd);
  out.spe = toNumber(raw.speed ?? raw.spe);
  return out;
}

export class SmogonCalculatorAdapter {
  calculate(scenario: IResolvedBattleScenario) {
    const { generation, attacker, defender, moveName, moveId, conditions } =
      scenario;

    const attackerNameRaw =
      (attacker as { name?: string }).name?.toLowerCase() || "";
    if (generation === 1 && attackerNameRaw.includes("cosplay")) {
      throw new Error(
        `FORM_NOT_AVAILABLE_IN_GEN_1: ${attackerNameRaw} is not available in Gen ${generation}`,
      );
    }
    if (
      generation === 1 &&
      attackerNameRaw.includes("-") &&
      attackerNameRaw !== "pikachu"
    ) {
      if (attackerNameRaw.includes("cosplay")) {
        throw new Error(
          `FORM_NOT_AVAILABLE_IN_GEN_1: ${attackerNameRaw} is not available in Gen ${generation}`,
        );
      }
    }

    const gen = Generations.get(
      generation as unknown as import("@smogon/calc").GenerationNum,
    );

    const atkEvs = extractStatSet((attacker as { evs?: unknown }).evs);
    const defEvs = extractStatSet((defender as { evs?: unknown }).evs);
    const atkIvs = extractStatSet((attacker as { ivs?: unknown }).ivs);
    const defIvs = extractStatSet((defender as { ivs?: unknown }).ivs);

    const normalizeForSmogon = (
      s: string | null | undefined,
    ): string | undefined => {
      if (!s) return undefined;
      const id = normalizeId(s);
      if (!id || id === "none" || id === "no-item") return undefined;
      return id;
    };

    const atkPokemon = new Pokemon(
      gen,
      (attacker as IResolvedParticipant).name || "Attacker",
      {
        level: (attacker as IResolvedParticipant).level ?? 50,
        nature:
          (attacker as { nature?: { name?: string } }).nature?.name ||
          "Serious",
        evs: {
          hp: atkEvs.hp,
          atk: atkEvs.atk,
          def: atkEvs.def,
          spa: atkEvs.spa,
          spd: atkEvs.spd,
          spe: atkEvs.spe,
        },
        ivs: {
          hp: atkIvs.hp,
          atk: atkIvs.atk,
          def: atkIvs.def,
          spa: atkIvs.spa,
          spd: atkIvs.spd,
          spe: atkIvs.spe,
        },
        item: normalizeForSmogon((attacker as { item?: string | null }).item),
        ability: normalizeForSmogon(
          (attacker as { ability?: string | null }).ability,
        ),
        status:
          (attacker as { status?: string }).status &&
          (attacker as { status?: string }).status !== "none"
            ? ((attacker as { status?: string }).status as never)
            : undefined,
      },
    );

    const defPokemon = new Pokemon(
      gen,
      (defender as IResolvedParticipant).name || "Defender",
      {
        level: (defender as IResolvedParticipant).level ?? 50,
        nature:
          (defender as { nature?: { name?: string } }).nature?.name ||
          "Serious",
        evs: {
          hp: defEvs.hp,
          atk: defEvs.atk,
          def: defEvs.def,
          spa: defEvs.spa,
          spd: defEvs.spd,
          spe: defEvs.spe,
        },
        ivs: {
          hp: defIvs.hp,
          atk: defIvs.atk,
          def: defIvs.def,
          spa: defIvs.spa,
          spd: defIvs.spd,
          spe: defIvs.spe,
        },
        item: normalizeForSmogon((defender as { item?: string | null }).item),
        ability: normalizeForSmogon(
          (defender as { ability?: string | null }).ability,
        ),
        status:
          (defender as { status?: string }).status &&
          (defender as { status?: string }).status !== "none"
            ? ((defender as { status?: string }).status as never)
            : undefined,
      },
    );

    if ((attacker as { id?: number }).id === 292) {
      atkPokemon.rawStats.hp = 1;
      atkPokemon.stats.hp = 1;
    }
    if ((defender as { id?: number }).id === 292) {
      defPokemon.rawStats.hp = 1;
      defPokemon.stats.hp = 1;
    }

    const move = new Move(gen, normalizeId(moveId || moveName), {
      isCrit: Boolean((attacker as { isCriticalHit?: boolean }).isCriticalHit),
    });

    const field = new Field({
      weather:
        conditions.weather !== "none"
          ? (conditions.weather as never)
          : undefined,
      terrain:
        conditions.terrain !== "none"
          ? (conditions.terrain as never)
          : undefined,
      isGravity: false,
    });

    const result = calculate(gen, atkPokemon, defPokemon, move, field);

    const damages = result.damage as number[] | number;
    const min = Array.isArray(damages)
      ? Math.min(...damages)
      : (damages as number);
    const max = Array.isArray(damages)
      ? Math.max(...damages)
      : (damages as number);
    const defHp = defPokemon.stats.hp || 1;

    const isDamageZero =
      (typeof damages === "number" && damages === 0) ||
      (Array.isArray(damages) &&
        damages.length > 0 &&
        damages[0] === 0 &&
        damages[damages.length - 1] === 0);

    let desc: string;
    let moveDescStr: string;
    try {
      desc = result.desc();
      moveDescStr = result.moveDesc() || "";
    } catch {
      desc = isDamageZero ? "0x" : result.desc();
      moveDescStr = isDamageZero ? "0x" : "";
      if (!isDamageZero) {
        try {
          moveDescStr = result.moveDesc() || "";
        } catch {
          moveDescStr = "";
        }
      }
    }

    const isImmune =
      isDamageZero || moveDescStr.includes("0x") || desc.includes("0x");
    const effectiveness = isImmune ? 0 : 1;

    const activeModifiers: string[] = [];
    if (conditions.weather && conditions.weather !== "none") {
      activeModifiers.push(`WEATHER_${conditions.weather.toUpperCase()}`);
    }
    if (conditions.terrain && conditions.terrain !== "none") {
      activeModifiers.push(`TERRAIN_${conditions.terrain.toUpperCase()}`);
    }
    if (
      (attacker as { status?: string }).status &&
      (attacker as { status?: string }).status !== "none"
    ) {
      const s = String((attacker as { status?: string }).status)
        .toUpperCase()
        .replace("-", "_");
      activeModifiers.push(`STATUS_${s}`);
    }
    if (
      (defender as { status?: string }).status &&
      (defender as { status?: string }).status !== "none"
    ) {
      const s = String((defender as { status?: string }).status)
        .toUpperCase()
        .replace("-", "_");
      if (!activeModifiers.includes(`STATUS_${s}`))
        activeModifiers.push(`STATUS_${s}`);
    }
    if ((attacker as { isCriticalHit?: boolean }).isCriticalHit) {
      activeModifiers.push("CRITICAL_HIT");
    }

    let summary = "OK";
    if (isImmune) summary = "TYPE_IMMUNITY";

    const isOHKO = min >= defHp;

    return {
      damage: {
        minDamage: isImmune ? 0 : min,
        maxDamage: isImmune ? 0 : max,
        minPercent: isImmune ? 0 : (min / defHp) * 100,
        maxPercent: isImmune ? 0 : (max / defHp) * 100,
      },
      defenderMaxHp: defHp,
      effectiveness,
      isOHKO,
      explanation: {
        summary,
        activeModifiers,
        rawDesc: desc,
      },
      moveCategoryUsed: (move as { category?: string }).category || "Physical",
      koAnalysis: {
        guaranteed: desc.includes("guaranteed") || min / defHp >= 1,
        hitsToKO:
          min >= defHp ? 1 : max >= defHp ? 1 : Math.ceil(defHp / (max || 1)),
        probability: (() => {
          if (!Array.isArray(damages)) return min >= defHp ? 100 : 0;
          const koRolls = damages.filter((d) => d >= defHp).length;
          return (koRolls / damages.length) * 100;
        })(),
      },
      rawDesc: desc,
      desc,
    };
  }
}
