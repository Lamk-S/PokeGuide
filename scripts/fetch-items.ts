import fs from "fs/promises";
import path from "path";

const POKEAPI_BASE = "https://pokeapi.co/api/v2";
const DATA_DIR = path.join(process.cwd(), "data/items");
const DATASET_PATH = path.join(DATA_DIR, "dataset.json");
const WHITELIST_PATH = path.join(DATA_DIR, "whitelist.json");
const OVERRIDES_PATH = path.join(DATA_DIR, "overrides.es.json");
const OUTPUT_ES_PATH = path.join(DATA_DIR, "dataset.es.json");

interface PokeApiItem {
  name: string;
  effect_entries: Array<{ language: { name: string }; effect: string; short_effect: string }>;
  names: Array<{ language: { name: string }; name: string }>;
}

async function cargarWhitelist(): Promise<Set<string>> {
  const contenido = await fs.readFile(WHITELIST_PATH, "utf-8");
  const lista = JSON.parse(contenido) as string[];
  console.log(`[objetos] lista blanca: ${lista.length} objetos permitidos`);
  return new Set(lista);
}

async function fetchItemDetail(name: string): Promise<any> {
  try {
    const res = await fetch(`${POKEAPI_BASE}/item/${name}`);
    if (!res.ok) return null;
    const data = (await res.json()) as PokeApiItem;
    const effectEn = data.effect_entries.find((e) => e.language.name === "en")?.effect ?? data.effect_entries.find((e) => e.language.name === "en")?.short_effect ?? "";
    const effectEs = data.effect_entries.find((e) => e.language.name === "es")?.effect ?? data.effect_entries.find((e) => e.language.name === "es")?.short_effect ?? "";
    const nameEs = data.names.find((n) => n.language.name === "es")?.name ?? data.name;
    if (!effectEn && !effectEs) return null;
    return { name: data.name, nameEs, effect: effectEn.trim(), effectEs: effectEs.trim() || "" };
  } catch {
    return null;
  }
}

async function main() {
  console.log("[objetos] Iniciando descarga filtrada (competitivo + lore)...");
  await fs.mkdir(DATA_DIR, { recursive: true });
  const whitelist = await cargarWhitelist();
  const results: any[] = [];
  let conEs = 0;
  for (const name of whitelist) {
    const d = await fetchItemDetail(name);
    if (!d) continue;
    if (d.effectEs) conEs++;
    results.push(d);
  }
  results.sort((a, b) => a.name.localeCompare(b.name));
  await fs.writeFile(DATASET_PATH, JSON.stringify(results, null, 2), "utf-8");
  console.log(`[objetos] dataset.json: ${results.length} válidos (${conEs} con ES)`);

  let overrides: Record<string, any> = {};
  try {
    overrides = JSON.parse(await fs.readFile(OVERRIDES_PATH, "utf-8"));
    console.log(`[objetos] overrides.es.json: ${Object.keys(overrides).length} traducciones`);
  } catch {}

  const merged = results.map((e) => {
    const ov = overrides[e.name];
    let effectEs = e.effectEs;
    if (!effectEs && ov) effectEs = typeof ov === "string" ? ov : ov.effectEs ?? ov.effect ?? "";
    if (!effectEs) effectEs = e.effect || "Efecto no disponible";
    if (typeof ov === "string") return { ...e, effectEs: ov };
    if (ov) return { ...e, ...ov, effectEs };
    return { ...e, effectEs };
  });

  await fs.writeFile(OUTPUT_ES_PATH, JSON.stringify(merged, null, 2), "utf-8");
  console.log(`[objetos] dataset.es.json listo: ${merged.length} items competitivos, 1 JSON cliente`);
}

main().catch((e) => {
  console.error("[objetos] Error fatal:", e);
  process.exit(1);
});