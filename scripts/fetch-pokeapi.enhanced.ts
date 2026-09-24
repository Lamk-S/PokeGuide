import fs from "fs";
import path from "path";
import { pokeApiPokemonSchema } from "../src/infrastructure/pokeapi/schemas/pokemon.schema";
import { mapPokeApiToPokemon } from "../src/infrastructure/pokeapi/mappers/pokemon.mapper";

const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";
const BATCH_SIZE = 20;
const DELAY_BETWEEN_BATCHES = 400;
const PAGE_LIMIT = 100;

interface PokemonListItem { name: string; url: string; }
interface CustomForm {
  id: number; name: string; types: string[];
  baseStats: Record<string, number>; height: number; weight: number;
  abilities: Array<{ name: string; isHidden: boolean; slot: number }>;
  moves: Array<{ name: string; learnMethod: string; levelLearnedAt: number }>;
  isCustom: boolean; inheritFrom: string;
}

async function fetchAllPokemonNames(): Promise<string[]> {
  const first = await fetch(`${POKEAPI_BASE_URL}/pokemon?limit=1&offset=0`);
  if (!first.ok) throw new Error(`No se pudo obtener count: ${first.status}`);
  const firstData = (await first.json()) as { count: number };
  console.log(`Total reportado por API: ${firstData.count}. Iniciando paginacion...`);
  const names: string[] = [];
  let nextUrl: string | null = `${POKEAPI_BASE_URL}/pokemon?limit=${PAGE_LIMIT}&offset=0`;
  while (nextUrl) {
    const res = await fetch(nextUrl);
    if (!res.ok) throw new Error(`Fallo paginacion: ${res.status} en ${nextUrl}`);
    const data = (await res.json()) as { results: PokemonListItem[]; next: string | null };
    for (const item of data.results) names.push(item.name);
    console.log(`Pagina: ${names.length} nombres acumulados`);
    nextUrl = data.next;
  }
  return names;
}

async function fetchAndMapPokemon(name: string) {
  try {
    const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${name}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const rawData = await response.json();
    const validDto = pokeApiPokemonSchema.parse(rawData);
    return mapPokeApiToPokemon(validDto);
  } catch (error) {
    console.error(`Error procesando ${name}:`, error);
    return null;
  }
}

function loadCustomForms(): CustomForm[] {
  const customPath = path.resolve(__dirname, "../data/pokemon/custom-forms.json");
  if (!fs.existsSync(customPath)) {
    console.log("No se encontro custom-forms.json, solo oficial");
    return [];
  }
  const raw = fs.readFileSync(customPath, "utf-8");
  return JSON.parse(raw) as CustomForm[];
}

function applyMoveInheritance(dataset: any[], overridesPath: string = "../data/moves/overrides.json") {
  const overridesFullPath = path.resolve(__dirname, overridesPath);
  let overrides: Record<string, { inheritMovesFrom: string }> = {};
  if (fs.existsSync(overridesFullPath)) {
    overrides = JSON.parse(fs.readFileSync(overridesFullPath, "utf-8"));
    console.log(`Cargados ${Object.keys(overrides).length} overrides`);
  }
  const nameToPokemon = new Map(dataset.map(p => [p.name, p]));
  for (const pokemon of dataset) {
    if (pokemon.moves.length === 0) {
      const override = overrides[pokemon.name];
      const inheritFrom = (pokemon as any).inheritFrom || override?.inheritMovesFrom;
      if (inheritFrom) {
        const base = nameToPokemon.get(inheritFrom) || dataset.find((p: any) => p.name.startsWith(inheritFrom + "-") || p.name === inheritFrom);
        if (base && base.moves.length > 0) {
          console.log(`  ${pokemon.name} (${pokemon.id}) hereda ${base.moves.length} movs de ${base.name}`);
          pokemon.moves = [...base.moves];
          (pokemon as any).movesSource = `inherited:${base.name}`;
        }
      }
    }
  }
  return dataset;
}

async function fetchAndNormalizePokemon(): Promise<void> {
  console.log("Iniciando pipeline Id-first...");
  const allNames = await fetchAllPokemonNames();
  console.log(`Encontrados ${allNames.length} recursos oficiales.`);
  const dataset: any[] = [];
  const seenIds = new Set<number>();
  const seenNames = new Set<string>();
  let processed = 0;
  for (let i = 0; i < allNames.length; i += BATCH_SIZE) {
    const batch = allNames.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map(fetchAndMapPokemon));
    for (const poke of results) {
      if (!poke) continue;
      if (typeof poke.id !== "number" || poke.id <= 0) continue;
      if (seenIds.has(poke.id) || seenNames.has(poke.name)) continue;
      seenIds.add(poke.id);
      seenNames.add(poke.name);
      dataset.push(poke);
      processed++;
      console.log(`  [${processed}/${allNames.length}] ${poke.id} - ${poke.name}`);
    }
    await new Promise((r) => setTimeout(r, DELAY_BETWEEN_BATCHES));
  }
  const customForms = loadCustomForms();
  for (const custom of customForms) {
    if (!seenIds.has(custom.id) && !seenNames.has(custom.name)) {
      const customAsPokemon = {
        id: custom.id, name: custom.name, types: custom.types,
        baseStats: custom.baseStats, height: custom.height, weight: custom.weight,
        abilities: custom.abilities, moves: custom.moves,
        inheritFrom: custom.inheritFrom, isCustom: true,
      };
      dataset.push(customAsPokemon);
      seenIds.add(custom.id);
      seenNames.add(custom.name);
      console.log(`  Custom: ${custom.id} - ${custom.name} (hereda de ${custom.inheritFrom})`);
    }
  }
  const finalDataset = applyMoveInheritance(dataset);
  console.log(`Validacion: ${finalDataset.length} registros`);
  const outPath = path.resolve(__dirname, "../data/pokemon/dataset.json");
  const fsExtra = await import("fs");
  fsExtra.mkdirSync(path.dirname(outPath), { recursive: true });
  fsExtra.writeFileSync(outPath, JSON.stringify(finalDataset, null, 2));
  console.log(`Guardado en ${outPath}`);
}

fetchAndNormalizePokemon().catch((e) => { console.error(e); process.exit(1); });
