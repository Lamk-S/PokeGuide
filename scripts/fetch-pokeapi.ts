import fs from "fs";
import path from "path";
import { pokeApiPokemonSchema } from "../src/infrastructure/pokeapi/schemas/pokemon.schema";
import { mapPokeApiToPokemon } from "../src/infrastructure/pokeapi/mappers/pokemon.mapper";

const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";
const BATCH_SIZE = 20;
const DELAY_BETWEEN_BATCHES = 400;
const PAGE_LIMIT = 100;

interface PokemonListItem {
  name: string;
  url: string;
}

async function fetchAllPokemonNames(): Promise<string[]> {
  const first = await fetch(`${POKEAPI_BASE_URL}/pokemon?limit=1&offset=0`);
  if (!first.ok) throw new Error(`No se pudo obtener count: ${first.status}`);
  const firstData = await first.json() as { count: number };
  console.log(`Total reportado por API: ${firstData.count}. Iniciando paginación...`);

  const names: string[] = [];
  let nextUrl: string | null = `${POKEAPI_BASE_URL}/pokemon?limit=${PAGE_LIMIT}&offset=0`;

  while (nextUrl) {
    const res = await fetch(nextUrl);
    if (!res.ok) throw new Error(`Fallo paginación: ${res.status} en ${nextUrl}`);
    const data = await res.json() as { results: PokemonListItem[]; next: string | null };
    for (const item of data.results) names.push(item.name);
    console.log(`Página: ${names.length} nombres acumulados`);
    nextUrl = data.next;
  }

  return names;
}

async function fetchAndNormalizePokemon(): Promise<void> {
  console.log("Iniciando pipeline Id-first (Ingestion -> Validation -> Normalization)...");
  const allNames = await fetchAllPokemonNames();
  console.log(`Encontrados ${allNames.length} recursos Pokémon.`);

  const dataset: unknown[] = [];
  const seenIds = new Set<number>();
  const seenNames = new Set<string>();
  let processed = 0;

  for (let i = 0; i < allNames.length; i += BATCH_SIZE) {
    const batch = allNames.slice(i, i + BATCH_SIZE);
    const promises = batch.map(async (name) => {
      try {
        const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${name}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const rawData = await response.json();
        const validDto = pokeApiPokemonSchema.parse(rawData);
        return mapPokeApiToPokemon(validDto);
      } catch (error) {
        console.error(`❌ Error procesando ${name}:`, error);
        return null;
      }
    });

    const results = await Promise.all(promises);
    for (const poke of results) {
      if (!poke) continue;
      if (typeof poke.id!== "number" || poke.id <= 0) {
        console.error(`❌ ID inválido para ${poke.name}`);
        continue;
      }
      if (seenIds.has(poke.id)) {
        console.error(`❌ ID duplicado detectado: ${poke.id} (${poke.name})`);
        continue;
      }
      if (seenNames.has(poke.name)) {
        console.error(`❌ Nombre duplicado detectado: ${poke.name} (ID ${poke.id})`);
        continue;
      }
      seenIds.add(poke.id);
      seenNames.add(poke.name);
      dataset.push(poke);
      processed++;
      console.log(`✅ [${processed}/${allNames.length}] ${poke.id} - ${poke.name}`);
    }
    await new Promise((r) => setTimeout(r, DELAY_BETWEEN_BATCHES));
  }

  console.log(`Validación: ${dataset.length} registros únicos, ${seenIds.size} IDs únicos`);
  const outPath = path.resolve(__dirname, "../data/pokemon/dataset.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(dataset, null, 2));
  console.log(`Dataset guardado en ${outPath}`);
}

fetchAndNormalizePokemon().catch((e) => {
  console.error(e);
  process.exit(1);
});