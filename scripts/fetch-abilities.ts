import fs from "fs/promises";
import path from "path";

const POKEAPI_BASE = "https://pokeapi.co/api/v2";
const DATA_DIR = path.join(process.cwd(), "data/abilities");
const DATASET_PATH = path.join(DATA_DIR, "dataset.json");
const OVERRIDES_PATH = path.join(DATA_DIR, "overrides.es.json");
const OUTPUT_ES_PATH = path.join(DATA_DIR, "dataset.es.json");

interface PokeApiAbility {
  name: string;
  effect_entries: Array<{ language: { name: string }; effect: string; short_effect: string }>;
  names: Array<{ language: { name: string }; name: string }>;
}

async function fetchAbilityList(): Promise<string[]> {
  const res = await fetch(`${POKEAPI_BASE}/ability?limit=400`);
  const data = (await res.json()) as { results: { name: string }[] };
  return data.results.map((r) => r.name);
}

async function fetchAbilityDetail(name: string) {
  try {
    const res = await fetch(`${POKEAPI_BASE}/ability/${name}`);
    if (!res.ok) {
      console.warn(`[habilidades] no se pudo obtener ${name}: ${res.status}`);
      return null;
    }
    const data = (await res.json()) as PokeApiAbility;
    const effectEn =
      data.effect_entries.find((e) => e.language.name === "en")?.effect?.trim() ??
      data.effect_entries.find((e) => e.language.name === "en")?.short_effect?.trim() ??
      "";
    const effectEsRaw =
      data.effect_entries.find((e) => e.language.name === "es")?.effect?.trim() ??
      data.effect_entries.find((e) => e.language.name === "es")?.short_effect?.trim() ??
      "";
    const nameEs = data.names.find((n) => n.language.name === "es")?.name ?? data.name;

    if (!effectEn && !effectEsRaw) {
      console.log(`[habilidades] [omitido vacío] ${name}`);
      return null;
    }

    return {
      name: data.name,
      nameEs,
      effect: effectEn,
      effectEs: effectEsRaw || "",
    };
  } catch (e) {
    console.warn(`[habilidades] error ${name}`, e);
    return null;
  }
}

async function main() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const list = await fetchAbilityList();
  console.log(`[habilidades] PokeAPI: ${list.length} habilidades`);

  const results = [];
  let conEs = 0;
  for (const name of list) {
    const d = await fetchAbilityDetail(name);
    if (!d) continue;
    if (d.effectEs) conEs++;
    results.push(d);
  }

  results.sort((a, b) => a.name.localeCompare(b.name));
  await fs.writeFile(DATASET_PATH, JSON.stringify(results, null, 2), "utf-8");
  console.log(`[habilidades] dataset.json: ${results.length} (${conEs} con ES)`);

  let overrides: Record<string, any> = {};
  try {
    overrides = JSON.parse(await fs.readFile(OVERRIDES_PATH, "utf-8"));
    console.log(`[habilidades] overrides.es.json: ${Object.keys(overrides).length} traducciones`);
  } catch {}

  const merged = results.map((e) => {
    const ov = overrides[e.name];
    let effectEs = e.effectEs;
    if (!effectEs && ov) effectEs = typeof ov === "string" ? ov : ov.effectEs ?? "";
    if (!effectEs) effectEs = e.effect || "Efecto no disponible";
    if (typeof ov === "string") return { ...e, effectEs: ov };
    if (ov) return { ...e, ...ov, effectEs };
    return { ...e, effectEs };
  });

  await fs.writeFile(OUTPUT_ES_PATH, JSON.stringify(merged, null, 2), "utf-8");
  console.log(`[habilidades] dataset.es.json listo: ${merged.length} habilidades, 1 JSON cliente`);
}

main().catch((e) => {
  console.error("[habilidades] Error fatal:", e);
  process.exit(1);
});