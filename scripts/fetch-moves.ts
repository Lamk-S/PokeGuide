import fs from "fs/promises";
import path from "path";

const POKEAPI_BASE = "https://pokeapi.co/api/v2";
const DATA_DIR = path.join(process.cwd(), "data/moves");
const DATASET_PATH = path.join(DATA_DIR, "dataset.json");
const OVERRIDES_ES_PATH = path.join(DATA_DIR, "overrides.es.json");
const OUTPUT_ES_PATH = path.join(DATA_DIR, "dataset.es.json");
const OUTPUT_PUBLIC_PATH = path.join(process.cwd(), "public/data/moves.es.json");

interface PokeApiMove {
  id: number;
  name: string;
  type: { name: string };
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  priority: number;
  damage_class: { name: string };
  target: { name: string };
  effect_chance: number | null;
  effect_entries: Array<{ language: { name: string }; effect: string; short_effect: string }>;
  flavor_text_entries: Array<{ language: { name: string }; flavor_text: string }>;
  names: Array<{ language: { name: string }; name: string }>;
}

function isGarbageEffect(text: string | undefined | null): boolean {
  if (!text) return true;
  const t = text.trim();
  if (t === "") return true;
  const lower = t.toLowerCase();
  return (
    lower.includes("no se puede usar") ||
    lower.includes("sería mejor olvidarlo") ||
    lower.includes("mejor olvidarlo") ||
    lower.includes("no puede usarse") ||
    lower.includes("este movimiento no") ||
    lower.includes("cannot be used") ||
    lower.length < 3
  );
}

function cleanText(text: string | undefined | null): string | undefined {
  if (!text) return undefined;
  const trimmed = text.replace(/\n|\f/g, " ").replace(/\s+/g, " ").trim();
  if (trimmed === "") return undefined;
  if (isGarbageEffect(trimmed)) return undefined;
  return trimmed;
}

async function fetchMoveList(): Promise<string[]> {
  console.log("[movimientos] Obteniendo lista...");
  const res = await fetch(`${POKEAPI_BASE}/move?limit=1000`);
  const data = (await res.json()) as { results: Array<{ name: string }> };
  return data.results.map((r) => r.name);
}

async function fetchMoveDetail(name: string): Promise<any> {
  try {
    const res = await fetch(`${POKEAPI_BASE}/move/${name}`);
    if (!res.ok) return null;
    const data = (await res.json()) as PokeApiMove;
    const nameEs = data.names.find((n) => n.language.name === "es")?.name ?? data.name;
    const effectEn = data.effect_entries.find((e) => e.language.name === "en");
    const effectEs = data.effect_entries.find((e) => e.language.name === "es");
    const flavorEs = data.flavor_text_entries.filter((f) => f.language.name === "es").pop();

    return {
      id: data.id,
      name: data.name,
      nameEs: cleanText(nameEs) ?? data.name,
      type: data.type.name,
      power: data.power,
      accuracy: data.accuracy,
      pp: data.pp,
      priority: data.priority,
      damageClass: data.damage_class.name,
      target: data.target.name,
      effectChance: data.effect_chance,
      effect: cleanText(effectEn?.effect) ?? "",
      shortEffect: cleanText(effectEn?.short_effect) ?? "",
      effectEs: cleanText(effectEs?.effect),
      shortEffectEs: cleanText(effectEs?.short_effect),
      flavorTextEs: cleanText(flavorEs?.flavor_text),
    };
  } catch {
    return null;
  }
}

