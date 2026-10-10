import fs from "fs/promises";
import path from "path";
import { pokeApiPokemonSchema } from "../src/infrastructure/pokeapi/schemas/pokemon.schema";
import { mapPokeApiToPokemon } from "../src/infrastructure/pokeapi/mappers/pokemon.mapper";

const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";
const BATCH_SIZE = 20;
const DELAY_MS = 400;
const PAGE_LIMIT = 100;

const DATA_DIR = path.join(process.cwd(), "data/pokemon");
const DATASET_PATH = path.join(DATA_DIR, "dataset.json");
const DATASET_ES_PATH = path.join(DATA_DIR, "dataset.es.json");
const DATASET_OPT_PATH = path.join(DATA_DIR, "dataset.optimized.json");
const CUSTOM_FORMS_PATH = path.join(DATA_DIR, "custom-forms.json");
const INHERITANCE_PATH = path.join(DATA_DIR, "inheritance-index.json");

interface PokemonListItem { name: string; url: string; }
interface InheritanceMap { [form: string]: { inheritMovesFrom: string } }

async function fetchAllPokemonNames(): Promise<string[]> {
  console.log("[pokémon] Obteniendo total...");
  const first = await fetch(`${POKEAPI_BASE_URL}/pokemon?limit=1&offset=0`);
  if (!first.ok) throw new Error(`count ${first.status}`);
  const { count } = (await first.json()) as { count: number };
  console.log(`[pokémon] Total: ${count}`);

  const names: string[] = [];
  let nextUrl: string | null = `${POKEAPI_BASE_URL}/pokemon?limit=${PAGE_LIMIT}&offset=0`;
  while (nextUrl) {
    const res = await fetch(nextUrl);
    if (!res.ok) throw new Error(`paginación ${res.status}`);
    const data = (await res.json()) as { results: PokemonListItem[]; next: string | null };
    names.push(...data.results.map((r) => r.name));
    nextUrl = data.next;
  }
  return names;
}

async function fetchAndMapPokemon(name: string): Promise<any | null> {
  try {
    const res = await fetch(`${POKEAPI_BASE_URL}/pokemon/${name}`);
    if (!res.ok) return null;
    const dto = pokeApiPokemonSchema.parse(await res.json());
    return mapPokeApiToPokemon(dto);
  } catch {
    return null;
  }
}

async function main() {
  console.log("[pokémon] Pipeline profesional optimizado...");
  await fs.mkdir(DATA_DIR, { recursive: true });

  const allNames = await fetchAllPokemonNames();
  const dataset: any[] = [];
  const seenIds = new Set<number>();
  const seenNames = new Set<string>();

  for (let i = 0; i < allNames.length; i += BATCH_SIZE) {
    const batch = allNames.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map(fetchAndMapPokemon));
    for (const poke of results) {
      if (!poke || seenIds.has(poke.id) || seenNames.has(poke.name)) continue;
      seenIds.add(poke.id);
      seenNames.add(poke.name);
      dataset.push(poke);
    }
    await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  // Custom forms
  try {
    const customs = JSON.parse(await fs.readFile(CUSTOM_FORMS_PATH, "utf-8"));
    for (const c of customs) {
      if (!seenIds.has(c.id) && !seenNames.has(c.name)) {
        dataset.push({ ...c, isCustom: true });
        seenIds.add(c.id);
        seenNames.add(c.name);
      }
    }
    console.log(`[pokémon] +${customs.length} customs`);
  } catch {}

  // Herencia
  let inheritance: InheritanceMap = {};
  try {
    inheritance = JSON.parse(await fs.readFile(INHERITANCE_PATH, "utf-8"));
  } catch {}
  const byName = new Map(dataset.map((p: any) => [p.name, p]));
  for (const p of dataset) {
    if (!p.moves?.length) {
      const baseName = (p as any).inheritFrom || inheritance[p.name]?.inheritMovesFrom;
      const base = baseName ? byName.get(baseName) : null;
      if (base?.moves?.length) p.moves = [...base.moves];
    }
  }

  dataset.sort((a, b) => a.id - b.id);

  await fs.writeFile(DATASET_PATH, JSON.stringify(dataset, null, 2), "utf-8");
  await fs.writeFile(DATASET_ES_PATH, JSON.stringify(dataset, null, 2), "utf-8");
  console.log(`[pokémon] FULL: ${dataset.length} pokémon`);

  // OPTIMIZED REAL - para grilla
  const optimized = dataset.map((p: any) => ({
    id: p.id,
    name: p.name,
    nameEs: p.nameEs || p.name,
    types: p.types,
    bst: p.baseStats ? Object.values(p.baseStats as Record<string, number>).reduce((a: number, b: number) => a + b, 0) : 0,
    sprite: p.sprites?.front_default || p.sprite || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`,
    isCustom: p.isCustom || false,
  }));

  await fs.writeFile(DATASET_OPT_PATH, JSON.stringify(optimized, null, 2), "utf-8");
  console.log(`[pokémon] OPTIMIZED: ${optimized.length} pokémon - para grilla/listado`);
}

main().catch((e) => { console.error(e); process.exit(1); });