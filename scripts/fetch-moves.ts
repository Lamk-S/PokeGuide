import fs from "fs/promises";
import path from "path";

const POKEAPI_BASE = "https://pokeapi.co/api/v2";
const DATA_DIR = path.join(process.cwd(), "data/moves");
const DATASET_PATH = path.join(DATA_DIR, "dataset.json");
const OVERRIDES_ES_PATH = path.join(DATA_DIR, "overrides.es.json");
const OUTPUT_ES_PATH = path.join(DATA_DIR, "dataset.es.json");

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
      nameEs,
      type: data.type.name,
      power: data.power,
      accuracy: data.accuracy,
      pp: data.pp,
      priority: data.priority,
      damageClass: data.damage_class.name,
      target: data.target.name,
      effectChance: data.effect_chance,
      effect: effectEn?.effect ?? "",
      shortEffect: effectEn?.short_effect ?? "",
      effectEs: effectEs?.effect ?? "",
      shortEffectEs: effectEs?.short_effect ?? "",
      flavorTextEs: flavorEs?.flavor_text?.replace(/\n|\f/g, " ") ?? "",
    };
  } catch {
    return null;
  }
}

async function main() {
  console.log("[movimientos] Iniciando descarga completa para Pokédex...");
  await fs.mkdir(DATA_DIR, { recursive: true });
  const list = await fetchMoveList();
  const results: any[] = [];
  for (const name of list) {
    const d = await fetchMoveDetail(name);
    if (d) results.push(d);
  }
  results.sort((a, b) => a.id - b.id);
  await fs.writeFile(DATASET_PATH, JSON.stringify(results, null, 2), "utf-8");
  console.log(`[movimientos] dataset.json: ${results.length} movimientos`);

  let overridesEs: Record<string, any> = {};
  try {
    overridesEs = JSON.parse(await fs.readFile(OVERRIDES_ES_PATH, "utf-8"));
    console.log(`[movimientos] overrides.es.json: ${Object.keys(overridesEs).length} traducciones`);
  } catch {}

  const merged = results.map((e) => {
    const ov = overridesEs[e.name];
    if (!ov) return { ...e, effectEs: e.effectEs || e.effect || "", shortEffectEs: e.shortEffectEs || e.shortEffect || "" };
    return {
      ...e,
      ...ov,
      nameEs: ov.nameEs || e.nameEs,
      effectEs: ov.effectEs || e.effectEs || e.effect || "",
      shortEffectEs: ov.shortEffectEs || e.shortEffectEs || e.shortEffect || "",
    };
  });

  await fs.writeFile(OUTPUT_ES_PATH, JSON.stringify(merged, null, 2), "utf-8");
  console.log(`[movimientos] dataset.es.json listo: ${merged.length} movimientos, 1 JSON cliente`);
}

main().catch((e) => {
  console.error("[movimientos] Error fatal:", e);
  process.exit(1);
});