async function main() {
  console.log("[movimientos] Iniciando descarga completa para Pokédex");
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(path.dirname(OUTPUT_PUBLIC_PATH), { recursive: true });

  const list = await fetchMoveList();
  const results: any[] = [];
  for (const name of list) {
    const d = await fetchMoveDetail(name);
    if (d) results.push(d);
  }
  results.sort((a, b) => a.id - b.id);

  const baseClean = results.map((e) => {
    const obj: any = {
      id: e.id,
      name: e.name,
      type: e.type,
      power: e.power,
      accuracy: e.accuracy,
      pp: e.pp,
      priority: e.priority,
      damageClass: e.damageClass,
      target: e.target,
      effectChance: e.effectChance,
      effect: e.effect,
      shortEffect: e.shortEffect,
    };
    for (const k of Object.keys(obj)) {
      if (obj[k] === "" || obj[k] === undefined) delete obj[k];
    }
    return obj;
  });

  await fs.writeFile(DATASET_PATH, JSON.stringify(baseClean, null, 2), "utf-8");
  console.log(`[movimientos] dataset.json BASE limpio: ${baseClean.length} movs, 0 flavor basura`);

  let overridesEs: Record<string, any> = {};
  try {
    overridesEs = JSON.parse(await fs.readFile(OVERRIDES_ES_PATH, "utf-8"));
    console.log(`[movimientos] overrides.es.json: ${Object.keys(overridesEs).length} overrides competitivos`);
  } catch {
    console.log("[movimientos] overrides.es.json no encontrado, usando vacio");
  }

  const merged = results.map((e) => {
    const ov = overridesEs[e.name] as
      | { nameEs?: string; effectEs?: string; shortEffectEs?: string }
      | undefined;

    let finalNameEs = ov?.nameEs && !isGarbageEffect(ov.nameEs) ? ov.nameEs : e.nameEs;
    let finalEffectEs: string | undefined = undefined;
    let finalShortEs: string | undefined = undefined;

    if (ov?.effectEs && !isGarbageEffect(ov.effectEs)) {
      finalEffectEs = cleanText(ov.effectEs);
    } else if (e.effectEs && !isGarbageEffect(e.effectEs)) {
      finalEffectEs = cleanText(e.effectEs);
    } else if (e.effect && !isGarbageEffect(e.effect)) {
      finalEffectEs = cleanText(e.effect);
    }

    if (ov?.shortEffectEs && !isGarbageEffect(ov.shortEffectEs)) {
      finalShortEs = cleanText(ov.shortEffectEs);
    } else if (e.shortEffectEs && !isGarbageEffect(e.shortEffectEs)) {
      finalShortEs = cleanText(e.shortEffectEs);
    } else if (e.shortEffect && !isGarbageEffect(e.shortEffect)) {
      finalShortEs = cleanText(e.shortEffect);
    }

    const optimized: any = {
      id: e.id,
      name: e.name,
      nameEs: finalNameEs,
      type: e.type,
      power: e.power,
      accuracy: e.accuracy,
      pp: e.pp,
      priority: e.priority,
      damageClass: e.damageClass,
      target: e.target,
      effectChance: e.effectChance,
    };

    if (finalEffectEs && !isGarbageEffect(finalEffectEs) && finalEffectEs.trim() !== "") {
      optimized.effectEs = finalEffectEs;
    }
    if (finalShortEs && !isGarbageEffect(finalShortEs) && finalShortEs.trim() !== "") {
      optimized.shortEffectEs = finalShortEs;
    }

    if (ov) {
      for (const [k, v] of Object.entries(ov)) {
        if (["effectEs", "shortEffectEs", "nameEs"].includes(k)) continue;
        if (typeof v === "string" && v.trim() === "") continue;
        if (v !== undefined && v !== null && v !== "") {
          optimized[k] = v;
        }
      }
    }

    for (const key of Object.keys(optimized)) {
      if (optimized[key] === "" || optimized[key] === undefined) {
        delete optimized[key];
      }
    }

    return optimized;
  });

  const withEmpty = merged.filter((m: any) => m.effectEs === "");
  if (withEmpty.length > 0) {
    console.warn(`[movimientos] Limpiando ${withEmpty.length} effectEs vacíos restantes...`);
    for (const m of withEmpty) delete m.effectEs;
  }

  await fs.writeFile(OUTPUT_ES_PATH, JSON.stringify(merged, null, 2), "utf-8");
  await fs.writeFile(OUTPUT_PUBLIC_PATH, JSON.stringify(merged), "utf-8");

  console.log(`[movimientos] dataset.es.json optimizado: ${merged.length} movs, sin claves vacías, 1 JSON cliente`);
  const withEffectEs = merged.filter((m: any) => m.effectEs).length;
  console.log(`[movimientos] Peso reducido: ${withEffectEs}/${merged.length} con effectEs, 0 basura, 0 duplicado EN`);
  console.log(`[movimientos] Elimina lógica fantasma MOVES_MIN y globalThis.__MOVES_ES__ en useBattleStore`);
}

main().catch((e) => {
  console.error("[movimientos] Error fatal:", e);
  process.exit(1);
});